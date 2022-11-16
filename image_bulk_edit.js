import fs from "fs";
import jimp from "jimp"

const BACKGROUND = 1250303;
const HITBOX = 4283190527;
const HURTBOX = 1291799807;
const HURTBOX_DIM = 2177518847;

const SITEPATH = "./site";
const SERVERPATH = "./server";
const PATH = "./sprites";

const EXTRA_BG_MAP = {
	"391718143": 0x4cff4c6E, //hurtbox only
	"1277437183": 0xff4c4c6E, //hitbox only
	"1549086975": 0x5951176E
};

const charFolders = fs.readdirSync(PATH);
const HURTBOX_EXCEPTIONS = {
	"H-Kohaku": {
		move: "jC.png",
		boxes: [{
			tl: {x: 88, y: 110},
			tr: {x: 214, y: 110},
			br: {x: 214, y: 190},
			bl: {x: 88, y: 190}
		}]
	},
	"H-Arc": {
		move: "5A6AA.png",
		boxes: [{
			tl: {x: 84, y: 70},
			tr: {x: 160, y: 70},
			br: {x: 160, y: 116},
			bl: {x: 84, y: 116}
		}]
	},
	"F-Seifuku": {
		move: "5B.png",
		boxes: [{
			tl: {x: 103, y: 48},
			tr: {x: 147, y: 48},
			br: {x: 147, y: 144},
			bl: {x: 103, y: 144}
		}]
	},
	"F-Nero": {
		move: "5B.png",
		boxes: [{
			tl: {x: 87, y: 60},
			tr: {x: 191, y: 60},
			br: {x: 191, y: 140},
			bl: {x: 87, y: 140}
		}]
	},
	"C-VAkiha": {
		move: "jC.png",
		boxes: [{
			tl: {x: 103, y: 48},
			tr: {x: 147, y: 48},
			br: {x: 147, y: 144},
			bl: {x: 103, y: 144}
		}]
	},
	"C-Nero": {
		move: "BE2C2.png",
		boxes: [{
			tl: {x: 141, y: 102},
			tr: {x: 219, y: 102},
			br: {x: 219, y: 236},
			bl: {x: 141, y: 236}
		}]
	},
	"C-Miyako": {
		move: "2B.png",
		boxes: [{
			tl: {x: 85, y: 14},
			tr: {x: 109, y: 14},
			br: {x: 109, y: 106},
			bl: {x: 85, y: 106}
		}]
	}
}

let CURRENT_CHAR;
for(let charFolder of charFolders) {
	//if(charFolder !== "C-Sion") continue;

	CURRENT_CHAR = charFolder;

	let fullImgsFolder = `${PATH}/${charFolder}/full/`;
	let noneImgsFolder = `${PATH}/${charFolder}/none/`;
	let imgNames = fs.readdirSync(fullImgsFolder);
	for(let imgName of imgNames) {
		//if(imgName !== "2B.png") continue;

		let fullImagePath = fullImgsFolder + imgName;
		let noneImagePath = noneImgsFolder + imgName;

		let fullImg = await jimp.read(fullImagePath);
		let noneImg = await jimp.read(noneImagePath);

		CropImages(fullImg, noneImg);

		RemoveBackground(fullImg);
		RemoveBackground(noneImg);

		let hitboxBoxes = GetBoxes(fullImg, HITBOX);

		AdjustForHurtboxExtraction(fullImg);

		let hurtboxBoxes = GetBoxes(fullImg, HURTBOX);

		//Add Hurtbox Exceptions
		if(HURTBOX_EXCEPTIONS[charFolder] && HURTBOX_EXCEPTIONS[charFolder].move === imgName) {
			hurtboxBoxes.push(...HURTBOX_EXCEPTIONS[charFolder].boxes);
		}

		//HighlightBoxes(fullImg, hurtboxBoxes, HURTBOX);
		//fullImg.write(`${SITEPATH}/img/sprites/${charFolder}/full/${imgName}`);
		//noneImg.write(`${SITEPATH}/img/sprites/${charFolder}/none/${imgName}`);
		try {
			fs.mkdirSync(`${SERVERPATH}/moves/${charFolder}`);
		} catch(e) {
		}
		fs.writeFileSync(`${SERVERPATH}/moves/${charFolder}/${imgName.replace(".png", ".json")}`, JSON.stringify({
			hitboxes: RemoveDuplicateBoxes(hitboxBoxes),
			hurtboxes: RemoveDuplicateBoxes(hurtboxBoxes)
		}, null, "\t"));
	}
}

