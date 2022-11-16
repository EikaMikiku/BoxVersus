import http from "http";
import express from "express";
import config from "./config.js";
import GameServer from "./server/GameServer.js";
import { Server } from "socket.io";

let port = config.port || 10800;
let app = express();

app.use(express.json());

let httpServer = http.Server(app);
let io = new Server(httpServer);
let gs = new GameServer(config, app, io);

app.use(express.static("./site", {extensions:["html"]}));

httpServer.listen(port, () => console.log(`Listening on: ${port}!`));
