import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

// // Example usage:
// const contentToWrite = 'This is the content to write to the temporary file.';
// const tmpFilePath = writeToTmpFile(contentToWrite);

const db = new sqlite3.Database('abalone.sqlite');
sqlite3.verbose();
db.run(`
	CREATE TABLE IF NOT EXISTS games (
		uuid TEXT PRIMARY KEY,
		data JSON
	)
`);

// db.close((err) => {
// 	if (err) {
// 		console.error(err.message);
// 	} else {
// 		console.log('Database connection closed.');
// 	}
// });

export async function new_game(uuid: string, json_game_info: string) {
	db.run('INSERT INTO games (uuid, data) VALUES (?, ?)', [uuid, json_game_info], (err) => {
		if (err) {
			console.error(err.message);
		} else {
			console.log(`New game successfully created with uuid: ${uuid}`);
		}
	});
}

export async function get_game_info(uuid: string): Promise<string | null> {
	const query = 'SELECT data FROM games WHERE uuid = ?';

	// this await Promise is needed, as db.get() returns immediately and then result has no value before giving it back
	let result: string = await new Promise((resolve, reject) => {
		db.get(query, [uuid], (err, row) => {
			if (err) {
				console.error(err.message);
				reject(err);
			} else {
				if (row) {
					let fun = JSON.parse(row.data);
					resolve(fun);
				} else {
					console.log('No data found for the given uuid.');
					reject('No data found for the given uuid.');
				}
			}
		});
	});

	return result;
}

export async function get_all_games(): Promise<string[]> {
	// TODO sort by date descending

	const query = 'SELECT uuid FROM games';

	let results: string[] = await new Promise((resolve, reject) => {
		db.all(query, [], (err, rows) => {
			if (err) {
				console.error(err.message);
				reject(err);
			} else {
				console.log('Following data are all uuids from games.');
				console.log(rows);
				if (rows) {
					const uuids = rows.map((row) => row.uuid);
					resolve(uuids);
				} else {
					console.log('No game found');
					resolve([]);
				}
			}
		});
	});

	return results;
}

export async function update_game(uuid: string, json_game_info: string): Promise<string | null> {
	const query = `
		UPDATE games
		SET data = ?
		WHERE uuid = ?;`;

	let result = null;
	db.run(query, [json_game_info, uuid], (err, row) => {
		if (err) {
			console.error(err.message);
		} else {
			console.log(`Game successfully updated with uuid: ${uuid}`);
		}
	});

	return result;
}
