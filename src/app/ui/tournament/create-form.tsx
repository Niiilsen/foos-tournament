'use client';

import {createTournament, State} from "@/app/lib/actions";
import {useActionState, useEffect} from 'react';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import { z } from "zod"
import {CalendarIcon} from "@heroicons/react/24/solid";
import {Calendar} from "@/components/ui/calendar";
import {format} from "date-fns";
import {CreateTournamentSchema} from "@/app/lib/schema";
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function CreateTournamentForm() {
    const initialState: State = { message: null, errors: {} };
    const [state, formAction] = useActionState(createTournament, initialState);

    const form = useForm<z.infer<typeof CreateTournamentSchema>>({
        resolver: zodResolver(CreateTournamentSchema),
        defaultValues: {
            name: 'Turnering',
            gameType: 'group-only',
            startDate: new Date(),
            endDate: new Date(),
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
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tournament Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter a name for the tournament" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-4 justify-between">
                <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <input type="hidden" name={field.name} value={field.value?.toISOString()} />
                            <FormLabel>Start date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <input type="hidden" name={field.name} value={field.value?.toISOString()}/>
                            <FormLabel>End date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                </div>
                <FormField
                    control={form.control}
                    name="gameType"
                    render={({ field }) => (
                        <FormItem>
                            <input type="hidden" name={field.name} value={field.value}/>
                            <FormLabel>Game Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type of tournament"/>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="group-only">Group only</SelectItem>
                                    <SelectItem value="group-and-playoff">Group and playoffs</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
}
