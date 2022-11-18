import fs from "fs";
import RoomManager from "./RoomManager.js";
import ViewManager from "./ViewManager.js";

const MOVES_LOCATION = "./server/moves";

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
		//console.log(this.getRandomMove());
	}

	bindEvents() {
		this.io.on('connection', (socket) => {
			console.log('a user connected');
		});
	}

	bindRoutes() {
		this.app.post("/createRoom", (req, res) => {
			res.status(200).send(this.roomManager.createRoom().id);
		});
		this.app.post("/joinRoom", (req, res) => {
			res.sendStatus(404);
		});
		this.app.get("/room/:roomID", (req, res) => {
			console.log(req.params)
			res.status(200).send(this.viewManager.render("game.ejs", {wow:321}));
		});
	}

	getRandomMove() {
		let all = {};
		let chars = fs.readdirSync(MOVES_LOCATION);
		for(let char of chars) {
			let moves = fs.readdirSync(`${MOVES_LOCATION}/${char}/`);
			all[char] = moves;
		}

		let charKeys = Object.keys(all);
		let rndChar = charKeys[Math.floor(Math.random() * charKeys.length)];
		let charMoves = all[rndChar];
		let rndMove = charMoves[Math.floor(Math.random() * charMoves.length)];

		return {
			char: rndChar,
			move: rndMove,
			data: JSON.parse(fs.readFileSync(`${MOVES_LOCATION}/${rndChar}/${rndMove}`, "UTF-8"))
		};
	}
};
