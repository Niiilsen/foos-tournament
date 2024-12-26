import {Button} from "@/components/ui/button";
import Link from "next/link";
import {PlusIcon} from "@heroicons/react/24/solid";
import {fetchAllTournaments} from "@/app/lib/data";
import { Tournament } from "../lib/definitions";

export default async function Page(){
    const tournaments = await fetchAllTournaments();
    
    return <main className="container mx-auto">
        <h1>Tournaments</h1>
        <ul className="flex flex-col gap-4">
            {tournaments.map((tournament: Tournament) => (
                <li key={tournament.id} className="flex justify-between border border-gray-400 rounded-md p-4">
                    <div>
                        <h2 className="text-2xl font-bold">{tournament.name}</h2>
                        <p className="text-sm text-gray-600">{tournament.game_type}</p>
                    </div>
                    <div>{tournament.max_players}</div>
                    <div>{tournament.start_date.toDateString()}</div>
                    <div>{tournament.end_date.toDateString()}</div>
                </li>
            ))}
        </ul>
        
    <Button asChild variant={"default"}>
        <Link href="/tournaments/create">
            <span className="hidden md:block">Create Tournament</span>
            <PlusIcon className="h-5 md:ml-4"/></Link>
    </Button>

    </main>
}