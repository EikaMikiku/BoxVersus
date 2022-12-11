window.addEventListener("load", () => {
	let DrawingContainer = document.getElementById("DrawingContainer");
	let DrawingImgDesc = document.getElementById("DrawingImgDesc");
	let DrawingBGCanvas = document.getElementById("DrawingBGCanvas");
	let DrawingBoxesCanvas = document.getElementById("DrawingBoxesCanvas");
	let DrawingPreviewCanvas = document.getElementById("DrawingPreviewCanvas");
	let TimeOverlay = document.getElementById("TimeOverlay");
	let Timer = document.getElementById("Timer");
	let HitboxBrushButton = document.getElementById("HitboxBrushButton");
	let HurtboxBrushButton = document.getElementById("HurtboxBrushButton");
	let UndoButton = document.getElementById("UndoButton");
	let DoneCheckbox = document.getElementById("DoneCheckbox");
	let ReadyButton = document.getElementById("ReadyButton");
	let ResultsContainer = document.getElementById("ResultsContainer");
	let ResultsList = document.getElementById("ResultsList");
	let ResultsActual = document.getElementById("ResultsActual");
	let ResultsActualImg = document.getElementById("ResultsActualImg");
	let ResultsActualTxt = document.getElementById("ResultsActualTxt");

	const CANVAS_PADDING = 50;

	let currentBoxes = [];
	let drawManager = new DrawManager(onBoxDraw, getCurrentBoxes);
	let ctx = DrawingBGCanvas.getContext("2d");
	let roundTimer = null;
	let roundIntervalTimer = null;
	let currentImageData = null;
	let currentImg = null;

	HitboxBrushButton.addEventListener("click", () => {
		HitboxBrushButton.classList.add("ms-action");
		HurtboxBrushButton.classList.remove("ms-action");
	});

	HurtboxBrushButton.addEventListener("click", () => {
		HurtboxBrushButton.classList.add("ms-action");
		HitboxBrushButton.classList.remove("ms-action");
	});

	UndoButton.addEventListener("click", () => {
		if(drawManager.canDraw) {
			currentBoxes.splice(currentBoxes.length - 1, 1);
		}
	});

	DoneCheckbox.addEventListener("change", () => {
		window.SOCKET.emit("done mark", DoneCheckbox.checked);
	});

	window.SOCKET.on("game start", (data) => {
		ResultsContainer.classList.add("d-none");
		DoneCheckbox.checked = false;
		currentBoxes = [];
		currentImageData = data;

		LoadImage(`/img/sprites/${data.char}/none/${data.move}.png`, (img) => {
			currentImg = img;
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

			ShowTimedown(() => {
				let startTime = Date.now();
				Timer.classList.remove("d-none");
				drawManager.canDraw = true;
				roundTimer = setTimeout(() => {
					onRoundEnd()
				}, window.ROUND_TIME);
				roundIntervalTimer = setInterval(() => {
					let sec = (Date.now() - startTime) / 1000;
					Timer.innerText = (window.ROUND_TIME / 1000 - sec).toFixed(2) + "s";
				});
			});
		});
	});

	function onRoundEnd() {
		clearInterval(roundIntervalTimer);
		Timer.innerText = "";
		Timer.classList.add("d-none");
		drawManager.canDraw = false;

		window.SOCKET.emit("round result", currentBoxes, CANVAS_PADDING + 1);
	}

	window.SOCKET.on("early end", () => {
		clearTimeout(roundTimer);
		onRoundEnd();
	});

	window.SOCKET.on("round results", (data) => {
		DrawingContainer.classList.add("d-none");
		ReadyButton.classList.remove("d-none");

		showResults(data);
	});

	function showResults(data) {
		ResultsContainer.classList.remove("d-none");
		ResultsActualImg.src = currentImg.src.replace("none", "full");
		ResultsActualImg.style.padding = CANVAS_PADDING + "px";
		ResultsActualTxt.innerText = `Actual ${currentImageData.char} ${ParseMove(currentImageData.move)}:`;

		data.sort((a, b) => {
			return b.score - a.score;
		});

		while(ResultsList.childElementCount > 0) {
			ResultsList.removeChild(ResultsList.firstChild);
		}

		for(let result of data) {
			let infoDiv = document.createElement("h6");
			infoDiv.innerText = `${currentImageData.char}'s ${ParseMove(currentImageData.move)} by ${result.username}:`;

			let accDiv = document.createElement("h6");
			accDiv.innerText = `${(result.score * 100).toFixed(3)}% accurate.`;
			accDiv.className = "score";

			let canvas = document.createElement("canvas");
			let w = currentImg.width + CANVAS_PADDING + CANVAS_PADDING;
			let h = currentImg.height + CANVAS_PADDING + CANVAS_PADDING;
			canvas.width = w;
			canvas.height = h;
			let ctx = canvas.getContext("2d");
			ctx.drawImage(currentImg, CANVAS_PADDING, CANVAS_PADDING);
			for(let box of result.boxes) {
				if(box.type === "HITBOX") {
					ctx.strokeStyle = DrawManager.HitboxStrokeStyle;
					ctx.fillStyle = DrawManager.HitboxFillStyle;
				} else {
					ctx.strokeStyle = DrawManager.HurtboxStrokeStyle;
					ctx.fillStyle = DrawManager.HurtboxFillStyle;
				}
				let rw = box.end.x - box.start.x;
				let rh = box.end.y - box.start.y;
				ctx.fillRect(box.start.x - 0.5, box.start.y - 0.5, rw, rh);
				ctx.strokeRect(box.start.x - 0.5, box.start.y - 0.5, rw, rh);
			}
			ResultsList.appendChild(infoDiv);
			ResultsList.appendChild(canvas);
			ResultsList.appendChild(accDiv);
		}
	}

	function onBoxDraw(box) {
		currentBoxes.push(box);
		/*
		currentBoxes.sort((a, b) => {
			return b.type === "HITBOX" ? -1 : 1;
		});
		*/
	}

	function getCurrentBoxes() {
		return currentBoxes;
	}

	function ShowTimedown(cb) {
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
				cb();
			}, 500);
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
