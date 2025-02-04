use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::io::{self, Write};

#[derive(Debug, Deserialize)]
struct Match {
    winner: String,
    loser: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct EloData {
    players: HashMap<String, f64>,
}

const K: f64 = 32.0;

fn expected_score(player_elo: f64, opponent_elo: f64) -> f64 {
    1.0 / (1.0 + 10f64.powf((opponent_elo - player_elo) / 400.0))
}

fn update_elo(winner_elo: f64, loser_elo: f64) -> (f64, f64) {
    let winner_expected = expected_score(winner_elo, loser_elo);
    let loser_expected = expected_score(loser_elo, winner_elo);

    let new_winner_elo = winner_elo + K * (1.0 - winner_expected);
    let new_loser_elo = loser_elo + K * (0.0 - loser_expected);

    (new_winner_elo, new_loser_elo)
}

fn main() -> io::Result<()> {
    let filename = "history.json";

    // Read and parse history file
    let data = fs::read_to_string(filename)?;
    let matches: Vec<Match> = serde_json::from_str(&data)?;

    let elo_file = "elo_ratings.json";
    let elo_data: EloData = match fs::read_to_string(elo_file) {
        Ok(content) => serde_json::from_str(&content).unwrap_or(EloData { players: HashMap::new() }),
        Err(_) => EloData { players: HashMap::new() },
    };

    let mut players_elo = elo_data.players;

    for game in matches {
        let winner_elo = *players_elo.get(&game.winner).unwrap_or(&1000.0);
        let loser_elo = *players_elo.get(&game.loser).unwrap_or(&1000.0);

        let (new_winner_elo, new_loser_elo) = update_elo(winner_elo, loser_elo);

        players_elo.insert(game.winner.clone(), new_winner_elo);
        players_elo.insert(game.loser.clone(), new_loser_elo);

        println!(
            "{} won against {} -> New Ratings: {}: {:.2}, {}: {:.2}",
            game.winner, game.loser, game.winner, new_winner_elo, game.loser, new_loser_elo
        );
    }

    // Save updated Elo ratings
    let updated_elo_data = EloData { players: players_elo };
    let updated_json = serde_json::to_string_pretty(&updated_elo_data)?;
    fs::write(elo_file, updated_json)?;

    println!("Elo ratings updated successfully!");

    Ok(())
}
