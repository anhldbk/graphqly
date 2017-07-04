const _ = require('lodash');
const Extendable = require('./extendable');

class Definable extends Extendable{
  constructor(kind, name) {
    super(kind, name);
    this.define = this.define.bind(this);
    this.def = this.define;
  }

  define(fields){
    if(!_.isString(fields)){
      throw new Error("Invalid fields");
    }
    this._fields= fields;
    return this;
  }
}

module.exports = Definable;
