const _ = require('lodash');
const Definable = require('./definable');

class Type extends Definable{
  constructor(name) {
    super("type", name);
  }

  implements(iface){
    if(_.isNil(iface)){
      throw new Error("Invalid interface");
    }
    this._ifaces = iface;
  }

}

module.exports = Type;
