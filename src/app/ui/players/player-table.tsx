import {fetchPlayers} from "@/app/lib/data";
import Link from "next/link";

export default async function PlayerTable() {
    const players = await fetchPlayers();

    return (
        <ul className="grid grid-cols-3 gap-2">
            {players.map((player) => (
                <li className="">
                    <Link href={`/players/${player.id}`} passHref
                          className="flex gap-4 items-center p-4 border border-gray-200 rounded-md hover:border-blue-600">
                        <div>
                            <div className="bg-blue-300 rounded-full size-8"></div>
                        </div>
                        <div className="basis-1/2">
                            <div className="text-xl font-bold">{player.name}</div>
                            <div className="text-sm text-gray-600">{player.email}</div>

                        </div>
                    </Link>
                </li>
            ))}
        </ul>
    )
}

