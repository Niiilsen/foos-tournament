'use client';

import {useEffect, useState} from "react";
import {useDebounce} from "@/app/hooks/useDebounce";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Player} from '@prisma/client';

export default function PlayersSection({tournamentId, tournamentPlayers = [], allowEdit = false}: {
    tournamentId: string,
    tournamentPlayers: Player[],
    allowEdit?: boolean
}) {
    const [query, setQuery] = useState<string>("");
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPlayers, setSelectedPlayers] = useState<Player[]>(tournamentPlayers); // To store added players
    const [error, setError] = useState<string | null>(null); // Error state for API calls
    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        if (!debouncedQuery || !allowEdit) {
            setPlayers([]);
            return;
        }

        const fetchPlayers = async () => {
            setLoading(true);
            setError(null); // Clear previous errors
            try {
                const res = await fetch(`/api/players/search?query=${debouncedQuery}&tournamentId=${tournamentId}`);
                if (!res.ok) {
                    throw new Error("Failed to fetch players");
                }
                const data = await res.json();
                setPlayers(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load players. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchPlayers();
    }, [debouncedQuery]);

    const addPlayerToTournament = async (playerId: string) => {
        try {
            const res = await fetch(`/api/tournaments/add-player`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({playerId, tournamentId}),
            });

            if (!res.ok) {
                throw new Error("Failed to add player to tournament");
            }

            const addedPlayer = players.find((p) => p.id === playerId);
            setSelectedPlayers((prev) => [...prev, addedPlayer]);
        } catch (err) {
            console.error(err);
            setError("Failed to add player. Please try again.");
        }
    };

    return (
        <div className="mt-12">
            <h3 className="text-xl font-bold mb-4">Participants</h3>
            <ul className="flex gap-2.5">
                {selectedPlayers.map((player) => (
                    <li key={player.id}><Button variant={"outline"}>{player.name}</Button></li>
                ))}
            </ul>
            {allowEdit &&
                <>
                    <div className="flex gap-4 items-center mt-4">
                        <Input
                            placeholder="Search players..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {loading && <p>Loading...</p>}
                    </div>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                    <div className="mt-4 space-y-2">
                        {players.length > 0 ? (
                            players.map((player) => (
                                <div
                                    key={player.id}
                                    className="flex justify-between items-center border p-2 rounded-md"
                                >
                                    <span>{player.name}</span>
                                    <Button
                                        onClick={() => addPlayerToTournament(player.id)}
                                        disabled={selectedPlayers.some((p) => p.id === player.id)}
                                    >
                                        Add
                                    </Button>
                                </div>
                            ))
                        ) : (
                            !loading && debouncedQuery && <p>No players found.</p>
                        )}
                    </div>
                </>}
        </div>
    );
}
