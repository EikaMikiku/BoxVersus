import fs from "fs";

const MOVES_LOCATION = "./server/moves";

export default class GameManager {
	static GetRandomMove() {
		let all = {};
		let chars = fs.readdirSync(MOVES_LOCATION);

		for(let char of chars) {
			let moves = fs.readdirSync(`${MOVES_LOCATION}/${char}/`);
			all[char] = moves;
		}

		let charKeys = Object.keys(all);
		let rndChar = charKeys[Math.floor(Math.random() * charKeys.length)];
		let charMoves = all[rndChar];
		let rndMove = charMoves[Math.floor(Math.random() * charMoves.length)];

		return {
			char: rndChar,
			move: rndMove.split(".")[0],
			data: JSON.parse(fs.readFileSync(`${MOVES_LOCATION}/${rndChar}/${rndMove}`, "UTF-8"))
		};
	}
}
