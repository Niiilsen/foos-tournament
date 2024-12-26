import {sql} from "@vercel/postgres";
import {Player, PlayerWithMatches, Tournament} from "@/app/lib/definitions";

export async function fetchPlayers() {
    try {
        const data = await sql<Player>`
      SELECT
        id,
        name,
        email
      FROM players
      ORDER BY name ASC
    `;

        const players = data.rows;
        return players;
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch all players.');
    }
}



export async function fetchPlayerById(id: string) {
    try {
        const data = await sql<Player>`
            SELECT
                id,
                name,
                email
            FROM players
            WHERE id = ${id};
        `;

        if (data.rows.length === 0) {
            throw new Error('Player not found or has no matches.');
        }
        
        return data.rows[0];

    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch player and matches.');
    }
}

export async function fetchAllTournaments() {
    try {
        const data = await sql<Tournament>`
            SELECT
                id,
                name,
                start_date,
                end_date,
                max_players,
                game_type
            FROM tournaments
        `;

        console.log("Fetched data", data);
        if (data.rows.length === 0) {
            throw new Error('No tournaments was found.');
        }

        return data.rows;

    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch tournaments.');
    }
}
