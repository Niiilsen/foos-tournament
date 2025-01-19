import {IFormattedMatch} from "@/app/lib/tournaments/data";
import {clsx} from "clsx";

export default async function Match({match, className}: { match: IFormattedMatch; className?: string }) {
    return (
        <div key={match.id} className={clsx('p-4 border border-gray-200 rounded-md relative group max-w-screen-sm', className)}>
            <p className="text-sm text-gray-400">{match.group?.groupName}</p>
            <div className="grid grid-cols-match justify-between items-center ">
                <div
                    className='flex flex-col pr-4 text-base text-right text-gray-700 border-r-4 border-r-blue-500'>{match.homeTeam.map((player) =>
                    <p className="text-right">{player.name}</p>)}</div>
                
                    {match.isPlayed ?
                        <div className="text-base text-center">
                            {match.homeScore} - {match.awayScore}</div>
                        : <div className="text-base text-center text-gray-600">-</div>
                    }
                <div
                    className='flex flex-col pl-4 text-base text-left text-gray-700 border-l-4 border-l-red-500'>{match.awayTeam.map((player) =>
                    <p>{player.name}</p>)}</div>
            </div>
        </div>
    )
}