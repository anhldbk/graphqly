const { Resolvable } = require("../base");

class Mutation extends Resolvable {
	constructor(def) {
		super("mutation", def);
	}
	wrap(fn) {
		return super.wrapMutation(fn);
	}
}

module.exports = Mutation;
