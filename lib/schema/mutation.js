const { Resolvable } = require("../base");

class Mutation extends Resolvable {
  constructor(def) {
    super("mutation", def);
  }
  wrap(fn) {
    super.wrap(fn, false);
  }
}

module.exports = Mutation;
