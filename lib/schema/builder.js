const {
	makeExecutableSchema,
	addResolveFunctionsToSchema
} = require("graphql-tools");
const _ = require("lodash");
const { PubSub } = require("graphql-subscriptions");
const Type = require("./type");
const Query = require("./query");
const Mutation = require("./mutation");
const Subscription = require("./subscription");
const Input = require("./input");
const Interface = require("./interface");
const Enum = require("./enum");
const { Definition, Hookable } = require("../base");
const { omitNil, hasFields } = require("../utils");

const pubsub = new PubSub();

class SchemaBuilder {
	constructor() {
		this._types = {};
		this._enums = {};
		this._inputs = {};
		this._ifaces = {};

		this._queries = {};
		this._mutations = {};
		this._subscriptions = {};

		this.use = this.use.bind(this);
		this._clear();
	}

	/**
   * Just a simpple wrapper. It's gonna be overriden by `Hookable`
   * @param {*} fn 
   */
	wrap(fn) {
		return fn;
	}

	/**
   * Use definitions provided by a provider
   * 
   * @param {any} provider A function which `this` is binded to the current instance of SchemaBuilder
   * @return {SchemaBuilder} The schema
   * @memberof SchemaBuilder
   */
	use(provider) {
		if (!_.isFunction(provider)) {
			throw new Error("Invalid provider");
		}
		provider(this);
		return this;
	}

	type(name) {
		if (_.has(this._types, name)) {
			throw new Error(`Redefinition of type "${name}"`);
		}
		const t = new Type(name);
		this._types[name] = t;
		return t;
	}

	enum(name) {
		if (_.has(this._enums, name)) {
			throw new Error(`Redefinition of enum "${name}"`);
		}
		const e = new Enum(name);
		this._enums[name] = e;
		return e;
	}

	input(name) {
		if (_.has(this._inputs, name)) {
			throw new Error(`Redefinition of input "${name}"`);
		}
		const i = new Input(name);
		this._inputs[name] = i;
		return i;
	}

	iface(name) {
		if (_.has(this._ifaces, name)) {
			throw new Error(`Redefinition of interface "${name}"`);
		}
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
			throw new Error(`Redefinition of query "${name}"`);
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
			throw new Error(`Redefinition of mutation "${name}"`);
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
		if (_.has(this._subscriptions, name)) {
			throw new Error(`Redefinition of subscription "${name}"`);
		}
		this._subscriptions[name] = m;
		return m;
	}

	_validateStructures() {
		const validate = structure => {
			_.forEach(structure, s => {
				if (_.isNil(s._def) && _.isNil(s._parent)) {
					throw new Error(
						`${s._kind} "${s._name}" must provide a definition`
					);
				}
			});
		};
		validate(this._ifaces);
		validate(this._enums);
		validate(this._inputs);
		validate(this._types);
	}

