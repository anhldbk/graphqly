const _ = require('lodash');
const Definable = require('./definable');

class Input extends Definable{
  constructor(name) {
    super("input", name);
  }
}

module.exports = Input;
