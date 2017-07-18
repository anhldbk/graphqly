const { Resolvable } = require("../base");

class Mutation extends Resolvable {
	constructor(def) {
		super("mutation", def);
	}
	wrap(fn) {
		return super.wrap(fn, false);
	}
}

module.exports = Mutation;
