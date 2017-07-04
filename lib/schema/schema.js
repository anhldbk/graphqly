const Type = require("./type");
const Input = require("./input");
const Interface = require("./interface");
const Enum = require("./enum");
const _ = require("lodash");

class Schema {
  constructor() {
    this._types = {};
    this._enums = {};
    this._inputs = {};
    this._ifaces = {};
  }

  type(name) {
    const t = new Type(name);
    this._types[name] = t;
    return t;
  }

  enum(name) {
    const e = new Enum(name);
    this._enums[name] = e;
    return e;
  }

  input(name) {
    const i = new Input(name);
    this._inputs[name] = i;
    return i;
  }

  iface(name) {
    const i = new Interface(name);
    this._ifaces[name] = i;
    return i;
  }

  /**
   * Build schema with provided info
   * @return {[type]} [description]
   */
  build() {
    let schema = "";
    const ifaceDefs = _buildInterfaces();

    const resolved = {};
    const resolving = _.merge({}, this._enums, this._inputs, this._types);

    let previous, current; // counter
    let keys;
    while (true) {
      keys = _.keys(resolving);
      _.forEach(keys, key => {
        let def = resolving[key];
        if(!_.isNil(def._parent)){
          // check if is parent is resolved
          if(!_.has(resolved, def._parent)){
            return;
          }
        }
        // check if its interface is resolved
        if(!_.isNil(def._iface)){
          if(!_.has(resolved, def._parent)){
            return;
          }
        }
        // this definition is resolved
        
      });
    }

    return schema;
  }
}
