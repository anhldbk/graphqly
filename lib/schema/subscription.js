const { Resolvable } = require("../base");

class Subscription extends Resolvable {
	constructor(def) {
		super("subscription", def);
	}

	wrap(fn) {
		return super.wrapSubscription(fn);
	}	
}

module.exports = Subscription;
