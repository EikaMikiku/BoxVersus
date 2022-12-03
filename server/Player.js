export default class Player {
	static GenerateUsername() {
		return "" + Math.floor(Math.random() * 10000);
	}

	constructor(socket, username) {
		this.socket = socket;
		this.username = username || Player.GenerateUsername();
	}

	getData() {
		return {
			username: this.username
		};
	}
}
