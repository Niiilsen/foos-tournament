
import {PlayerTableSkeleton} from '@/app/ui/skeletons';
import {Suspense} from 'react';
import { Metadata } from 'next';
import PlayerTable from "@/app/ui/players/player-table";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {PlusIcon} from "@heroicons/react/24/solid";

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
            
            <Button asChild variant={"default"}>
                <Link href="/players/create">
                    <span className="hidden md:block">Create Player</span>
                    <PlusIcon className="h-5 md:ml-4"/></Link>
            </Button>
        </main>
    );
}