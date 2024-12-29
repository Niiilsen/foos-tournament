import {Button} from "@/components/ui/button";
import Link from "next/link";
import {PlusIcon} from "@heroicons/react/24/solid";
import {fetchAllTournaments} from "@/app/lib/tournaments/data";


export default async function Page(){
    const tournaments = await fetchAllTournaments();
    
    return <main className="container mx-auto">
        <h1>Tournaments</h1>
        <ul className="flex flex-col gap-4">
            {tournaments.map((tournament) => (
                <li key={tournament.id}>
                    <Link href={`/tournaments/${tournament.id}`}
                        className="flex gap-4 items-center p-4 border border-gray-200 rounded-md hover:border-blue-600">
                    <div>
                        <h2 className="text-2xl font-bold">{tournament.name}</h2>
                        <p className="text-sm text-gray-600">{tournament.gameType}</p>
                    </div>
                    <div>{tournament.maxPlayers}</div>
                    <div>{tournament.startDate.toDateString()}</div>
                    <div>{tournament.endDate.toDateString()}</div>
                    </Link>
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