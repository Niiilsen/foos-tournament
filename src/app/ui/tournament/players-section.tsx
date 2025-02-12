﻿'use client';

import { useEffect, useState } from "react";
import { useDebounce } from "@/app/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchTournamentPlayersById } from "@/app/lib/tournaments/data";
import {clsx} from "clsx";

interface ISimplePlayer {
    id: string;
    name: string;
}

export default function PlayersSection({ tournamentId, allowEdit = false, className = "" }: { tournamentId: string, allowEdit?: boolean, className?: string }) {
    const [query, setQuery] = useState<string>("");
    const [players, setPlayers] = useState<ISimplePlayer[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPlayers, setSelectedPlayers] = useState<ISimplePlayer[]>([]); // To store added players
    const [error, setError] = useState<string | null>(null); // Error state for API calls
    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const res = await fetch(`/api/tournaments/get-players?tournamentId=${tournamentId}`);
                if (!res.ok) {
                    throw new Error("Failed to fetch players");
                }
                const data = await res.json();
                setSelectedPlayers(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load players. Please try again.");
            }
        };

        fetchPlayers();
    }, [tournamentId]);

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
    }, [debouncedQuery, allowEdit, tournamentId]);

    const addPlayerToTournament = async (playerId: string) => {
        try {
            const res = await fetch(`/api/tournaments/add-player`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ playerId, tournamentId }),
            });

            if (!res.ok) {
                throw new Error("Failed to add player to tournament");
            }

            const addedPlayer = players.find((p) => p.id === playerId);
            if (addedPlayer) {
                setSelectedPlayers((prev) => [...prev, addedPlayer]);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to add player. Please try again.");
        }
    };

    return (
        <div className={clsx(className)}>
            <h3 className="text-xl font-bold mb-4">Participants ({selectedPlayers.length})</h3>
            <ul className="flex flex-wrap gap-2.5">
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
