import {sql} from "@vercel/postgres";
import { prisma } from '@/lib/prisma';

export async function fetchPlayers() {
    try {
        const data = await prisma.player.findMany()

        console.log(data);
        return data;
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch all players.');
    }
}



export async function fetchPlayerById(id: string) {
    try {
        const data = prisma.player.findFirst({
            where: {
                id: id
            }
        })

        if (!data) {
            throw new Error('Player not found or has no matches.');
        }
        
        return data;

    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch player and matches.');
    }
}

export async function fetchLatestMatches(id: string) {
    try {
       return null;

    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch latest matches for player.');
    }
}



export async function fetchAllTournaments() {
    try {
        const data = await prisma.tournament.findMany();

        return data;
        
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch tournaments.');
    }
}
