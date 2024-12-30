import {FormattedMatch} from "@/app/lib/tournaments/data";
import {clsx} from "clsx";
import Match from "@/app/ui/matches/match";

export default async function MathList({matchList, className = ""}: {matchList: FormattedMatch[]; className?: string;}) {
    return (
        <div className={clsx(className)}>
            {matchList.length === 0 && <p>There are no matches to show</p>}
            {matchList.length > 0 &&
                <div className="flex flex-col gap-4">
                    {
                        matchList.map((match) => {
                            return (
                                <Match match={match} />
                            )
                        })
                    }
                </div>
            }
        </div>
    )
}