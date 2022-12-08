window.addEventListener("load", () => {
	let DrawingContainer = document.getElementById("DrawingContainer");
	let DrawingImgDesc = document.getElementById("DrawingImgDesc");
	let DrawingCanvas = document.getElementById("DrawingCanvas");
	let HitboxBrushButton = document.getElementById("HitboxBrushButton");
	let HurtboxBrushButton = document.getElementById("HurtboxBrushButton");
	let UndoButton = document.getElementById("UndoButton");

	const CANVAS_PADDING = 30;

	let ctx = DrawingCanvas.getContext("2d");

	window.SOCKET.on("game start", (data) => {
		DrawingContainer.classList.remove("d-none");

		LoadImage(`/img/sprites/${data.char}/none/${data.move}.png`, (img) => {
			DrawingImgDesc.innerText = `${data.char}: ${ParseMove(data.move)}`;
			DrawingCanvas.width = img.width + CANVAS_PADDING + CANVAS_PADDING;
			DrawingCanvas.height = img.height + CANVAS_PADDING + CANVAS_PADDING;
			ctx.drawImage(img, CANVAS_PADDING, CANVAS_PADDING);
		});
	});

	function LoadImage(src, cb) {
		let img = new Image();
		img.src = src;
		img.addEventListener("load", () => {
			cb(img);
		});
	}

	function ParseMove(move) {
		if(move === "HBE5C") return "5{C}";
		if(move === "6ABC214C") return "6ABC 214C";
		if(move === "6ABC236C") return "6ABC 236C";
		if(move === "6CC236C") return "6CC 236C";

		if(move.length === 2) {
			return move;
		} else if(move.length === 3) {
			if(move.match(/\d$/)) {
				return move.substring(0, 2) + `(${move[2]})`;
			} else {
				return move;
			}
		} else if(move.length === 4) {
			if(move.startsWith("BE")) {
				return move.substring(2, 3) + `[${move.substring(3, 4)}]`;
			} else if(move.includes("j")) {
				return move.substring(0, 3) + `(${move[3]})`;
			} else if(move.match(/\d$/)) {
				return move.substring(0, 3) + `(${move[3]})`;
			} else {
				return move;
			}
		} else if(move.length === 5) {
			if(move.startsWith("BE")) {
				if(move.startsWith("BEj")) {
					if(move.match(/\d$/)) {
						return move.substring(2, 3) + `[${move.substring(3, 4)}](${move[4]})`;
					} else {
						return move.substring(2, 4) + `[${move.substring(4, 5)}]`;
					}
				} else {
					return move.substring(2, 3) + `[${move.substring(3, 4)}]` + `(${move.substring(4, 5)})`;
				}
			} else if(move.includes("BE")) {
				let start = move.indexOf("BE");
				return move.substring(0, start) + `[${move.substring(start + 2)}]`;
			} else {
				return move;
			}
		}

		return move;
	}
});
