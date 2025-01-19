'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {CreateTournamentSchema} from "@/app/lib/schema";
import {prisma} from "@/lib/prisma";
import {fetchTournamentById, IFormattedGroup} from "@/app/lib/tournaments/data";

export type State = {
    errors?: {
        name?: string[];
        gameType?: string[];
        startDate?: string[];
        endDate?: string[];
    };
    message?: string | null;
};

export async function createTournament(prevState: State, formData: FormData) {
    // Extract relevant fields from the formData
    const relevantFields = {
        name: formData.get('name'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        gameType: formData.get('gameType'),
    };

    const validatedFields = CreateTournamentSchema.safeParse(relevantFields);

    // Handle validation as before
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Tournament.',
        };
    }

    // Proceed with your logic
    const { name, startDate, endDate, gameType } = validatedFields.data;
    try {
        await prisma.tournament.create({
            data: {
                id: crypto.randomUUID(),
                name: name,
                startDate: startDate,
                endDate: endDate,
                maxPlayers: 16, 
                gameType: gameType
            }
        })
    } catch (error) {
        console.log(error);
        return { message: 'Database Error: Failed to Create Tournament.' };
    }

    revalidatePath(`/tournaments`);
    redirect('/tournaments');
}

export async function createBalancedGroupsForTournament(tournamentId: string,playerIds: string[]) {
    // Step 1: Shuffle player IDs for random group assignment
    const shuffledPlayerIds = [...playerIds].sort(() => Math.random() - 0.5);

    // Step 2: Create as many 4-player groups as possible
    const groups = [];
    while (shuffledPlayerIds.length >= 4) {
        groups.push(shuffledPlayerIds.splice(0, 4));
    }

    // Step 3: Distribute remaining players to balance groups (max 6 players per group)
    while (shuffledPlayerIds.length > 0) {
        for (let i = 0; i < groups.length && shuffledPlayerIds.length > 0; i++) {
            if (groups[i].length < 6) {
                groups[i].push(shuffledPlayerIds.shift()!);
            }
        }
    }

    // Step 4: Create groups in the database and add members
    const groupRecords = [];
    for (let i = 0; i < groups.length; i++) {
        const groupName = `Group ${i + 1}`;
        const group = await prisma.group.create({
            data: {
                groupName,
                tournamentId,
                round: 1, // Default round for now
            },
        });

        // Create GroupMembers for each player in the group
        const groupMembers = groups[i].map((playerId) => ({
            groupId: group.id,
            playerId,
        }));

        await prisma.groupMember.createMany({
            data: groupMembers,
        });

        groupRecords.push(group);
    }

    return groupRecords;
}

export async function generateTournamentGroups(tournamentId: string)  {
    await deleteExistingGroups(tournamentId);
    
    const tournament = await fetchTournamentById(tournamentId, true);
    const playerIds = tournament.players.map((player) => player.id);
    const groups = await createBalancedGroupsForTournament(tournamentId, playerIds);
    console.log(groups);
    
    revalidatePath(`/tournaments/${tournamentId}/edit`);
    redirect(`/tournaments/${tournamentId}/edit`);
}

export async function deleteExistingGroups(tournamentId: string) {
    try {
        // Start a transaction to ensure data consistency
        await prisma.$transaction(async (prisma) => {
            // Find all group IDs for the specified tournament
            const groupIds = await prisma.group.findMany({
                where: { tournamentId },
                select: { id: true },
            });

            const groupIdsArray = groupIds.map((group) => group.id);

            if (groupIdsArray.length > 0) {
                // Delete related group rankings
                await prisma.groupRanking.deleteMany({
                    where: {
                        groupId: { in: groupIdsArray },
                    },
                });

                // Delete related group members
                await prisma.groupMember.deleteMany({
                    where: {
                        groupId: { in: groupIdsArray },
                    },
                });

                // Delete groups themselves
                await prisma.group.deleteMany({
                    where: {
                        id: { in: groupIdsArray },
                    },
                });
            }

            console.log(`Deleted ${groupIdsArray.length} groups and related data for tournament ${tournamentId}`);
        });

        return { success: true, message: "Groups and related data successfully deleted." };
    } catch (error) {
        console.error("Error regenerating groups:", error);
        throw new Error("Failed to regenerate groups. Please try again.");
    }
}

