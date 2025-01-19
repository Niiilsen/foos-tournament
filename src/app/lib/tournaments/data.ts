import {prisma} from "@/lib/prisma";

export async function fetchAllTournaments() {
    try {
        const data = await prisma.tournament.findMany();

        return data;

    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch tournaments.');
    }
}

export async function fetchTournamentById(id: string, includePlayers: boolean = false) {
    try {
        const data = await prisma.tournament.findUnique({
            where: {id},
            include: {
                players: {
                    include: {
                        player: {
                            select: {
                                id: true,
                                name: true,
                            }, // Fetch the related Player object
                        },
                    },
                },
            },
        });

        if (!data) {
            throw new Error("Tournament was not found.");
        }

        // If includePlayers is true, extract the Player objects from TournamentPlayer
        const players = includePlayers
            ? data.players.map((tournamentPlayer) => tournamentPlayer.player)
            : [];

        return {...data, players}; // Return Tournament with Player array
    } catch (err) {
        console.error("Database Error:", err);
        throw new Error("Failed to fetch tournament.");
    }
}

export async function fetchTournamentPlayersById(id: string) {
    try {
        const data = await prisma.tournamentPlayer.findMany({
            where: {tournamentId: id},
            include: {
                player: {
                    select: {
                        id: true,
                        name: true,
                    }, // Fetch the related Player object
                },
            },
        });
        console.log("data", data);
        if(data.length === 0){
            return [];
        }
        if (!data) {
            throw new Error("Tournament players was not found.");
        }

        const players = data?.map((tournamentPlayer) => tournamentPlayer.player);
        console.log("players", players);
        
        // If includePlayers is true, extract the Player objects from TournamentPlayer
        return players; // Return Tournament with Player array
    } catch (err) {
        console.error("Database Error:", err);
        throw new Error("Failed to fetch tournament players.");
    }
}

