const Type = require("./type");
const Query = require("./query");
const Mutation = require("./mutation");
const Subscription = require("./subscription");
const Input = require("./input");
const Interface = require("./interface");
const Enum = require("./enum");
const _ = require("lodash");
const { omitNil } = require("../utils");

class Definition {
  constructor({ head = "", body = "" } = {}) {
    this.head = head;
    this.body = body;
  }

  toString() {
    const res = `${this.head} {\n${this.body}\n}`;
    return res.replace(/\n\s*\n/g, "\n");
  }
}

class Schema {
  constructor() {
    this._types = {};
    this._enums = {};
    this._inputs = {};
    this._ifaces = {};

    this._queries = {};
    this._mutations = {};
    this._subscriptions = {};

    this._structures = {}; // resolved structures
    this._resolvers = {};
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

  query(def) {
    const q = new Query(def);
    const name = q._name;
    if (_.isNil(name)) {
      throw new Error("Invalid query");
    }
    if (_.has(this._queries, name)) {
      throw new Error("Another query having the same name is already defined");
    }
    this._queries[name] = q;
    return q;
  }

  mutation(def) {
    const m = new Mutation(def);
    const name = m._name;
    if (_.isNil(name)) {
      throw new Error("Invalid mutation");
    }
    if (_.has(this._mutations, name)) {
      throw new Error(
        "Another mutation having the same name is already defined"
      );
    }
    this._mutations[name] = m;
    return m;
  }

  subscription(def) {
    const m = new Subscription(def);
    const name = m._name;
    if (_.isNil(name)) {
      throw new Error("Invalid subscription");
    }
    if (_.has(this._mutations, name)) {
      throw new Error(
        "Another subscription having the same name is already defined"
      );
    }
    this._subscriptions[name] = m;
    return m;
  }

  _resolveStructures() {
    const resolving = _.merge(
      {},
      this._ifaces,
      this._enums,
      this._inputs,
      this._types
    );
    const defs = {};

    // first, we dertermine the resolving order of types
    let keys, found;
    const resolve = key => {
      let extendable = resolving[key];

      // check if is parent is resolved
      if (!_.isNil(extendable._parent)) {
        if (!_.has(defs, extendable._parent)) {
          return;
        }
      }

      // check if its interface is resolved
      if (!_.isNil(extendable._iface)) {
        if (!_.has(defs, extendable._iface)) {
          return;
        }
      }

      // this definition can be resolved
      this._updateDefs(defs, key, extendable);
      _.unset(resolving, key);
      found = true;
    };

    while (true) {
      keys = _.keys(resolving);
      if (keys.length === 0) {
        break;
      }
      found = false;
      _.forEach(keys, resolve);

      if (!found) {
        throw new Error(`Can NOT resolve ${keys[0]}`);
      }
    }

    this._structures = defs;
  }

  _resolveMutations() {
    const resolveDependency = dependency => {
      if (!_.has(this._structures, dependency)) {
        throw new Error(
          `Unresolved dependency ${dependency} in mutation ${mutation._name}`
        );
      }
    };
    const resolveMutation = mutation => {
      // verify if its dependencies are resolved
      _.forEach(mutation._dependencies, resolveDependency);
    };
    _.forEach(this._mutations, resolveMutation);
  }

  _resolveQueries() {
    const resolveDependency = dependency => {
      if (!_.has(this._structures, dependency)) {
        throw new Error(
          `Unresolved dependency ${dependency} in query ${query._name}`
        );
      }
    };
    const resolveQuery = query => {
      // verify if its dependencies are resolved
      _.forEach(query._dependencies, resolveDependency);
    };
    _.forEach(this._queries, resolveQuery);
  }

  _buildResolvers() {
    let resolvers = {};
  }

  _beautify(schema) {
    // replace multiple line breaks with a single one
    return schema.replace(/\n\s*\n/g, "\n");
  }

  /**
   * Build schema with provided info
   * @return {[type]} [description]
   */
  build() {
    this._resolveStructures();
    this._resolveMutations();
    this._resolveQueries();
    let schema = [];

    let structures = _.values(this._structures).map(structure =>
      structure.toString()
    );
    schema.push(structures.join("\n"));

    let mutations = _.values(this._mutations).map(mutation => mutation._def);
    if (mutations.length !== 0) {
      mutations = `mutation {\n${mutations.join("\n")}\n}`;
      schema.push(mutations);
    }

    let queries = _.values(this._queries).map(query => query._def);
    if (queries.length !== 0) {
      queries = `query {\n${queries.join("\n")}\n}`;
      schema.push(queries);
    }

    return this._beautify(schema.join("\n"));
  }

  _updateDefs(defs, name, ext) {
    let def = new Definition();

    const hasIface = !_.isNil(ext._iface);
    const hasParent = !_.isNil(ext._parent);

    if (hasIface && hasParent) {
      throw new Error(
        `${name} can not implement an interface or extend an existing type as the same time.`
      );
    }

    // update `head`
    if (!hasIface) {
      def.head = `${ext._kind} ${ext._name}`;
    } else {
      if (!ext.isType()) {
        throw new Error("Only `type` can implement an interface");
      } else {
        def.head = `${ext._kind} ${ext._name} implements ${ext._iface}`;
      }
    }

    // update `body`
    let body = [];
    if (hasIface) {
      body.push(defs[ext._iface].body);
    }
    if (hasParent) {
      body.push(defs[ext._parent].body);
    }
    body.push(ext._fields);
    def.body = body.join("\n");

    defs[name] = def;
  }
}

module.exports = Schema;
