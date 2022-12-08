window.addEventListener("load", () => {
	let UpdateUsernameButton = document.getElementById("UpdateUsernameButton");

	UpdateUsernameButton.addEventListener("click", () => {
		let username = prompt("Enter your new username");
		if(username.trim().length > 0 && username.trim().length < 20) {
			window.localStorage.setItem("username", username);
			window.SOCKET.emit("username changed", username);
		} else {
			alert("Bad username.");
		}
	});
});