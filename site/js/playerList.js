window.addEventListener("load", () => {
	window.SOCKET.on("player left", (msgData) => {
		window.SOCKET.emit("player list");
	});
	window.SOCKET.on("player joined", (msgData) => {
		window.SOCKET.emit("player list");
	});
	window.SOCKET.on("player list", (playerList) => {
		UpdatePlayerList(playerList);
	});
	window.SOCKET.emit("player list");

	let PlayerList = document.getElementById("PlayerList");

	function UpdatePlayerList(list) {
		while(PlayerList.childElementCount > 0) {
			PlayerList.removeChild(PlayerList.firstChild);
		}

		console.log(list)
		for(let player of list) {
			let div = document.createElement("div");
			div.setAttribute("p-id", player.socketID);

			div.classList = "player";

			if(player.isReady) {
				div.classList.add("ready");
			}

			if(player.submitted) {
				div.classList.add("submitted");
			}

			if(player.socketID === window.SOCKET.id) {
				div.innerText = "(You) " + player.username;
			} else {
				div.innerText = player.username;
			}

			PlayerList.appendChild(div);
		}
	}
});