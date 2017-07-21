const _ = require("lodash");
const { getDependencies } = require("../utils");

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
    this._dependencies = getDependencies(definition);
    return this;
  }

  _getFields(definition) {
    const tokens = definition.split(/[\n:,]+/);
    return _.chain(tokens)
      .map(token => token.trim())
      .filter((token, index) => token.length !== 0 && index % 2 !== 0)
      .value();
  }
}

module.exports = Definable;
