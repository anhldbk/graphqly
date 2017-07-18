const _ = require("lodash");
const { Extendable } = require("../base");

class Input extends Extendable {
	constructor(name) {
		super("input", name);
	}
}

module.exports = Input;
