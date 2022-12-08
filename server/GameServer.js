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

				this.io.to(room.id).emit("player list", room.players.map(x => x.getData()));

				if(room.allPlayersReady() && room.players.length > 1) {
					this.io.to(room.id).emit("game start", GameManager.GetRandomMove());
				}
			});
		});
	}

	bindRoutes() {
		this.app.get("/", (req, res) => {
			return res.status(200).send(this.viewManager.render("index.ejs"));
		});
		this.app.post("/createRoom", (req, res) => {
			return res.status(200).send(this.roomManager.createRoom().id);
		});
		this.app.post("/joinRoom", (req, res) => {
			return res.sendStatus(404);
		});
		this.app.get("/room/:roomID", (req, res) => {
			let roomID = req.params.roomID;

			if(!this.roomManager.hasRoom(roomID)) {
				return res.sendStatus(404);
			}

			return res.status(200).send(this.viewManager.render("game.ejs", {
				roomID: roomID
			}));
		});
	}
}
