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

  define(definition) {
    if (!_.isString(definition)) {
      throw new Error("Invalid definition");
    }
    this._def = definition;
    this._fields = this._getFields(definition);
    return this;
  }

  _getFields(definition) {
    const tokens = definition.split(/[\n:,]+/);
    return _.filter(tokens, (token, index) => (token.length !== 0 && index % 2 === 0));
  }
}

module.exports = Definable;
