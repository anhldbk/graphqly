const Type = require("./type");
const Input = require("./input");
const Interface = require("./interface");
const Enum = require("./enum");
const _ = require("lodash");
const OrderedMap = require('./ordered-map');

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
    // const ifaceDefs = _buildInterfaces();

    const resolved = new OrderedMap;
    const resolving = _.merge({}, this._enums, this._inputs, this._types);

    // first, we dertermine the resolving order of types
    let keys, found;
    while (true) {
      keys = _.keys(resolving);
      if(keys.length == 0){
          break;
      }
      found = false;
      _.forEach(keys, key => {
        let def = resolving[key];
        console.log(`!> Resolving ${key} ...`)
        // check if is parent is resolved
        if(!_.isNil(def._parent)){
          if(!resolved.contain(def._parent)){
            return;
          }
        }

        // check if its interface is resolved
        if(!_.isNil(def._iface)){
          if(!_.has(resolved, def._parent)){
            return;
          }
        }
        console.log(`!> Resolved ${key} ...`)
        // this definition can be resolved
        resolved.put(key, def);
        _.unset(resolving, key);
        found = true;
      });
      if(!found){
          throw new Error(`Can NOT resolve ${keys[0]}`);
      }
    }

    for(var i = 0; i++ < resolved.size; resolved.next())
        console.log(resolved.hash(resolved.key()) + ' : ' + resolved.value());
    return schema;
  }
}

module.exports = Schema;
