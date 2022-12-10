window.addEventListener("load", () => {
	let DrawingContainer = document.getElementById("DrawingContainer");
	let DrawingImgDesc = document.getElementById("DrawingImgDesc");
	let DrawingBGCanvas = document.getElementById("DrawingBGCanvas");
	let DrawingBoxesCanvas = document.getElementById("DrawingBoxesCanvas");
	let DrawingPreviewCanvas = document.getElementById("DrawingPreviewCanvas");
	let TimeOverlay = document.getElementById("TimeOverlay");
	let HitboxBrushButton = document.getElementById("HitboxBrushButton");
	let HurtboxBrushButton = document.getElementById("HurtboxBrushButton");
	let UndoButton = document.getElementById("UndoButton");

	const CANVAS_PADDING = 50;

	let currentBoxes = [];
	let manager = DrawManager(onBoxDraw, getCurrentBoxes);
	let ctx = DrawingBGCanvas.getContext("2d");

	HitboxBrushButton.addEventListener("click", () => {
		HitboxBrushButton.classList.add("ms-action");
		HurtboxBrushButton.classList.remove("ms-action");
	});

	HurtboxBrushButton.addEventListener("click", () => {
		HurtboxBrushButton.classList.add("ms-action");
		HitboxBrushButton.classList.remove("ms-action");
	});

	UndoButton.addEventListener("click", () => {
		currentBoxes.splice(currentBoxes.length - 1, 1);
	});

	window.SOCKET.on("game start", (data) => {
		currentBoxes = [];

		LoadImage(`/img/sprites/${data.char}/none/${data.move}.png`, (img) => {
			DrawingContainer.classList.remove("d-none");
			DrawingImgDesc.innerText = `${data.char}: ${ParseMove(data.move)}`;
			let w = img.width + CANVAS_PADDING + CANVAS_PADDING;
			let h = img.height + CANVAS_PADDING + CANVAS_PADDING;
			DrawingBGCanvas.width = w;
			DrawingBGCanvas.height = h;
			DrawingBoxesCanvas.width = w;
			DrawingBoxesCanvas.height = h;
			DrawingPreviewCanvas.width = w;
			DrawingPreviewCanvas.height = h;
			DrawingBGCanvas.parentElement.style.width = `${w}px`;
			DrawingBGCanvas.parentElement.style.height = `${h}px`;
			ctx.drawImage(img, CANVAS_PADDING, CANVAS_PADDING);

			ShowTimedown();
		});
	});

	function onBoxDraw(box) {
		console.log("box", box);
		currentBoxes.push(box);
	}

	function getCurrentBoxes() {
		return currentBoxes;
	}

	function ShowTimedown() {
		let timer = null;
		let startTime = Date.now();
		TimeOverlay.classList.remove("d-none");
		setTimeout(() => {
			clearInterval(timer);
			TimeOverlay.innerText = "Go!";
			TimeOverlay.style.opacity = 0;
			setTimeout(() => {
				TimeOverlay.style.opacity = 1;
				TimeOverlay.classList.add("d-none");
				TimeOverlay.innerText = "";
			}, 950);
		}, 3000);
		timer = setInterval(() => {
			let sec = Math.ceil((Date.now() - startTime) / 1000);
			TimeOverlay.innerText = sec + "!";
		});
	}

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
