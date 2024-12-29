import { PrismaClient } from '@prisma/client'

import { Player } from '@prisma/client';
import bcrypt from "bcrypt";


const prisma = new PrismaClient()

const defaultPassword = '';
const playersMock: Player[] = [
    {id: crypto.randomUUID(), name: "Thomas Nilsen", email: "thomas@nilsen.no", password: defaultPassword, birthDate: new Date(1991, 1, 10)},
    {id: crypto.randomUUID(), name: "Vetle Skagestad", email: "vetle@skagestad.no", password: defaultPassword, birthDate: new Date(1990, 2, 10)},
    {id: crypto.randomUUID(), name: "Fredrik Skarderud", email: "fredrik@skarderud.no", password: defaultPassword, birthDate: new Date(1981, 3, 10)},
    {id: crypto.randomUUID(), name: "Kristoffer Perminow", email: "kristoffer@perminow.no", password: defaultPassword, birthDate: new Date(1995, 4, 10)},
    {id: crypto.randomUUID(), name: "Jon Anders Sylvarnes", email: "jonanders@sylvarnes.no", password: defaultPassword, birthDate: new Date(1990, 5, 10)},
    {id: crypto.randomUUID(), name: "Ellinor Syverinsen", email: "ellinor@syverinsen.no", password: defaultPassword, birthDate: new Date(1991, 6, 10)},
    {id: crypto.randomUUID(), name: "Elena Hulsdau", email: "elena@hulsdau.no", password: defaultPassword, birthDate: new Date(1993, 7, 10)},
    {id: crypto.randomUUID(), name: "Jens Granmorken", email: "jens@granmorken.no", password: defaultPassword, birthDate: new Date(1994, 8, 10)},
    {id: crypto.randomUUID(), name: "Øyvind Reistad", email: "oyvind@reistad.no", password: defaultPassword, birthDate: new Date(1985, 9, 10)},
]

async function main() {
    console.log("running main");
    playersMock.map(async (player: Player) => {
        const createdPlayer = await prisma.player.upsert({
            where: { email: player.email},
            update: {},
            create: {...player, password: await bcrypt.hash('12345678', 10)}
        })
        console.log(createdPlayer);
    }
    )
}

main()
.then(() => prisma.$disconnect())
.catch(async (e) => {
    console.error(e)
    await prisma.$disconnect();
    process.exit(1);
})