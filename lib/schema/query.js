const { Resolvable } = require("../base");

class Query extends Resolvable {
	constructor(def) {
		super("query", def);
	}

	wrap(fn) {
		return super.wrapQuery(fn);
	}
}

module.exports = Query;