export async function fetchGroupsWithPlayers(tournamentId: string) {
    try {
        const groups = await prisma.group.findMany({
            where: {tournamentId},
            include: {
                members: {
                    include: {
                        player: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        // Format groups with their players
        const formattedGroups: IFormattedGroup[] = groups.map((group) => ({
            id: group.id,
            name: group.groupName,
            players: group.members.map((member) => member.player),
        }));

        return formattedGroups;
    } catch (error) {
        console.error("Error fetching groups with players:", error);
        throw new Error("Failed to fetch groups and their players.");
    }
}

export async function getMatchesForTournament(tournamentId: string) {
    try {
        const matches = await prisma.match.findMany({
            where: { tournamentId },
            include: {
                homeTeam: {
                    include: {
                        players: {
                            include: {
                                player: {
                                    select: {
                                        id: true,
                                        name: true, // Include player name
                                    },
                                },
                            },
                        },
                    },
                },
                awayTeam: {
                    include: {
                        players: {
                            include: {
                                player: {
                                    select: {
                                        id: true,
                                        name: true, // Include player name
                                    },
                                },
                            },
                        },
                    },
                },
                group: {
                    select: {
                        id: true,
                        groupName: true, // Include group name
                    },
                },
                tournament: {
                    select: {
                        id: true,
                        name: true, // Include tournament name
                    },
                },
            },
        });

        // Format matches for easier consumption
        const formattedMatches: IFormattedMatch[] = matches.map((match) => ({
            id: match.id,
            tournament: match.tournament,
            stage: match.stage,
            matchDatetime: match.matchDatetime,
            homeTeam: match.homeTeam.players.map((teamPlayer) => teamPlayer.player),
            awayTeam: match.awayTeam.players.map((teamPlayer) => teamPlayer.player),
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            isPlayed: match.isPlayed,
            group: match.group, // Include group information
        }));

        return formattedMatches;
    } catch (error) {
        console.error("Error fetching matches for tournament:", error);
        throw new Error("Failed to fetch matches for the tournament.");
    }
}

export async function getGamesForPlayer(playerId: string) {
    try {
        const games = await prisma.match.findMany({
            where: {
                OR: [
                    {
                        homeTeam: {
                            players: {
                                some: {
                                    player_id: playerId,
                                },
                            },
                        },
                    },
                    {
                        awayTeam: {
                            players: {
                                some: {
                                    player_id: playerId,
                                },
                            },
                        },
                    },
                ],
            },
            include: {
                homeTeam: {
                    include: {
                        players: {
                            include: {
                                player: {
                                    select: {
                                        id: true,
                                        name: true, // Include player name
                                    },
                                },
                            },
                        },
                    },
                },
                awayTeam: {
                    include: {
                        players: {
                            include: {
                                player: {
                                    select: {
                                        id: true,
                                        name: true, // Include player name
                                    },
                                },
                            },
                        },
                    },
                },
                tournament: {
                    select: {
                        id: true,
                        name: true, // Include tournament name
                    },
                },
            },
        });

        // Format the games for easier consumption
        const formattedGames: IFormattedMatch[] = games.map((game) => ({
            id: game.id,
            tournament: game.tournament, // Include tournament info
            group: null,
            stage: game.stage,
            matchDatetime: game.matchDatetime,
            homeTeam: game.homeTeam.players.map((teamPlayer) => teamPlayer.player),
            awayTeam: game.awayTeam.players.map((teamPlayer) => teamPlayer.player),
            homeScore: game.homeScore,
            awayScore: game.awayScore,
            isPlayed: game.isPlayed,
            isPlayerOnHomeTeam: game.homeTeam.players.some(
                (teamPlayer) => teamPlayer.player.id === playerId
            ),
        }));

        return formattedGames;
    } catch (error) {
        console.error("Error fetching games for player:", error);
        throw new Error("Failed to fetch games for the player.");
    }
}

export async function getMatchesForGroup(groupId: string): Promise<IFormattedMatch[]> {
    try {
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                matches: {
                    include: {
                        tournament: {
                            select: {
                                id: true,
                                name: true, // Include tournament info
                            },
                        },
                        homeTeam: {
                            include: {
                                players: {
                                    include: {
                                        player: {
                                            select: {
                                                id: true,
                                                name: true, // Include player name
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        awayTeam: {
                            include: {
                                players: {
                                    include: {
                                        player: {
                                            select: {
                                                id: true,
                                                name: true, // Include player name
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!group) {
            throw new Error("Group not found");
        }

        // Format matches according to the FormattedMatch interface
        const formattedMatches: IFormattedMatch[] = group.matches.map((match) => ({
            id: match.id,
            tournament: match.tournament,
            group: {
                id: group.id,
                groupName: group.groupName,
            },
            stage: match.stage,
            matchDatetime: match.matchDatetime,
            homeTeam: match.homeTeam.players.map((teamPlayer) => ({
                id: teamPlayer.player.id,
                name: teamPlayer.player.name,
            })),
            awayTeam: match.awayTeam.players.map((teamPlayer) => ({
                id: teamPlayer.player.id,
                name: teamPlayer.player.name,
            })),
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            isPlayed: match.isPlayed,
        }));

        return formattedMatches;
    } catch (error) {
        console.error("Error fetching matches for group:", error);
        throw new Error("Failed to fetch matches for the group.");
    }
}

export interface IFormattedGroup {
    id: string;
    name: string;
    players: ISimplePlayer[];
}

export interface ISimplePlayer {
    id: string;
    name: string;
}

export interface IFormattedMatch {
    id: string;
    tournament: {id: string, name: string};
    group: { id: string; groupName: string; } | null;
    stage: string;
    matchDatetime: Date;
    homeTeam: { id: string, name: string }[];
    awayTeam: { id: string, name: string }[];
    homeScore: number;
    awayScore: number;
    isPlayed: boolean;
    isPlayerOnHomeTeam?: boolean;
}



