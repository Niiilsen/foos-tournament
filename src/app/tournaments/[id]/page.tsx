import {fetchPlayerById, fetchLatestMatches} from "@/app/lib/data";
import {notFound} from 'next/navigation';
import {Metadata} from "next";
import {fetchTournamentById} from "@/app/lib/tournaments/data";
import Link from "next/link";
import {PencilIcon, PlusIcon} from "@heroicons/react/24/solid";
import {Button} from "@/components/ui/button";
import PlayersSection from "@/app/ui/tournament/players-section";
import GroupSection from "@/app/ui/tournament/groups-section";
import MatchesSection from "@/app/ui/tournament/matches-section";

export const metadata: Metadata = {
    title: 'Tournament',
};
export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;
    const [tournament] = await Promise.all([
        fetchTournamentById(id, true)
    ]);

    if (!tournament) {
        notFound();
    }

    return (
        <main className="container mx-auto mt-12">
            <div className="flex gap-8 items-center">
                <div className="size-32 bg-blue-300 rounded-full"></div>
                <div>
                    <div className="flex gap-4">
                        <h1 className="text-4xl font-bold">{tournament.name}</h1>
                        <Button asChild variant={"default"}>
                            <Link href={`${tournament.id}/edit`}>
                                <PencilIcon/></Link>
                        </Button>
                    </div>
                    <p>{tournament.startDate.toLocaleString()}</p>
                    <p>{tournament.maxPlayers}</p>
                    <p>{tournament.gameType}</p>
                </div>
            </div>
            {/* Add Players Section */}
            <PlayersSection className="mt-12" tournamentId={id} />
            <GroupSection className="mt-12" tournamentId={id} />
            <MatchesSection className="mt-12" tournamentId={id} />

        </main>
    )
}