const getGroupsWithPlayersByTournament = async (tournamentId: string) => {
    try {
        const groups = await prisma.group.findMany({
            where: { tournamentId }, // Filter groups by the specified tournamentId
            include: {
                members: {
                    include: {
                        player: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
            },
        });

        // Format groups with their players
        return groups.map((group) => ({
            id: group.id,
            name: group.groupName,
            players: group.members.map((member) => member.player),
        }));
    } catch (error) {
        console.error("Error fetching groups with players:", error);
        throw new Error("Failed to fetch groups and their players.");
    }
};


export async function generateMatches(tournamentId: string)  {

    const groups = await getGroupsWithPlayersByTournament(tournamentId);
    groups.map(async (group) => {
        await deleteMatchesForGroup(tournamentId, group.id);
        const groupPlayers = group.players.map((player) => player.id);
        const matches = await generateMatchesForGroup(tournamentId, group.id, groupPlayers);
        console.log(matches);
    })
    console.log(groups);

    revalidatePath(`/tournaments/${tournamentId}/edit`);
    redirect(`/tournaments/${tournamentId}/edit`);
}

// Helper to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Randomize match preset
function randomizePreset(preset: { team1: number[]; team2: number[] }[]): { team1: number[]; team2: number[] }[] {
    const randomized = preset.map((match) => {
        // Randomize player order within each team
        const randomizedTeam1 = Math.random() > 0.5 ? match.team1 : [match.team1[1], match.team1[0]];
        const randomizedTeam2 = Math.random() > 0.5 ? match.team2 : [match.team2[1], match.team2[0]];

        // Randomly swap team1 and team2
        if (Math.random() > 0.5) {
            return { team1: randomizedTeam2, team2: randomizedTeam1 };
        } else {
            return { team1: randomizedTeam1, team2: randomizedTeam2 };
        }
    });

    // Shuffle the order of matches
    for (let i = randomized.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [randomized[i], randomized[j]] = [randomized[j], randomized[i]];
    }

    return randomized;
}

// Presets
const fourPlayerGroupPreset = [
    { team1: [1, 2], team2: [3, 4] },
    { team1: [3, 1], team2: [4, 2] },
    { team1: [2, 3], team2: [1, 4] },
    { team1: [1, 4], team2: [2, 3] },
];

const fivePlayerGroupPreset = [
    { team1: [1, 2], team2: [3, 4] },
    { team1: [1, 3], team2: [4, 5] },
    { team1: [2, 5], team2: [1, 4] },
    { team1: [2, 3], team2: [1, 5] },
    { team1: [2, 4], team2: [3, 5] },
];

const sixPlayerGroupPreset = [
    { team1: [1, 2], team2: [3, 4] },
    { team1: [1, 3], team2: [5, 6] },
    { team1: [5, 4], team2: [2, 6] },
    { team1: [1, 4], team2: [6, 3] },
    { team1: [5, 2], team2: [6, 4] },
    { team1: [1, 5], team2: [2, 3] },
];



async function generateMatchesForGroup(tournamentId: string, groupId: string, players: string[]) {
    const shuffledPlayers = shuffleArray([...players]); // Shuffle players to randomize the order

    // Determine the preset based on the number of players
    const preset =
        players.length === 5
            ? randomizePreset(fivePlayerGroupPreset)
            : players.length === 6
                ? randomizePreset(sixPlayerGroupPreset)
                : randomizePreset(fourPlayerGroupPreset);

    // Helper to find or create a team
    const findOrCreateTeam = async (player1Id: string, player2Id: string) => {
        // Normalize the player IDs (sort them)
        const [normalizedPlayer1, normalizedPlayer2] = [player1Id, player2Id].sort();

        // Check if the team already exists by ensuring both players are part of the team
        const existingTeam = await prisma.team.findFirst({
            where: {
                players: {
                    every: {
                        OR: [
                            { player_id: normalizedPlayer1 },
                            { player_id: normalizedPlayer2 },
                        ],
                    },
                },
            },
        });

        if (existingTeam) {
            return existingTeam;
        }

        // Create the team if it doesn't exist
        return prisma.team.create({
            data: {
                name: `Team ${normalizedPlayer1}-${normalizedPlayer2}`, // Generate a unique name based on members
                players: {
                    create: [
                        { player: { connect: { id: normalizedPlayer1 } } },
                        { player: { connect: { id: normalizedPlayer2 } } },
                    ],
                },
            },
        });
    };

    // Generate matches and their respective teams
    const createdMatches = await Promise.all(
        preset.map(async (row) => {
            // Find or create the home team
            const homeTeam = await findOrCreateTeam(
                shuffledPlayers[row.team1[0] - 1],
                shuffledPlayers[row.team1[1] - 1]
            );

            // Find or create the away team
            const awayTeam = await findOrCreateTeam(
                shuffledPlayers[row.team2[0] - 1],
                shuffledPlayers[row.team2[1] - 1]
            );

            // Create the match referencing the home and away teams
            return prisma.match.create({
                data: {
                    tournamentId,
                    groupId,
                    homeTeamId: homeTeam.id,
                    awayTeamId: awayTeam.id,
                    homeScore: 0,
                    awayScore: 0,
                    isPlayed: false,
                    stage: "Group Stage", // Provide a value for the stage field
                    matchDatetime: new Date(), // Provide a value for the matchDatetime field
                },
                include: {
                    homeTeam: true,
                    awayTeam: true,
                },
            });
        })
    );

    return createdMatches;
}


async function deleteMatchesForGroup(tournamentId: string, groupId: string) {
    try {
        // Step 1: Fetch all match IDs for the group
        const matches = await prisma.match.findMany({
            where: { tournamentId, groupId },
            select: { id: true, homeTeamId: true, awayTeamId: true },
        });

        if (matches.length === 0) {
            console.log("No matches found to delete for the specified group.");
            return;
        }

        // Extract team IDs to clean up associated teams later
        const homeTeamIds = matches.map((match) => match.homeTeamId);
        const awayTeamIds = matches.map((match) => match.awayTeamId);
        const teamIds = Array.from(new Set([...homeTeamIds, ...awayTeamIds])); // Deduplicate team IDs

        // Step 2: Delete matches
        await prisma.match.deleteMany({
            where: {
                id: {
                    in: matches.map((match) => match.id),
                },
            },
        });

        console.log(`Deleted ${matches.length} matches for group ${groupId}.`);

        // Step 3: Delete associated team players (TeamPlayer entries)
        await prisma.teamPlayer.deleteMany({
            where: {
                team_id: {
                    in: teamIds,
                },
            },
        });

        console.log(`Deleted all team player entries associated with the matches.`);

        // Step 4: Delete teams
        await prisma.team.deleteMany({
            where: {
                id: {
                    in: teamIds,
                },
            },
        });

        console.log(`Deleted ${teamIds.length} teams associated with the matches.`);
    } catch (error) {
        console.error("Error deleting match-related data:", error);
        throw new Error("Failed to delete match-related data.");
    }
}

export async function saveEditedGroups(tournamentId: string, updatedGroups: IFormattedGroup[]) {
    try {
        await prisma.$transaction(async (tx) => {
            // Step 1: Delete existing groups and their members
            await tx.groupMember.deleteMany({
                where: {
                    group: {
                        tournamentId,
                    },
                },
            });

            await tx.group.deleteMany({
                where: {
                    tournamentId,
                },
            });

            // Step 2: Insert updated groups and their members
            for (const group of updatedGroups) {
                // Create the group
                const newGroup = await tx.group.create({
                    data: {
                        id: group.id, // Use the existing group ID if provided
                        groupName: group.name,
                        tournamentId,
                        round: 1, // Set default round or adjust as needed
                    },
                });

                // Add players to the group
                const groupMembers = group.players.map((player) => ({
                    groupId: newGroup.id,
                    playerId: player.id,
                }));

                await tx.groupMember.createMany({
                    data: groupMembers,
                });
            }
        });

        console.log("Groups successfully updated");
    } catch (error) {
        console.error("Error saving edited groups:", error);
        throw new Error("Failed to save edited groups.");
    }
}