	_resolveStructures() {
		this._validateStructures();
		const resolving = _.merge(
			{},
			this._ifaces,
			this._enums,
			this._inputs,
			this._types
		);
		const defs = {};
		let keys, found;

		const _getError = () => {
			// print unresolvable structures
			return _.reduce(
				_.values(resolving),
				(acc, structure) => {
					if (structure._dependencies.length != 0) {
						acc += `${structure._kind} "${structure._name}" (depends on ${structure._dependencies.join(
							", "
						)})\n`;
					} else {
						acc += `${structure._kind} "${structure._name}"\n`;
					}
					return acc;
				},
				"Can not resolve following structures\n"
			);
		};

		const _isResolvable = names => {
			if (_.isNil(names)) {
				return true;
			}
			if (!_.isArray(names)) {
				names = [names];
			}
			for (let name of names) {
				if (!_.has(defs, name)) {
					return false;
				}
			}
			return true;
		};

		// first, we dertermine the resolving order of types
		const _resolve = key => {
			let extendable = resolving[key];
			if (
				!_isResolvable(extendable._parent) ||
				!_isResolvable(extendable._iface) ||
				!_isResolvable(extendable._dependencies)
			) {
				return;
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
			_.forEach(keys, _resolve);

			if (!found) {
				throw new Error(_getError());
			}
		}

		this._structures = defs;
	}

	_resolveQueries() {
		const resolveQuery = query => {
			if (!_.isFunction(query._fn)) {
				throw new Error(
					`Query "${query._name}" must provide a resolving function`
				);
			}

			// verify if its dependencies are resolved
			const resolveDependency = dependency => {
				if (!_.has(this._structures, dependency)) {
					throw new Error(
						`Unresolved dependency "${dependency}" in query "${query._name}"`
					);
				}
			};
			_.forEach(query._dependencies, resolveDependency);

			// update
			_.set(
				this._resolvers,
				`Query.${query._name}`,
				this.wrapQuery(query.wrap(query._fn))
			);

			_.set(query, "_pubsub", pubsub);
		};
		_.forEach(this._queries, resolveQuery);
	}

	_resolveMutations() {
		const resolveMutation = mutation => {
			if (!_.isFunction(mutation._fn)) {
				throw new Error(
					`Mutation "${mutation._name}" must provide a resolving function`
				);
			}

			// verify if its dependencies are resolved
			const resolveDependency = dependency => {
				if (!_.has(this._structures, dependency)) {
					throw new Error(
						`Unresolved dependency "${dependency}" in mutation "${mutation._name}"`
					);
				}
			};
			_.forEach(mutation._dependencies, resolveDependency);

			// update
			_.set(
				this._resolvers,
				`Mutation.${mutation._name}`,
				this.wrapMutation(mutation.wrap(mutation._fn))
			);

			_.set(mutation, "_pubsub", pubsub);
		};
		_.forEach(this._mutations, resolveMutation);
	}

	_resolveSubscriptions() {
		const resolveSubscription = subscription => {
			if (!_.isFunction(subscription._fn)) {
				// throw new Error(
				// 	`Subscription "${subscription._name}" must provide a resolving function`
				// );
				// strictly speaking, subscriptions does NOT need to provide resolving functions
				// we're gonna provide it with a simple one
				subscription._fn = (payload) => payload;
			}

			// verify if its dependencies are resolved
			const resolveDependency = dependency => {
				if (!_.has(this._structures, dependency)) {
					throw new Error(
						`Unresolved dependency "${dependency}" in subscription "${subscription._name}"`
					);
				}
			};
			_.forEach(subscription._dependencies, resolveDependency);

			// update
			_.set(this._resolvers, `Subscription.${subscription._name}`, {
				resolve: this.wrapSubscription(
					subscription.wrap(subscription._fn)
				),
				subscribe: () => pubsub.asyncIterator(subscription._name)
			});
		};
		_.forEach(this._subscriptions, resolveSubscription);
	}

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
		let mutations = _.values(this._mutations).map(
			mutation => mutation._def
		);
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
					throw new Error(`Type "${name}" must have its own fields`);
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
		this._schemaText = "";
		this._schema = undefined;
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

		this._schemaText = this._beautify(
			[
				this._generateStructures(),
				this._generateQueries(),
				this._generateMutations(),
				this._generateSubscriptions()
			].join("\n")
		);

		this._generateResolverMap();

		try {
			this._schema = makeExecutableSchema({
				typeDefs: [this._schemaText],
				resolvers: this._resolvers
			});
			addResolveFunctionsToSchema(this._schema, this._resolversMap);
			return this._schema;
		} catch (e) {
			console.log("***************** SCHEMA EXCEPTION *****************");
			console.log(e);
			process.exit(-1);
		}
	}

	getText() {
		return this._schemaText;
	}

	getSchema() {
		return this._schema;
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

const HookableSchema = Hookable(SchemaBuilder);

HookableSchema.create = () => {
	return new HookableSchema();
};

module.exports = HookableSchema;
