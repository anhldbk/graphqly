const { Resolvable } = require("../base");

class Query extends Resolvable {
  constructor(def) {
    super("query", def);
  }
}

module.exports = Query;
