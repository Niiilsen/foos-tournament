import {z} from "zod";

export const FormSchema = z.object({
    id: z.string(),
    name: z.string({
        invalid_type_error: 'Please enter a tournament name.',
    }),
    gameType: z.string({
        invalid_type_error: 'Please select a game type.',
    }),
    maxPlayers: z.number(),
    startDate: z.preprocess((value) => (typeof value === 'string' ? new Date(value) : value), z.date()),
    endDate: z.preprocess((value) => (typeof value === 'string' ? new Date(value) : value), z.date()),

});

export const CreateTournamentSchema = FormSchema.omit({ id: true, maxPlayers: true });