function RemoveDuplicateBoxes(boxArray) {
	let tmp = {};

	for(let box of boxArray) {
		let id = box.tl.x +","+ box.tl.y +","+ box.tr.x +","+ box.tr.y +","+ box.bl.x +","+ box.bl.y +","+ box.br.x +","+ box.br.y;
		if(!tmp[id]) {
			tmp[id] = box;
		}

	}

	return Object.values(tmp);
}

function AdjustForHurtboxExtraction(img) {
	//Change dim hurtbox border to original
	for(let x = 0; x < img.bitmap.width; x++) {
		for(let y = 0; y < img.bitmap.height; y++) {
			let c = img.getPixelColor(x, y);
			if(c === HURTBOX_DIM) {
				img.setPixelColor(HURTBOX, x, y);
			}
		}
	}

	//Remove hitbox bridges
	for(let x = 0; x < img.bitmap.width; x++) {
		for(let y = 0; y < img.bitmap.height; y++) {
			let c = img.getPixelColor(x, y);
			if(c === HITBOX) {
				let right = x + 1 < img.bitmap.width ? img.getPixelColor(x + 1, y) : null;
				let left = x - 1 >= 0 ? img.getPixelColor(x - 1, y) : null;
				let bottom = y + 1 < img.bitmap.height ? img.getPixelColor(x, y + 1) : null;
				let top = y - 1 >=0 ? img.getPixelColor(x, y - 1) : null;
				//Check vertical bridge, meaning hurtbox borders on the sides
				if(left === HURTBOX && right === HURTBOX) {
					img.setPixelColor(HURTBOX, x, y);
				}
				//Check horizontal bridge, meaning hurtbox borders on top/bottom
				if(top === HURTBOX && bottom === HURTBOX) {
					img.setPixelColor(HURTBOX, x, y);
				}
			}
		}
	}
}

function HighlightBoxes(img, boxes, newColour) {
	for(let x = 0; x < img.bitmap.width; x++) {
		for(let y = 0; y < img.bitmap.height; y++) {
			for(let box of boxes) {
				if(PointIsInBox(box, x, y)) {
					img.setPixelColor(newColour, x, y);
				}
			}
		}
	}
}

function GetHurtboxBoxes(img) {
	let hurtboxBoxes = [];

	return hurtboxBoxes;
}

function GetBoxes(img, boxCol) {
	let hitboxBoxes = [];
	for(let x = 0; x < img.bitmap.width; x++) {
		for(let y = 0; y < img.bitmap.height; y++) {
			let colour = img.getPixelColor(x, y);
			let right = x + 1 < img.bitmap.width ? img.getPixelColor(x + 1, y) : null;
			let bottom = y + 1 < img.bitmap.height ? img.getPixelColor(x, y + 1) : null;

			//Check to make sure its a top left corner
			if(colour === boxCol && right === boxCol && bottom === boxCol) {
				let trs = findTopRightCorner(img, x, y, boxCol);

				for(let tri = 0; tri < trs.length; tri++) {
					let tr = trs[tri];
					let brs = findBottomFromTopRight(img, tr.x, y, boxCol, x, y);

					for(let bri = 0; bri < brs.length; bri++) {
						let br = brs[bri];
						if(br.y === tr.y) {
							//Same height, so its just a line, skip
							continue;
						}

						//Test bottom left corner
						let blColTop = img.getPixelColor(x, br.y - 1); //-1 to skip framedisplay bug...
						let blColRight = img.getPixelColor(x + 1, br.y); //Make sure horizontal line goes to br

						if(blColTop === boxCol && blColRight === boxCol) {
							hitboxBoxes.push({
								tl: {x: x, y: y},
								tr: {x: tr.x, y: tr.y},
								br: {x: br.x, y: br.y},
								bl: {x: x, y: br.y}
							});
						}
					}
				}
			}
		}
	}

	return hitboxBoxes;
}

