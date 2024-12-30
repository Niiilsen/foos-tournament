'use client';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import {usePathname} from "next/navigation";

export default function Breadcrumbs() {
    const paths = usePathname()
    const pathNames = paths.split('/').filter(path => path)

    // console.log(pathArray);

    return (
        <Breadcrumb className="flex gap-4">
            <BreadcrumbList>
                {/* Home link */}
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/">Home</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator/>
                {/* Generate breadcrumbs dynamically */}
                {pathNames.map((link, index) => {
                    let href = `/${pathNames.slice(0, index + 1).join('/')}`
                    // Create a link for the current path segment

                    // Capitalize the breadcrumb text
                    const breadcrumbName = link.replace(/-/g, " ").replace(/_/g, " ").replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

                    return (
                        <>
                            <BreadcrumbItem key={href}>
                                {index === pathNames.length - 1 ? (
                                    // Render current page without a link
                                    <span>{breadcrumbName}</span>
                                ) : (
                                    <>
                                        <BreadcrumbLink asChild>
                                            <Link href={href}>{breadcrumbName}</Link>
                                        </BreadcrumbLink>
                                    </>
                                )}
                            </BreadcrumbItem>
                            <BreadcrumbSeparator/>
                        </>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}