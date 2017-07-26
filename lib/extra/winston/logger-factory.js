const { LoggerFactory } = require("../../base/logging");
const WinstonLogger = require("./logger");
const winston = require("winston");
const _ = require("lodash");

class WinstonLoggerFactory extends LoggerFactory {
  constructor() {
    super();
    this._loggers = {};
  }

  getLogger(name) {
    if (!_.isString(name)) {
      throw new Error("Invalid logger name");
    }
    if (this._loggers[name]) {
      return this._loggers[name];
    }

    var logger = new winston.Logger({
      level: "info",
      transports: [
        new winston.transports.Console({
          colorize: true,
          prettyPrint: true,
          timestamp: true,
          label: name
        })
      ]
    });

    this._loggers[name] = new WinstonLogger(logger);
    return this._loggers[name];
  }
}

module.exports = WinstonLoggerFactory;
