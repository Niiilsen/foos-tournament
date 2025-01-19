import {getMatchesForTournament} from "@/app/lib/tournaments/data";
import {Button} from "@/components/ui/button";
import {ArrowPathIcon} from "@heroicons/react/24/solid";
import {clsx} from "clsx";
import {generateMatches} from "@/app/lib/actions";
import MatchList from "@/app/ui/matches/match-list";

export default async function MatchesSection({tournamentId, allowEdit = false, className = ""}: {
    tournamentId: string,
    allowEdit?: boolean,
    className?: string
}) {
    const matches = await getMatchesForTournament(tournamentId).then((matches) => {
        return matches;
    });

    return (
        <div className={clsx(className)}>
            <h2 className="text-xl font-bold mb-4">Matches</h2>
            <MatchList matchList={matches} />
            {allowEdit &&
                <Button variant={"default"} className="mt-8"
                        onClick={generateMatches.bind(null, tournamentId)}>
                    Generate matches
                    <ArrowPathIcon/>
                </Button>
            }
        </div>
    )
}
