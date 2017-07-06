const _ = require("lodash");
const Definable = require("./definable");

class Extendable extends Definable {
  constructor(kind, name) {
    super(kind, name);
    this._parent = null;
    this.ext = this.extend; // short version
  }

  extend(parent) {
    if (!_.isString(parent)) {
      throw new Error("Invalid parent");
    }
    this._parent = parent;
    return this;
  }
}

module.exports = Extendable;
