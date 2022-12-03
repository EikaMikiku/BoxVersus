window.addEventListener("load", () => {
	window.SOCKET.on("chat message", (msgData) => {
		AddPlayerMessage(msgData);
	});
	window.SOCKET.on("player left", (msgData) => {
		AddServerMessage(`**${msgData.username} left**`);
	});
	window.SOCKET.on("player joined", (msgData) => {
		AddServerMessage(`**${msgData.username} joined**`);
	});
	window.SOCKET.on("username change", (msgData) => {
		AddServerMessage(`**${msgData.prev} is now ${msgData.new}**`);
	});

	let ChatContainer = document.getElementById("ChatContainer");
	let ChatMessages = document.getElementById("ChatMessages");
	let ChatInput = document.getElementById("ChatInput");

	ChatInput.addEventListener("keydown", (e) => {
		if(e.key === "Enter" && ChatInput.value.length > 0) {
			window.SOCKET.emit("chat message", ChatInput.value);
			ChatInput.value = "";
		}
	});

	function AddPlayerMessage(msgData) {
		let div = document.createElement("div");
		div.className = "message player";

		let dateSpan = document.createElement("span");
		dateSpan.className = "date";
		dateSpan.innerText = (new Date(msgData.time)).toISOString().substring(11, 19);

		let usernameSpan = document.createElement("span");
		usernameSpan.className = "username";
		usernameSpan.innerText = msgData.username;

		let contentSpan = document.createElement("span");
		contentSpan.className = "msg";
		contentSpan.innerText = msgData.content;

		div.appendChild(dateSpan);
		div.appendChild(usernameSpan);
		div.appendChild(contentSpan);

		ChatMessages.appendChild(div);
		ChatMessages.appendChild(document.createElement("br"));
		ChatMessages.scrollTop = ChatMessages.scrollHeight;
	}

	function AddServerMessage(msg) {
		let div = document.createElement("div");
		div.className = "message server";

		let usernameSpan = document.createElement("span");
		usernameSpan.className = "msg";
		usernameSpan.innerText = msg;

		div.appendChild(usernameSpan);

		ChatMessages.appendChild(div);
		ChatMessages.scrollTop = ChatMessages.scrollHeight;
	}
});