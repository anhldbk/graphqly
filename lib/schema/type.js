const _ = require("lodash");
const { Extendable } = require("../base");

class Type extends Extendable {
  constructor(name) {
    super("type", name);
  }

  implements(iface) {
    if (_.isNil(iface)) {
      throw new Error("Invalid interface");
    }
    this._iface = iface;
    return this;
  }
}

module.exports = Type;
