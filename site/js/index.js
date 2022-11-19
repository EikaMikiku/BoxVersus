CreateRoomButton.onclick = function() {
	fetch("/createRoom", {
		method: "POST",
		cache: "no-cache"
	})
	.then(r => r.text())
	.then(roomid => console.log(`Room ID: ${roomid}`));
};
JoinRoomButton.onclick = function() {
	alert("Not implemented yet :(");
};