'use client';

import {useActionState, useEffect} from 'react';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "@/components/ui/input";
import {CreatePlayerSchema} from "@/app/lib/actions/players/schema";
import {createPlayer, State} from "@/app/lib/actions/players/actions";
import Datepicker from "@/components/ui/datepicker";


export default function CreatePlayerForm() {
    const initialState: State = {message: null, errors: {}};
    const [state, formAction] = useActionState(createPlayer, initialState);

    const form = useForm<z.infer<typeof CreatePlayerSchema>>({
        resolver: zodResolver(CreatePlayerSchema),
        defaultValues: {
            name: '',
            birthDate: new Date(),
            email: '',
            password: '',
        },
    });

    useEffect(() => {
        console.log(form.getValues());
    }, [form.watch()]);

    return (
        <Form {...form} >
            <form action={formAction} className="flex flex-col gap-4 max-w-2xl mx-auto">
                <FormField
                    control={form.control}
                    name="name"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter the players full name" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="birthDate"
                    render={({field}) => (
                        <FormItem className="flex flex-col">
                            <input type="hidden" name={field.name} value={field.value?.toLocaleDateString()}/>
                            <FormLabel>Birth date</FormLabel>
                            <Datepicker startYear={1900} endYear={2025} selected={field.value}
                                        onSelect={field.onChange}/>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="Enter an email" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Enter a password" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
}
