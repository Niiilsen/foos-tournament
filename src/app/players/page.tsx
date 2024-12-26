
import {PlayerTableSkeleton} from '@/app/ui/skeletons';
import {Suspense} from 'react';
import { Metadata } from 'next';
import PlayerTable from "@/app/ui/players/player-table";

export const metadata: Metadata = {
    title: 'Players',
};
export default async function Page() {

    return (
        <main className="container mx-auto mt-12">
                <h1 className={`text-4xl font-bold mb-8`}>All Players</h1>
            <Suspense key="playerlist" fallback={<PlayerTableSkeleton/>}>
                <PlayerTable />
            </Suspense>
        </main>
    );
}