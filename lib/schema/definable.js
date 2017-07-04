const _ = require('lodash');
const Extendable = require('./extendable');

class Definable extends Extendable{
  constructor(kind, name) {
    super(kind, name);
    this.defines = this.defines.bind(this);
    this.defs = this.defines;
  }

  defines(fields){
    if(!_.isString(fields)){
      throw new Error("Invalid fields");
    }
    this._fields= fields;
    return this;
  }
}

module.exports = Definable;
