window.addEventListener("load", () => {
	let UpdateUsernameButton = document.getElementById("UpdateUsernameButton");

	UpdateUsernameButton.addEventListener("click", () => {
		var username = prompt("Enter your new username");
		if(username.trim().length > 0) {
			window.localStorage.setItem("username", username);
			window.SOCKET.emit("username changed", username);
		}
	});
});