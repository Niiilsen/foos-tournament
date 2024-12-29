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

        console.log({...data, players});
        return {...data, players}; // Return Tournament with Player array
    } catch (err) {
        console.error("Database Error:", err);
        throw new Error("Failed to fetch tournament.");
    }
}

export async function searchPlayers(query: string) {
    if (!query) return [];
    return prisma.player.findMany({
        where: {
            name: {
                contains: query,
                mode: "insensitive",
            },
        },
        select: {
            id: true,
            name: true,
        },
    });
}

export async function addPlayerToTournament(tournamentId: string, playerId: string) {
    await prisma.tournamentPlayer.create({
        data: {
            tournamentId,
            playerId,
        },
    });
}
