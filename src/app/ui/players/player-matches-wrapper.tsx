import MatchList from "@/app/ui/matches/match-list";
import {getGamesForPlayer} from "@/app/lib/tournaments/data";

export default async function PlayerMatchesWrapper({playerId, className}: { playerId: string; className?: string }) {
    const playerMatches = await getGamesForPlayer(playerId);

    return (
        <>
            <MatchList matchList={playerMatches} className={className}/>
        </>
    )
}