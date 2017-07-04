const _ = require("lodash");
const Definable = require("./definable");

class Interface extends Definable {
  constructor(name) {
    super("enum", name);
    this.resolve = this.resolve.bind(this);
  }

  resolve(mapping) {
    if (!_.isObject(mapping)) {
      throw new Error("Invalid mapping");
    }
    this._mapping = mapping;
  }
}

module.exports = Interface;
