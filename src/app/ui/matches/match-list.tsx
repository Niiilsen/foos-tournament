import {Match} from "@/app/lib/definitions";

export default async function MatchList({
                                            matches
                                        }: {
    matches: Match[]
}) {

    if (matches && matches.length === 0) {
        return <p>No matches played</p>
    }

    return (
        <>
            {matches.map((match) => (
                <div className="p-6 rounded-sm border border-gray-300">{match.team}</div>

            ))}
        </>
    )
}