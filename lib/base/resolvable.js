const _ = require("lodash");
const { getDependencies } = require("../utils");
const Hookable = require("./hookable");

/**
 * Class defines a single operation (`mutation`, `query`, `subscription`)
 */
class Resolvable {
	constructor(kind, def) {
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
		this._fn = fn;
		return this;
	}
}

module.exports = Hookable(Resolvable);
