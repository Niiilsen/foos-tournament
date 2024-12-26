import Link from "next/link";

export default async function Header () {
    return <div className="h-24 bg-blue-50 flex justify-center items-center gap-8">
        <Link href="/players" >Players</Link>
        <Link href="/tournaments" >Tournaments</Link>
    </div>
} 