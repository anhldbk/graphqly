const _ = require("lodash");

const Hookable = Object =>
	class extends Object {
		constructor(...args) {
			super(...args);
			this.hook = this.hook.bind(this);
			this.wrap = this.wrap.bind(this);
			this.wrapQuery = this.wrapQuery.bind(this);
			this.wrapMutation = this.wrapMutation.bind(this);
			this._hooks = {
				pre: {
					query: [],
					mutation: [],
					subscription: []
				},
				post: {
					query: [],
					mutation: [],
					subscription: []
				}
			};
		}

		_validateHookPoint(point) {
			if (!_.isString(point)) {
				throw new Error("Invalid hook point. Must be a string.");
			}

			const parts = point.split(".");
			if (parts.length != 2) {
				throw new Error(
					"Invalid hook point. Must have the format of {pre,post}.{query,mutation}"
				);
			}

			if (["pre", "post"].indexOf(parts[0]) == -1) {
				throw new Error(
					"Invalid hook point. First part must be one of {pre, post}"
				);
			}

			if (["query", "mutation", "subscription"].indexOf(parts[1]) == -1) {
				throw new Error(
					"Invalid hook point. Second part must be one of {query, mutation}"
				);
			}
		}

		hook({ options, handle }) {
			if (!_.isObject(options)) {
				throw new Error("Invalid hook options");
			}
			const { point } = options;
			this._validateHookPoint(point);

			// `handle` must be a function of `(options) => fn` which returns functions.
			if (!_.isFunction(handle)) {
				throw new Error("Invalid hook handler");
			}
			_.get(this._hooks, point).push(handle.bind(this)(options));
			return this;
		}

		/**
		 * Wrap a function with configured hook functions.
		 * @param {Function} fn 
		 * @param {String} type (one of ["query", "mutation", "subscription"])
		 * @return A resolve function
		 */
		_wrap(fn, type = "query") {
			if (["query", "mutation", "subscription"].indexOf(type) === "-1") {
				throw new Error("Invalid type");
			}
			const self = this;
			const chain = [
				..._.get(
					this._hooks,
					type == "query"
						? "pre.query"
						: type == "mutation"
							? "pre.mutation"
							: "pre.subscription"
				),
				fn,
				..._.get(
					this._hooks,
					type == "query"
						? "post.query"
						: type == "mutation"
							? "post.mutation"
							: "post.subscription"
				)
			];

			const done = value => {
				throw { value };
			};

			return (...args) =>
				chain
					.reduce(
						(promise, func) =>
							promise.then((...params) =>
								func.apply(self, _.flatten([params[0], done]))
							),
						Promise.resolve(args)
					)
					.catch(err => {
						const value = _.get(err, "value");
						if (_.isNil(value)) {
							throw err;
						}
						return value;
					});
		}

		wrapMutation(fn) {
			return this._wrap(fn, "mutation");
		}

		wrapQuery(fn) {
			return this._wrap(fn, "query");
		}

		wrapSubscription(fn) {
			return this._wrap(fn, "subscription");
		}
	};

module.exports = Hookable;
