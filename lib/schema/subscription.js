const _ = require("lodash");
const { Resolvable } = require("../base");

class Subscription extends Resolvable {
  constructor(def) {
    super("subscription", def);

    // resolve enables you to manipulate what the subscription publishes, whereas subscribe
    // in combination with withFilter enables you to filter out results that you don't want
    // to publish under specific circumstances (eg user/state). Kind of like the difference
    // between `map` and `filter`
    // see more: https://github.com/apollographql/graphql-subscriptions/issues/90
    this.map = this.resolve;
  }

  wrap(fn) {
    return super.wrapSubscription(fn);
  }

  /**
	 * Register a filter function
	 * 
	 * @param {Function} fn  (payload, variables, context, info) => boolean | Promise<boolean>
	 * 	A filter function, executed with the payload (the published value), variables, context 
	 * 	and operation info, must return boolean or Promise<boolean> 
	 * @returns boolean | Promise<boolean> indicating if the payload should pass to the subscriber.
	 * @memberof Subscription
	 */
  filter(fn) {
    if (!_.isFunction(fn)) {
      throw new Error("Invalid resolvable function");
    }
    this._filterFn = fn;
    return this;
  }
}

module.exports = Subscription;