function RemoveBackground(img) {
	//Make background transparent
	for(let x = 0; x < img.bitmap.width; x++) {
		for(let y = 0; y < img.bitmap.height; y++) {
			let colour = img.getPixelColor(x, y);
			if(colour === BACKGROUND) {
				img.setPixelColor(0, x, y); //Black transparent
			} else if(EXTRA_BG_MAP[colour]) {
				img.setPixelColor(EXTRA_BG_MAP[colour], x, y);
			}
		}
	}
}

function CropImages(fullImg, noneImg) {
	let ox = 1; //Left 1px border
	let oy = 79; //Top offset

	//ox - 1 for right border
	//oy - y for bottom border
	fullImg.crop(ox, oy, fullImg.bitmap.width - ox - 1, fullImg.bitmap.height - oy - 1);
	noneImg.crop(ox, oy, noneImg.bitmap.width - ox - 1, noneImg.bitmap.height - oy - 1);

	let cropCalc = ManualAutoCropCalc(fullImg); //Using full img because it will always be = or bigger than none
	fullImg.crop(cropCalc.l, cropCalc.t, cropCalc.r - cropCalc.l, cropCalc.b - cropCalc.t);
	noneImg.crop(cropCalc.l, cropCalc.t, cropCalc.r - cropCalc.l, cropCalc.b - cropCalc.t);
}

function ManualAutoCropCalc(img) {
	let leftCrop = 0;
	let rightCrop = 0;
	let bottomCrop = 0;
	let topCrop = 0;

	//Left crop calc
	for(let x = 0; x < img.bitmap.width; x++) {
		let allBackground = true;
		for(let y = 0; y < img.bitmap.width; y++) {
			let colour = img.getPixelColor(x, y);
			if(colour !== BACKGROUND) {
				allBackground = false;
				break;
			}
		}
		if(allBackground) {
			leftCrop = x + 1;
		} else {
			break;
		}
	}
	//Right crop calc
	for(let x = img.bitmap.width - 1; x >= 0; x--) {
		let allBackground = true;
		for(let y = 0; y < img.bitmap.width; y++) {
			let colour = img.getPixelColor(x, y);
			if(colour !== BACKGROUND) {
				allBackground = false;
				break;
			}
		}
		if(allBackground) {
			rightCrop = x;
		} else {
			break;
		}
	}
	//Top crop calc
	for(let y = 0; y < img.bitmap.width; y++) {
		let allBackground = true;
		for(let x = 0; x < img.bitmap.width; x++) {
			let colour = img.getPixelColor(x, y);
			if(colour !== BACKGROUND) {
				allBackground = false;
				break;
			}
		}
		if(allBackground) {
			topCrop = y + 1;
		} else {
			break;
		}
	}
	//Bottom crop calc
	for(let y = img.bitmap.width - 1; y >= 0; y--) {
		let allBackground = true;
		for(let x = 0; x < img.bitmap.width; x++) {
			let colour = img.getPixelColor(x, y);
			if(colour !== BACKGROUND) {
				allBackground = false;
				break;
			}
		}
		if(allBackground) {
			bottomCrop = y;
		} else {
			break;
		}
	}
	//console.log(leftCrop, rightCrop, topCrop, bottomCrop);
	//img.crop(leftCrop, topCrop, rightCrop - leftCrop, bottomCrop - topCrop);
	//img.write("./cropped.png");
	return {
		l: leftCrop,
		t: topCrop,
		r: rightCrop,
		b: bottomCrop
	};
}

