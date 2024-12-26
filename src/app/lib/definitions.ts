export interface Player {
    id: string;
    name: string;
    email: string;
}

export interface Team {
    id: string;
    player_one: Player;
    player_two: Player;
}

export interface Match {
    id: string;
    match_datetime: string;
    home_team: Team;
    away_team: Team;
    home_score: number;
    away_score: number;
    is_played: boolean;
    winner_team: Team;
    goals: number;
    result: string;
}

export interface PlayerWithMatches {
    id: string;
    player_name: string;
    player_email: string;
    player_address: string;
    matches: Match[];
}

export interface Tournament {
    id: string;
    name: string;
    start_date: Date;
    end_date: Date;
    max_players: string;
    game_type: string;
}