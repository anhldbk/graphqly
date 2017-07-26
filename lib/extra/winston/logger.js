const { Logger } = require("../../base/logging");
const _ = require("lodash");

class WinstonLogger extends Logger {
  constructor(logger) {
    super();
    this._logger = logger;

    const methods = ["silly", "debug", "verbose", "info", "warn", "error"];
    methods.forEach(method => {
      _.set(this, method, this._logger[method]);
    });
  }

  configure(options) {
    this._logger.configure(options);
  }
}

module.exports = WinstonLogger;
