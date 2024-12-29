'use server';

import bcrypt from 'bcrypt';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {prisma} from "@/lib/prisma";
import {CreatePlayerSchema} from "@/app/lib/actions/players/schema";

export type State = {
    errors?: {
        name?: string[];
        birthDate?: string[];
        email?: string[];
        password?: string[];
    };
    message?: string | null;
};

export async function createPlayer(prevState: State, formData: FormData) {
    // Extract relevant fields from the formData
    const relevantFields = {
        name: formData.get('name'),
        birthDate: formData.get('birthDate'),
        email: formData.get('email'),
        password: formData.get('password'),
    };
    console.log("Create Player Data", relevantFields);

    const validatedFields = CreatePlayerSchema.safeParse(relevantFields);

    // Handle validation as before
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Tournament.',
        };
    }

    // Proceed with your logic
    const { name, birthDate, email, password } = validatedFields.data;
    const id = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Create Player Data", validatedFields.data);
    try {
        await prisma.player.create({
            data: {
                id: id,
                name: name,
                birthDate: birthDate,
                email: email,
                password: hashedPassword
            }
        })
    } catch (error) {
        console.log(error);
        return { message: 'Database Error: Failed to Create Player.' };
    }

    revalidatePath(`/players/${id}`);
    redirect(`/players/${id}`);
}
