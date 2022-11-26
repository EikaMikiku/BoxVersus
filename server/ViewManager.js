import fs from "fs";
import ejs from "ejs";

export default class ViewManager {

	constructor(server, config) {
		this.server = server;
		this.location = config.views;
		this.views = {};

		let viewsArray = fs.readdirSync(this.location);

		for(let file of viewsArray) {
			let content = fs.readFileSync(`${this.location}/${file}`, "UTF-8");
			this.views[file] = ejs.compile(content, {
				outputFunctionName: "print"
			});
		}
	}

	render(name, data) {
		data = data || {};
		data.server = this.server;
		return this.views[name](data);
	}
}
