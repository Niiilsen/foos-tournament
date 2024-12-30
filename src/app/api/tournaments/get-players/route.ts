import { NextResponse } from "next/server";
import { fetchTournamentPlayersById } from "@/app/lib/tournaments/data"; // Import your server action

export async function GET(request: Request) {
    console.log("HERE")
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get("tournamentId");

    try {
        const players = await fetchTournamentPlayersById(tournamentId);
        return NextResponse.json(players);
    } catch (error) {
        console.error("Error fetching tournament players:", error);
        return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
    }
}
