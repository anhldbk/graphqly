const _ = require('lodash');
const Definable = require('./definable');

class Enum extends Definable{
  constructor(name) {
    super("enum", name);
  }
}

module.exports = Enum;
