import {notFound} from "next/navigation";
import {Metadata} from "next";
import {fetchGroupsWithPlayers, fetchTournamentById} from "@/app/lib/tournaments/data";
import PlayersSection from '@/app/ui/tournament/players-section';
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {generateMatches, generateTournamentGroups} from "@/app/lib/actions";
import GroupSection from "@/app/ui/tournament/groups-section";
import {Suspense} from "react";
import {ArrowPathIcon} from "@heroicons/react/24/solid";
import MatchesSection from "@/app/ui/tournament/matches-section";

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
                <PlayersSection className="mt-12" tournamentId={id} allowEdit={true}/>

            <Suspense key={`groups_${id}`} fallback={<div>Loading groups...</div>}>
                <GroupSection className="mt-12" tournamentId={id} allowEdit={true}/>
            </Suspense>
            
            <MatchesSection className="mt-12" tournamentId={id} allowEdit={true}/>


        </main>
    );
}

