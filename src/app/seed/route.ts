import { db } from '@vercel/postgres';

const client = await db.connect();

async function seedDatabase() {
  // Enable the UUID extension
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  // Create Player table
  await client.sql`
    CREATE TABLE IF NOT EXISTS Players (
                                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      Name VARCHAR(255) NOT NULL,
      Email VARCHAR(255) NOT NULL
      );
  `;

  // Create Team table
  await client.sql`
    CREATE TABLE IF NOT EXISTS Team (
                                      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      Player_one_ID UUID NOT NULL,
      Player_two_ID UUID NOT NULL,
      FOREIGN KEY (Player_one_ID) REFERENCES Player(Player_ID),
      FOREIGN KEY (Player_two_ID) REFERENCES Player(Player_ID)
      );
  `;

  // Create Tournament table
  await client.sql`
    CREATE TABLE IF NOT EXISTS Tournaments (
                                            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      Name VARCHAR(255) NOT NULL,
      Start_date DATE NOT NULL,
      End_date DATE NOT NULL,
      Max_players INT NOT NULL,
      GameType VARCHAR(255) NOT NULL
      );
  `;

  // Create Tournament_Group table
  await client.sql`
    CREATE TABLE IF NOT EXISTS Tournament_Group (
                                                  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      Tournament_ID UUID NOT NULL,
      Group_name VARCHAR(255) NOT NULL,
      Round INT NOT NULL,
      FOREIGN KEY (Tournament_ID) REFERENCES Tournament(Tournament_ID)
      );
  `;

  // Create Group_Member table
  await client.sql`
    CREATE TABLE IF NOT EXISTS Group_Member (
                                              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      Group_ID UUID NOT NULL,
      Player_ID UUID NOT NULL,
      FOREIGN KEY (Group_ID) REFERENCES Tournament_Group(Group_ID),
      FOREIGN KEY (Player_ID) REFERENCES Player(Player_ID)
      );
  `;

  // Create Match table
  await client.sql`
    CREATE TABLE IF NOT EXISTS Match (
                                       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      Tournament_ID UUID NOT NULL,
      Group_ID UUID NOT NULL,
      Stage VARCHAR(255) NOT NULL,
      Match_DateTime TIMESTAMP NOT NULL,
      Home_team_ID UUID NOT NULL,
      Away_team_ID UUID NOT NULL,
      Home_score INT NOT NULL,
      Away_score INT NOT NULL,
      Is_played BOOLEAN NOT NULL,
      Winner_team_ID UUID,
      FOREIGN KEY (Tournament_ID) REFERENCES Tournament(Tournament_ID),
      FOREIGN KEY (Group_ID) REFERENCES Tournament_Group(Group_ID),
      FOREIGN KEY (Home_team_ID) REFERENCES Team(Team_ID),
      FOREIGN KEY (Away_team_ID) REFERENCES Team(Team_ID),
      FOREIGN KEY (Winner_team_ID) REFERENCES Team(Team_ID)
      );
  `;

  // Create Group_Ranking table
  await client.sql`
    CREATE TABLE IF NOT EXISTS Group_Ranking (
                                               id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      Group_ID UUID NOT NULL,
      Player_ID UUID NOT NULL,
      Points INT NOT NULL,
      Matches_played INT NOT NULL,
      Matches_won INT NOT NULL,
      Matches_lost INT NOT NULL,
      Goals_for INT NOT NULL,
      Goals_against INT NOT NULL,
      Goal_difference INT NOT NULL,
      FOREIGN KEY (Group_ID) REFERENCES Tournament_Group(Group_ID),
      FOREIGN KEY (Player_ID) REFERENCES Player(Player_ID)
      );
  `;

  // Create Playoff table
  await client.sql`
    CREATE TABLE IF NOT EXISTS Playoff (
                                         id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      Tournament_ID UUID NOT NULL,
      Stage VARCHAR(255) NOT NULL,
      Match_ID UUID NOT NULL,
      FOREIGN KEY (Tournament_ID) REFERENCES Tournament(Tournament_ID),
      FOREIGN KEY (Match_ID) REFERENCES Match(Match_ID)
      );
  `;

  console.log('Database schema created successfully.');
}

export async function GET() {
  try {
    await client.sql`BEGIN`;
    await seedDatabase();
    await client.sql`COMMIT`;

    return Response.json({ message: 'Database schema set up successfully' });
  } catch (error) {
    await client.sql`ROLLBACK`;
    console.error('Error setting up database schema:', error);
    return Response.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}