import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the path if needed

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const tournamentId = searchParams.get("tournamentId");

    if (!query) {
        return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    if (!tournamentId) {
        return NextResponse.json({ error: "Tournament ID is required" }, { status: 400 });
    }

    try {
        const players = await prisma.player.findMany({
            where: {
                name: {
                    contains: query,
                    mode: "insensitive",
                },
                tournaments: {
                    none: {
                        tournamentId: tournamentId, // Exclude players already in the tournament
                    },
                },
            },
            select: {
                id: true,
                name: true,
                email: true, // Include other fields as needed
                password: false, // Explicitly exclude the password field
            },
        });

        return NextResponse.json(players);
    } catch (error) {
        console.error("Error fetching players:", error);
        return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
    }
}
