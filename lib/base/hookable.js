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
          mutation: []
        },
        post: {
          query: [],
          mutation: []
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

      if (["query", "mutation"].indexOf(parts[1]) == -1) {
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
      _.get(this._hooks, point).push(handle(options));
    }

    wrap(fn, isQuery = true) {
      return (root, args, context) => {
        const chain = [
          ..._.get(this._hooks, isQuery ? "pre.query" : "pre.mutation"),
          fn,
          ..._.get(this._hooks, isQuery ? "post.query" : "post.mutation")
        ];

        return chain.reduce(
          (promise, func) => promise.then(params => func.apply(this, params)),
          Promise.resolve([root, args, context])
        );
      };
    }

    wrapMutation(fn) {
      return this.wrap(fn, false);
    }

    wrapQuery(fn) {
      return this.wrap(fn, true);
    }
  };

module.exports = Hookable;
