function DrawManager(onBoxDraw, getBoxes) {
	this.canDraw = false;
	const HITBOX = "HITBOX";
	const HURTBOX = "HURTBOX";

	let DrawingBGCanvas = document.getElementById("DrawingBGCanvas");
	let DrawingBoxesCanvas = document.getElementById("DrawingBoxesCanvas");
	let DrawingPreviewCanvas = document.getElementById("DrawingPreviewCanvas");

	let previewCtx = DrawingPreviewCanvas.getContext("2d");
	let boxesCtx = DrawingBoxesCanvas.getContext("2d");

	previewCtx.lineWidth = 1;
	boxesCtx.lineWidth = 1;

	let isDown = false;
	let currentBox = null;

	DrawingPreviewCanvas.addEventListener("mousedown", (e) => {
		if(!this.canDraw) return;

		isDown = true;
		currentBox = {
			type: GetDrawType(),
			start: {
				x: e.offsetX,
				y: e.offsetY
			}
		};
		currentBox.end = currentBox.start;
	});

	DrawingPreviewCanvas.addEventListener("mousemove", (e) => {
		if(isDown) {
			currentBox.end = {
				x: e.offsetX,
				y: e.offsetY
			};
		}
	});

	DrawingPreviewCanvas.addEventListener("mouseleave", () => {
		isDown = false;
	});

	DrawingPreviewCanvas.addEventListener("mouseup", (e) => {
		if(!this.canDraw) {
			if(currentBox) {
				currentBox = null;
			}
			return;
		}

		isDown = false;
		if(currentBox && currentBox.end !== currentBox.start) {
			onBoxDraw(currentBox);
			currentBox = null;
		}
	});

	function GetDrawType() {
		return HitboxBrushButton.classList.contains("ms-action") ? HITBOX : HURTBOX;
	}

	function RenderBoxes() {
		requestAnimationFrame(RenderBoxes);
		previewCtx.clearRect(0, 0, previewCtx.canvas.width, previewCtx.canvas.height);
		boxesCtx.clearRect(0, 0, boxesCtx.canvas.width, boxesCtx.canvas.height);

		let boxes = getBoxes();
		for(let box of boxes) {
			if(box.type === HITBOX) {
				boxesCtx.strokeStyle = "red";
			} else {
				boxesCtx.strokeStyle = "lime";
			}
			let w = box.end.x - box.start.x;
			let h = box.end.y - box.start.y;
			boxesCtx.strokeRect(box.start.x - 0.5, box.start.y - 0.5, w, h);
		}

		if(!currentBox || !currentBox.end) return;

		let w = currentBox.end.x - currentBox.start.x;
		let h = currentBox.end.y - currentBox.start.y;

		if(currentBox.type === HITBOX) {
			previewCtx.strokeStyle = "red";
		} else {
			previewCtx.strokeStyle = "lime";
		}

		previewCtx.strokeRect(currentBox.start.x - 0.5, currentBox.start.y - 0.5, w, h);
	}

	requestAnimationFrame(RenderBoxes);
}