function PointIsInBox(box, x, y) {
	if(x >= box.tl.x && x <= box.tr.x) {
		if(y >= box.tl.y && y <= box.bl.y) {
			return true;
		}
	}

	return false;
}

function findTopRightCorner(img, x, y, boxCol) {
	let results = [];
	for(let i = x; i < img.bitmap.width; i++) {
		let c = img.getPixelColor(i, y);
		if(c !== boxCol) {
			if(boxCol === HURTBOX) {
				//Hurtbox special treatment
				if(c === HITBOX) {
					if(img.getPixelColor(i, y + 1) !== HURTBOX && img.getPixelColor(i, y + 1) !== HITBOX) {
						//If we reache hitbox, and there is no down hurtbox or hitbox, means keep going
						continue;
					} else {
						//T shape split, but now on a hitbox...
						results.push({
							x: i,
							y: y
						});
						continue;
					}
				}
			} else {
				results.push({
					x: i - 1, //Rollback 1, we arent on hitbox now
					y: y
				});
			}
			return results;
		} else if(i > x) { //Has to move at least 1px away from start
			//Find T shape down splits and add to results
			let split = img.getPixelColor(i, y + 1);
			if(split === boxCol) {
				results.push({
					x: i, //No need to rollback
					y: y
				});
			}

		}
	}

	results.push({
		x: img.bitmap.width - 1,
		y: y
	});
	return results;
}

function findBottomFromTopRight(img, x, y, boxCol, tlx, tly) {
	let results = [];
	for(let i = y; i < img.bitmap.height; i++) {
		let c = img.getPixelColor(x, i);
		if(c !== boxCol) {
			if(boxCol === HURTBOX && c === HITBOX) {
				//Special treatment for hurtboxes ending with a hitbox
				//Find bottom left and see if it also ends with a hitbox
				let blx = tlx;
				let bly = i;
				let blc = img.getPixelColor(blx, bly);
				if(img.getPixelColor(blx, bly - 1) === HURTBOX) {
					//This means bl also ends with a hitbox, and has hurtbox above.
					if(img.getPixelColor(blx + 1, bly - 1) !== HURTBOX) {
						//There is no line going to the right
						//This means hitbox line is actually hurtbox line!
						results.push({
							x: x,
							y: i //Do not rollback
						});
						//Also need to do a lil dirty set to trick check later on
						if(CURRENT_CHAR !== "C-Ciel") {
							img.setPixelColor(HURTBOX, blx + 1, bly);
						}
					} else {
						//There is a line, means hitbox is an actual end, return to the original functionality
						results.push({
							x: x,
							y: i - 1 //Rollback 1, we arent on boxCol now
						});
					}
				}
				continue; //Do not quit!
			} else if(boxCol === HURTBOX) {
				//Another special treatment for hurtboxes
				//Still do a little dirty trick
				//But only if there is a hurtbox in bl
				if(img.getPixelColor(tlx, i - 1) === HURTBOX) {
					if(CURRENT_CHAR !== "C-Ciel") {
						img.setPixelColor(HURTBOX, tlx + 1, i - 1);
					}

					results.push({
						x: x,
						y: i - 1 //Rollback 1, we arent on boxCol now
					});
				}
			} else {
				results.push({
					x: x,
					y: i - 1 //Rollback 1, we arent on boxCol now
				});
			}
			return results;
		} else if(i > y) { //Has to move at least 1px away from start
			//Find -| shape splits when moving down (split toward left)
			let split = img.getPixelColor(x - 1, i);
			if(split === boxCol) {
				results.push({
					x: x,
					y: i //No need to rollback
				});
			}
		}
	}

	results.push({
		x: x,
		y: img.bitmap.height - 1
	});
	return results;
}
