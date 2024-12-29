import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        // Parse the request body
        const body = await req.json();
        const { tournamentId, playerId } = body;

        // Validate request data
        if (!tournamentId || typeof tournamentId !== "string") {
            return NextResponse.json({ error: "Invalid or missing tournament ID" }, { status: 400 });
        }

        if (!playerId || typeof playerId !== "string") {
            return NextResponse.json({ error: "Invalid or missing player ID" }, { status: 400 });
        }

        // Create a new tournament-player association in the database
        await prisma.tournamentPlayer.create({
            data: {
                tournamentId,
                playerId,
            },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error adding player to tournament:", error);
        return NextResponse.json(
            { error: "Failed to add player to tournament" },
            { status: 500 }
        );
    }
}
