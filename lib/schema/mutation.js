const { Resolvable } = require("../base");

class Mutation extends Resolvable {
  constructor(def) {
    super("mutation", def);
  }
}

module.exports = Mutation;
