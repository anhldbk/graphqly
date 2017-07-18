const { Resolvable } = require("../base");

class Query extends Resolvable {
  constructor(def) {
    super("query", def);
  }
  wrap(fn) {
    super.wrap(fn, true);
  }
}

module.exports = Query;
