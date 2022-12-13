CreateRoomButton.onclick = function() {
	let RoomRoundDuration = document.getElementById("RoomRoundDuration");
	fetch("/createRoom?RoundDuration=" + RoomRoundDuration.value, {
		method: "POST",
		cache: "no-cache"
	})
	.then(r => r.text())
	.then(roomID => {
		window.location = "/room/" + roomID;
	});
};
JoinRoomButton.onclick = function() {
	let roomID = prompt("Enter a room ID:");
	if(!roomID) {
		alert("Enter the room ID.");
	} else {
		window.location = "/room/" + prompt("Enter a room ID:");
	}
};