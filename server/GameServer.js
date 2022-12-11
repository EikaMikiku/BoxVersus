import fs from "fs";
import RoomManager from "./RoomManager.js";
import ViewManager from "./ViewManager.js";
import Player from "./Player.js";
import GameManager from "./GameManager.js";

let chars = {};

export default class GameServer {
	constructor(config, app, io) {
		this.config = config;
		this.app = app;
		this.roomManager = new RoomManager(config);
		this.viewManager = new ViewManager(this, config);
		this.io = io;
		this.bindEvents();
		this.bindRoutes();

		setInterval(() => {
			for(let room of this.roomManager.rooms) {
				console.log(room.id);
				console.log("Player count", room.players.length);
				console.log("Players", room.players.reduce((acc, curr) => acc + curr.username + ", ", ""));
				console.log("----------");
			}
			console.log("===============");
			console.log("===============");
		}, 5000);
	}

	bindEvents() {
		this.io.on("connection", (socket) => {
			socket.on("join room", (roomID, username) => {
				let room = this.roomManager.getRoom(roomID);
				if(!room) return;

				let player = new Player(socket, username);
				room.addPlayer(player);
				socket.join(room.id);
				socket.to(room.id).emit("player joined", {
					username: player.username
				});
				this.roomManager.stopRoomExpiry(room);
			});

			socket.on("chat message", (content) => {
				let room = this.roomManager.getRoomByPlayerSocketID(socket.id);
				if(!room) return;

				let player = room.getPlayerBySocketID(socket.id);
				if(!player) return;

				this.io.to(room.id).emit("chat message", {
					time: Date.now(),
					username: player.username,
					content: content,
					socketID: socket.id
				});
			});

			socket.on("disconnect", (reason) => {
				let room = this.roomManager.getRoomByPlayerSocketID(socket.id);
				if(!room) return;

				let player = room.getPlayerBySocketID(socket.id);
				if(!player) return;

				room.removePlayerBySocketID(socket.id);
				this.io.to(room.id).emit("player left", {
					username: player.username
				});

				if(room.players.length === 0) {
					this.roomManager.startRoomExpiry(room);
				} else {
					if(room.allPlayersReady() && room.players.length >= 1) {
						room.currentMove = GameManager.GetRandomMove();
						this.io.to(room.id).emit("game start", room.currentMove);
						room.onGameStart();
					} else {
						if(room.allPlayersDone()) {
							this.io.to(room.id).emit("early end");
						}
					}
				}
			});

			socket.on("player list", () => {
				let room = this.roomManager.getRoomByPlayerSocketID(socket.id);
				if(!room) return;

				socket.emit("player list", room.players.map(x => x.getData()));
			});

			socket.on("username changed", (newUsername) => {
				let room = this.roomManager.getRoomByPlayerSocketID(socket.id);
				if(!room) return;

				let player = room.getPlayerBySocketID(socket.id);
				if(!player) return;

				let oldUsername = player.username;
				if(newUsername.trim().length > 0 && newUsername.trim().length < 20) {
					player.username = newUsername;
				} else {
					player.username = Player.GenerateUsername();
				}

				this.io.to(room.id).emit("player list", room.players.map(x => x.getData()));
				this.io.to(room.id).emit("username change", {
					prev: oldUsername,
					new: newUsername
				});
			});

			socket.on("player ready", () => {
				let room = this.roomManager.getRoomByPlayerSocketID(socket.id);
				if(!room) return;

				let player = room.getPlayerBySocketID(socket.id);
				if(!player) return;

				player.isReady = true;

				if(room.allPlayersReady() && room.players.length >= 1) {
					room.currentMove = GameManager.GetRandomMove();
					this.io.to(room.id).emit("game start", room.currentMove);
					room.onGameStart();
				}

				this.io.to(room.id).emit("player list", room.players.map(x => x.getData()));
			});

			socket.on("round result", (boxData, boxOffset) => {
				let room = this.roomManager.getRoomByPlayerSocketID(socket.id);
				if(!room) return;

				let player = room.getPlayerBySocketID(socket.id);
				if(!player) return;

				player.boxData = boxData;

				player.currentScore = GameManager.CalculateScore(boxData, boxOffset, room.currentMove);

				//This is to reduce potential race conditions
				clearTimeout(room.roundEndTimer);
				room.roundEndTimer = setTimeout(() => {
					let roundEndOK = checkForRoundEnd(room);
					if(roundEndOK) {
						//Send over results
						this.io.to(room.id).emit("round results", room.players.map(x => x.getResults()));
						//Reset player states
						room.onGameEnd();
						//Send new states
						this.io.to(room.id).emit("player list", room.players.map(x => x.getData()));
					}
				}, 200);

				this.io.to(room.id).emit("player list", room.players.map(x => x.getData()));
			});

			socket.on("done mark", (val) => {
				let room = this.roomManager.getRoomByPlayerSocketID(socket.id);
				if(!room) return;

				let player = room.getPlayerBySocketID(socket.id);
				if(!player) return;

				player.isDone = !!val;

				this.io.to(room.id).emit("player list", room.players.map(x => x.getData()));

				//if all players are done, early round end
				if(room.allPlayersDone()) {
					this.io.to(room.id).emit("early end");
				}
			});

			function checkForRoundEnd(room) {
				for(let player of room.players) {
					if(!player.boxData) {
						return false;
					}
				}
				return true;
			}
		});
	}

	bindRoutes() {
		this.app.get("/", (req, res) => {
			return res.status(200).send(this.viewManager.render("index.ejs"));
		});
		this.app.post("/createRoom", (req, res) => {
			let roundDuration = parseInt(req.query.RoundDuration);
			if(typeof roundDuration !== "number") roundDuration = 30;
			if(roundDuration.toString() !== req.query.RoundDuration) roundDuration = 30;
			if(roundDuration < 10) roundDuration = 10;
			if(roundDuration > 1000) roundDuration = 1000;

			let room = this.roomManager.createRoom();
			room.roundDuration = roundDuration;
			return res.status(200).send(room.id);
		});
		this.app.get("/room/:roomID", (req, res) => {
			let roomID = req.params.roomID;

			if(!this.roomManager.hasRoom(roomID)) {
				return res.sendStatus(404);
			}

			return res.status(200).send(this.viewManager.render("game.ejs", {
				roomID: roomID,
				roomRoundDuration: this.roomManager.getRoom(roomID).roundDuration
			}));
		});
	}
}
