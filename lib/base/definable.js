const _ = require("lodash");

class Definable {
  constructor(kind, name) {
    if (!_.isString(name)) {
      throw new Error("Invalid name");
    }
    this._name = name;
    this._kind = kind;
    this.def = this.define;
  }

  isInterface() {
    return this._kind == "interface";
  }

  isType() {
    return this._kind == "type";
  }

  isEnum() {
    return this._kind == "enum";
  }

  define(fields) {
    if (!_.isString(fields)) {
      throw new Error("Invalid fields");
    }
    this._fields = fields;
    return this;
  }
}

module.exports = Definable;
