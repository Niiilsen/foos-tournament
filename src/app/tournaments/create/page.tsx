import Form from "@/app/ui/tournament/create-form";
import {fetchPlayers} from "@/app/lib/data";

export default async function Page () {
    const players = await fetchPlayers();
    
    return <main className="container mx-auto">
        <Form players={players} />
    </main>
}