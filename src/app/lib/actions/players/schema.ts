import {z} from "zod";

export const CreatePlayerSchema = z.object({
    name: z.string({
        invalid_type_error: 'Please enter a player name.',
    }),
    birthDate: z.preprocess((value) => (typeof value === 'string' ? new Date(value) : value), z.date()),
    email: z.string().email("Please enter a valid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
})