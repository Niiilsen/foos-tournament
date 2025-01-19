import {fetchGroupsWithPlayers} from "@/app/lib/tournaments/data";
import {map} from "zod";
import {generateTournamentGroups} from "@/app/lib/actions";
import {Button} from "@/components/ui/button";
import {ArrowPathIcon} from "@heroicons/react/24/solid";
import {clsx} from "clsx";
import GroupEditor from "./group-editor";

export default async function GroupSection({tournamentId, allowEdit = false, className = ""}: {
    tournamentId: string,
    allowEdit?: boolean,
    className?: string
}) {
    const groups = await fetchGroupsWithPlayers(tournamentId);

    return (
        <div className={clsx(className)}>
            <h2 className="text-xl font-bold mb-4">Groups</h2>
            {groups.length === 0 && <p>Groups have not yet been generated</p>}
            {groups.length > 0 &&
                <div className="grid grid-cols-3 gap-4">
                    {
                        groups.map((group) => {
                            return (
                                <div className="p-4 border border-gray-200 rounded-md">
                                    <h2 className="text-xl font-bold">{group.name}</h2>
                                    <ul className="mt-2.5">
                                        {group.players.map((player) => {
                                            return (<li>{player.name}</li>)
                                        })}
                                    </ul>
                                </div>
                            )
                        })
                    }
                </div>
            }
            {allowEdit &&
                <><Button variant={"default"} className="mt-8"
                          onClick={generateTournamentGroups.bind(null, tournamentId)}>
                    {groups.length > 0 ? 'Regenerate groups' : 'Generate groups'}
                    <ArrowPathIcon/>
                </Button>
                    <GroupEditor groups={groups} tournamentId={tournamentId}/>
                </>
            }
        </div>
    )
}
