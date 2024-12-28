import {fetchPlayerById, fetchLatestMatches} from "@/app/lib/data";
import {notFound} from 'next/navigation';
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Player',
};
export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;
    const [player] = await Promise.all([
        fetchPlayerById(id)
    ]);

    if (!player) {
        notFound();
    }

    return (
        <main className="container mx-auto mt-12">
            <div className="flex gap-8 items-center">
                <div className="size-32 bg-blue-300 rounded-full"></div>
                <div>
                    <h1 className="text-4xl font-bold">{player.name}</h1>
                    <p>{player.email}</p>
                </div>
            </div>
        </main>
    )
}