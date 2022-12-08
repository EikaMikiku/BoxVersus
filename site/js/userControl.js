window.addEventListener("load", () => {
	let UpdateUsernameButton = document.getElementById("UpdateUsernameButton");
	let ReadyButton = document.getElementById("ReadyButton");

	UpdateUsernameButton.addEventListener("click", () => {
		let username = prompt("Enter your new username");
		if(username.trim().length > 0 && username.trim().length < 20) {
			window.localStorage.setItem("username", username);
			window.SOCKET.emit("username changed", username);
		}
	});

	ReadyButton.addEventListener("click", () => {
		window.SOCKET.emit("player ready");
		ReadyButton.classList.add("d-none");
	});
});