CreateRoomButton.onclick = function() {
	fetch("/createRoom", {
		method: "POST",
		cache: "no-cache"
	})
	.then(r => r.text())
	.then(roomID => {
		alert(`Room ID: ${roomID}`);
		window.location = "/room/" + roomID;
	});
};
JoinRoomButton.onclick = function() {
	window.location = "/room/" + prompt("Enter a room ID:");
};