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

		for(let player of list) {
			let div = document.createElement("div");
			div.className = "player";
			div.innerText = player.username;

			PlayerList.appendChild(div);
		}
	}
});