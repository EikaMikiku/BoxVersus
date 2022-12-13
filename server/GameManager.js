import fs from "fs";

const MOVES_LOCATION = "./server/moves";
const HITBOX_POINT = 2;
const HURTBOX_POINT = 1;
const HITBOX_OUT_PENALTY = 1;
const HURTBOX_OUT_PENALTY = 0.5;

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

	static CalculateScore(boxes, offset, currentMove) {
		let dims = findWidthHeight(currentMove.data);
		let currentMoveHurtboxArea = 0;
		let currentMoveHitboxArea = 0;

		//Calculating hurtbox/hitbox areas of the current move
		for(let x = 0; x <= dims.w; x++) {
			for(let y = 0; y <= dims.h; y++) {
				for(let box of currentMove.data.hurtboxes) {
					if(pointInBox(x, y, box)) {
						currentMoveHurtboxArea += HURTBOX_POINT;
						break;
					}
				}
				for(let box of currentMove.data.hitboxes) {
					if(pointInBox(x, y, box)) {
						currentMoveHitboxArea += HITBOX_POINT;
						break;
					}
				}
			}
		}

		let hitboxMap = {};
		let hurtboxMap = {};

		//Map the scores, boxes that cover duplicate area only counted once
		for(let box of boxes) {
			let tlx = box.start.x - offset;
			let tly = box.start.y - offset;
			let brx = box.end.x - offset;
			let bry = box.end.y - offset;

			for(let x = tlx; x <= brx; x++) {
				for(let y = tly; y <= bry; y++) {
					//Check if the point is in or out of the boxes
					if(box.type === "HITBOX") {
						let isIn = false;
						for(let hitbox of currentMove.data.hitboxes) {
							if(x >= hitbox.tl.x && x <= hitbox.br.x) {
								if(y >= hitbox.tl.y && y <= hitbox.br.y) {
									isIn = true;
									break;
								}
							}
						}
						if(isIn) {
							hitboxMap[`${x}:${y}`] = HITBOX_POINT;
						} else {
							hitboxMap[`${x}:${y}`] = -HITBOX_OUT_PENALTY;
						}
					} else {
						let isIn = false;
						for(let hurtbox of currentMove.data.hurtboxes) {
							if(x >= hurtbox.tl.x && x <= hurtbox.br.x) {
								if(y >= hurtbox.tl.y && y <= hurtbox.br.y) {
									isIn = true;
									break;
								}
							}
						}
						if(isIn) {
							hurtboxMap[`${x}:${y}`] = HURTBOX_POINT;
						} else {
							hurtboxMap[`${x}:${y}`] = -HURTBOX_OUT_PENALTY;
						}
					}
				}
			}
		}

		let hurtboxScore = 0;
		let hitboxScore = 0;
		//Calculate the total score
		for(let val in hitboxMap) {
			hitboxScore += hitboxMap[val];
		}
		for(let val in hurtboxMap) {
			hurtboxScore += hurtboxMap[val];
		}

		return (hurtboxScore + hitboxScore) / (currentMoveHitboxArea + currentMoveHurtboxArea);
	}
}

function pointInBox(x, y, box) {
	return x >= box.tl.x && x <= box.br.x && y >= box.tl.y && y <= box.br.y;
}

function findWidthHeight(moveData) {
	let maxX = 0;
	let maxY = 0;

	let allBoxes = moveData.hurtboxes.concat(moveData.hitboxes);

	for(let box of allBoxes) {
		if(box.br.x > maxX) maxX = box.br.x;
		if(box.br.y > maxY) maxY = box.br.y;
	}

	return {
		w: maxX,
		h: maxY
	};
}
