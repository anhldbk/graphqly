const Type = require("./type");
const Query = require("./query");
const Mutation = require("./mutation");
const Subscription = require("./subscription");
const Input = require("./input");
const Interface = require("./interface");
const Enum = require("./enum");
const { Definition } = require("../base");
const _ = require("lodash");
const { omitNil, hasFields } = require("../utils");

class Schema {
  constructor() {
    this._types = {};
    this._enums = {};
    this._inputs = {};
    this._ifaces = {};

    this._queries = {};
    this._mutations = {};
    this._subscriptions = {};

    this._clear();
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

  _resolveQueries() {
    const resolveQuery = query => {
      if (!_.isFunction(query._fn)) {
        throw new Error(
          `Query ${query._name} must provide a resolving function`
        );
      }

      // verify if its dependencies are resolved
      const resolveDependency = dependency => {
        if (!_.has(this._structures, dependency)) {
          throw new Error(
            `Unresolved dependency ${dependency} in query ${query._name}`
          );
        }
      };
      _.forEach(query._dependencies, resolveDependency);

      // update
      _.set(this._resolvers, `Query.${query._name}`, query._fn);
    };
    _.forEach(this._queries, resolveQuery);
  }

  _resolveMutations() {
    const resolveMutation = mutation => {
      if (!_.isFunction(mutation._fn)) {
        throw new Error(
          `Mutation ${mutation._name} must provide a resolving function`
        );
      }

      // verify if its dependencies are resolved
      const resolveDependency = dependency => {
        if (!_.has(this._structures, dependency)) {
          throw new Error(
            `Unresolved dependency ${dependency} in mutation ${mutation._name}`
          );
        }
      };
      _.forEach(mutation._dependencies, resolveDependency);

      // update
      _.set(this._resolvers, `Mutation.${mutation._name}`, mutation._fn);
    };
    _.forEach(this._mutations, resolveMutation);
  }

  _resolveSubscriptions() {}

  _beautify(schema) {
    // replace multiple line breaks with a single one
    return schema.replace(/\n\s*\n/g, "\n");
  }

  _generateStructures() {
    let structures = _.values(this._structures).map(structure =>
      structure.toString()
    );
    return structures.join("\n");
  }

  _generateQueries() {
    let queries = _.values(this._queries).map(query => query._def);
    if (queries.length === 0) {
      return "";
    }
    return `type Query {\n${queries.join("\n")}\n}`;
  }

  _generateMutations() {
    let mutations = _.values(this._mutations).map(mutation => mutation._def);
    if (mutations.length === 0) {
      return "";
    }
    return `type Mutation {\n${mutations.join("\n")}\n}`;
  }

  _generateSubscriptions() {
    let subscriptions = _.values(this._subscriptions).map(
      subscription => subscription._def
    );
    if (subscriptions.length === 0) {
      return "";
    }
    return `type Subscription {\n${subscriptions.join("\n")}\n}`;
  }

  _generateResolverMap() {
    const resolved = {};

    _.keys(this._resolversMap).map(iface => {
      const names = _.keys(_.get(this._resolversMap, iface));
      const checks = _.map(names, name => {
        const fields = _.get(this._types, name)._fields;
        if (fields.length === 0) {
          throw new Error(`Type ${name} must have its own fields`);
        }
        return object => hasFields(object, fields);
      });
      const __resolveType = (object, context, info) => {
        for (var index = 0; index < names.length; index += 1) {
          if (checks[index](object)) {
            return names[index];
          }
        }
        return null;
      };
      _.set(resolved, iface, { __resolveType });
    });

    this._resolversMap = resolved;
  }

  _clear() {
    this._structures = {}; // resolved structures
    this._resolvers = {};
    this._resolversMap = {};
  }

  /**
   * Build schema, resolver, resolver map
   * @return {[type]} [description]
   */
  build() {
    this._clear();
    this._resolveStructures();
    this._resolveQueries();
    this._resolveMutations();
    this._resolveSubscriptions();

    let schema = [
      this._generateStructures(),
      this._generateQueries(),
      this._generateMutations(),
      this._generateSubscriptions()
    ].join("\n");

    this._generateResolverMap();

    return {
      schema: this._beautify(schema),
      resolvers: this._resolvers,
      resolversMap: this._resolversMap
    };
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
        // just flag it to resolve in our resolvers map
        _.set(this._resolversMap, `${ext._iface}.${ext._name}`, true);
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
    body.push(ext._def);
    def.body = body.join("\n");

    defs[name] = def;
  }
}

Schema.create = () => {
  return new Schema();
};

module.exports = Schema;
