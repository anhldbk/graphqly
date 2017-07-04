const _ = require('lodash');

class Extendable {
  constructor(kind, name) {
    if(_.isString(name)){
      throw new Error("Invalid name");
    }
    this._parent = null;
    this._name = name;
    this._kind = kind;
    this.extends = this.extends.bind(this);
    this.exts = this.extends; // short version
  }

  extends(parent){
    if(_.isString(parent)){
      throw new Error("Invalid parent");
    }
    this._parent = parent;
    return this;
  }

}

module.exports = Extendable;
