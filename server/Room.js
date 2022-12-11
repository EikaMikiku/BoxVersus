export default  class Room {
	#expiryTimer = null;

	constructor(id) {
		this.id = id;
		this.players = [];
		this.currentMove = null;
		this.roundEndTimer = null;
		this.roundDuration = 30;
	}

	addPlayer(player) {
		return this.players.push(player);
	}

	getPlayerBySocketID(socketID) {
		return this.players.find(player => player.socket.id === socketID);
	}

	removePlayerBySocketID(socketID) {
		let idx = this.players.findIndex(p => p.socket.id === socketID);
		return this.players.splice(idx, 1);
	}

	startExpiring(cb) {
		if(this.#expiryTimer) {
			console.error(`Room ${this.id} is already expiring. Something went wrong.`);
			stopExpiring();
		}
		this.#expiryTimer = setTimeout(() => cb(), 1000 * 60 * 5); //5min
	}

	stopExpiring() {
		clearTimeout(this.#expiryTimer);
		this.#expiryTimer = null;
	}

	allPlayersReady() {
		return !this.players.find(player => !player.isReady);
	}

	allPlayersDone() {
		return !this.players.find(player => !player.isDone);
	}

	onGameStart() {
		for(let player of this.players) {
			player.isReady = false;
		}
	}
	onGameEnd() {
		for(let player of this.players) {
			player.isReady = false;
			player.boxData = null;
			player.isDone = false;
			player.currentScore = 0;
		}
	}
}