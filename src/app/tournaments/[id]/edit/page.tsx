import {notFound} from "next/navigation";
import {Metadata} from "next";
import {fetchTournamentById} from "@/app/lib/tournaments/data";
import PlayersSection from '@/app/ui/tournament/players-section';
import {Badge} from "@/components/ui/badge";

export const metadata: Metadata = {
    title: "Edit Tournament",
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;
    const [tournament] = await Promise.all([fetchTournamentById(id, true)]);

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
                    </div>
                    <p>{tournament.startDate.toLocaleString()}</p>
                    <p>{tournament.maxPlayers}</p>
                    <p>{tournament.gameType}</p>
                </div>
            </div>

            {/* Add Players Section */}
            <PlayersSection tournamentId={id} tournamentPlayers={tournament.players} allowEdit={true}/>
        </main>
    );
}

