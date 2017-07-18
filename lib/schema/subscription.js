const { Resolvable } = require("../base");

class Subscription extends Resolvable {
	constructor(def) {
		super("subscription", def);
	}
}

module.exports = Subscription;
