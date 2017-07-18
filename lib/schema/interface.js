const _ = require("lodash");
const { Extendable } = require("../base");

class Interface extends Extendable {
	constructor(name) {
		super("interface", name);
		this.resolve = this.resolve.bind(this);
	}

	resolve(mapping) {
		if (!_.isObject(mapping)) {
			throw new Error("Invalid mapping");
		}
		this._mapping = mapping;
	}
}

module.exports = Interface;
