const _ = require("lodash");
const { getDependencies, omitNil } = require("../utils");
const Hookable = require("./hookable");
const { Loggable } = require("./logging");

/**
 * Class defines a single operation (`mutation`, `query`, `subscription`)
 */
class Resolvable extends Loggable {
  constructor(kind, def) {
    super();
    if (!_.isString(kind)) {
      throw new Error("Invalid resolvable kind");
    }
    if (!_.isString(def)) {
      throw new Error("Invalid resolvable definition");
    }
    this._kind = kind;
    this._name = this._getName(def);
    if (!_.isString(this._name)) {
      throw new Error(
        `Invalid defintion "${def}". May be you should provide an associated type.`
      );
    }
    this._dependencies = getDependencies(def);
    this._def = def;
    this._meta = {};
    this._pubsub = undefined; // updated later on
  }

  /**
	 * Publish events
	 * @param {String} event 
	 * @param {Object} data 
   * @return {Resolvable}   This instance
	 */
  publish(event, data) {
    if (_.isNil(this._pubsub)) {
      throw new Error("No PubSub provided");
    }
    this._pubsub.publish(event, data);
    return this;
  }

  /**
	 * Set Meta data associated with this resolvable
	 * @param {any} key   Key
	 * @param {any} value   Value
   * @return {Resolvable}   This instance
	 */
  set(key, value) {
    _.set(this._meta, key, value);
    return this;
  }

  /**
   * Get the value associated with a key
   * @param {any} key   Key
   * @returns The value
   * @memberof Resolvable
   */
  get(key) {
    return this._meta[key];
  }

  /**
   * Get the operation's name in resolvable definitions
   * @param  {String} def   A definition string
   * @return {String}   Operation name
   */
  _getName(def) {
    if (!_.isString(def)) {
      throw new Error("Invalid definition");
    }
    let i = 0,
      len = def.length;
    const stopChars = "({:";
    for (; i < len; i++) {
      if (stopChars.indexOf(def[i]) != -1) {
        break;
      }
    }
    if (i == len) {
      return undefined;
    }
    return def.substr(0, i).trim();
  }

  resolve(fn) {
    if (!_.isFunction(fn)) {
      throw new Error("Invalid resolvable function");
    }
    this._fn = function(...args) {
      try {
        args[1] = omitNil(args[1]);
        return fn.bind(this)(...args);
      } catch (err) {
        this.error(`Resolving error. Detail: ${err}`);
      }
    };
    return this;
  }
}

module.exports = Hookable(Resolvable);
