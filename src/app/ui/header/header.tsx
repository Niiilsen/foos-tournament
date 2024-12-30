import Link from "next/link";
import Breadcrumbs from "@/app/ui/breadcrumb/breadcrumbs";

export default async function Header() {
    return (
        <>
            <div className="h-24 bg-blue-50 flex gap-8 items-center justify-center">
                <Link href="/players">Players</Link>
                <Link href="/tournaments">Tournaments</Link>
            </div>
            <div className="container mx-auto mt-2.5 mb-6">
            <Breadcrumbs/>
            </div>
        </>
    )
} 