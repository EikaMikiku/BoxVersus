export default class Player {
	static GenerateUsername() {
		return "User" + Math.floor(Math.random() * 10000);
	}

	constructor(socket, username) {
		this.socket = socket;
		this.username = username || Player.GenerateUsername();
		this.isReady = false;
		this.boxData = null;
		this.isDone = false;
		this.currentScore = 0;
	}

	getData() {
		return {
			username: this.username,
			socketID: this.socket.id,
			isReady: this.isReady,
			submitted: !!this.boxData,
			isDone: this.isDone
		};
	}

	getResults() {
		return {
			username: this.username,
			socketID: this.socket.id,
			score: this.currentScore,
			boxes: this.boxData
		};
	}
}
