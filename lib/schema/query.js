const { Resolvable } = require("../base");

class Query extends Resolvable {
	constructor(def) {
		super("query", def);
	}

	wrap(fn) {
		return super.wrap(fn, true);
	}

	preHook({ options = {}, handle }){
		
	}
}

module.exports = Query;
