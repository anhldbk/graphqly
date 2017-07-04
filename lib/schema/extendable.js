const _ = require('lodash');

class Extendable {
  constructor(kind, name) {
    if(!_.isString(name)){
      throw new Error("Invalid name");
    }
    this._parent = null;
    this._name = name;
    this._kind = kind;
    this.extend = this.extend.bind(this);
    this.ext = this.extend; // short version
  }

  extend(parent){
    if(!_.isString(parent)){
      throw new Error("Invalid parent");
    }
    this._parent = parent;
    return this;
  }

}

module.exports = Extendable;
