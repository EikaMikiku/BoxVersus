let VALID_ROOMID_CHARS = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default class RoomManager {
	constructor(config) {
		this.config = config;
		this.rooms = [];
	}

	createRoom() {
		//Generating a unique ID that doesn't match existing room IDs
		let notFound = true;
		let genid;

		while(notFound) {
			genid = createRoomID();
			notFound = false;
			for(let i = 0; i < this.rooms.length; i++) {
				if(genid === this.rooms.id) {
					notFound = true;
					break;
				}
			}
		}

		var room = new Room(genid);
		this.rooms.push(room);
		return room;
	}

	hasRoom(roomID) {
		return !!this.rooms.find(room => room.id === roomID);
	}
};

class Room {
	constructor(id) {
		this.id = id;
	}
}

function createRoomID() {
	let str = "";
	for(let i = 0; i < 5; i++) {
		str += VALID_ROOMID_CHARS[Math.floor(Math.random() * VALID_ROOMID_CHARS.length)];
	}
	return str;
}