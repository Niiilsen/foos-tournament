'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {CreateTournamentSchema} from "@/app/lib/schema";
import {prisma} from "@/lib/prisma";

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
    console.log("Create tournament data", validatedFields.data);
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

    revalidatePath('/tournaments');
    redirect('/tournaments');
}
