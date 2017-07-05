const _ = require('lodash');
const {Extendable} = require('../base');

class Enum extends Extendable{
  constructor(name) {
    super("enum", name);
  }
}

module.exports = Enum;
