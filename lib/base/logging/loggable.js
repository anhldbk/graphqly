const _ = require("lodash");
const Logger = require("./logger");

class Loggable {
  constructor() {
    this._logger = undefined;
    // npm logging levels
    const methods = ["silly", "debug", "verbose", "info", "warn", "error"];
    methods.forEach(method => {
      _.set(this, method, message => {
        if (_.isNil(this._logger)) {
          return; // no logger is defined
        }
        this._logger[method](message);
      });
    });
  }

  setLogger(logger) {
    if (_.isNil(logger)) {
      return this; // nothing to do
    }
    if (!(logger instanceof Logger)) {
      throw new Error("Invalid logger");
    }
    this._logger = logger;
    return this;
  }
}

module.exports = Loggable;
