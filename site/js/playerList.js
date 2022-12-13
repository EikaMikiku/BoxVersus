window.addEventListener("load", () => {
	window.SOCKET.on("player list", (playerList) => {
		UpdatePlayerList(playerList);
	});

	let PlayerList = document.getElementById("PlayerList");

	function UpdatePlayerList(list) {
		while(PlayerList.childElementCount > 0) {
			PlayerList.removeChild(PlayerList.firstChild);
		}

		for(let player of list) {
			let div = document.createElement("div");
			div.setAttribute("p-id", player.socketID);

			div.classList = "player";

			if(player.isReady) {
				div.classList.add("ready");
			}

			if(player.submitted) {
				div.classList.add("submitted");
			} else if(player.isDone) {
				div.classList.add("done");
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