/**
 *  An interface for logger
  * 
 * @class Logger
 */
class Logger {
  configure(options) {}

  silly(message) {}
  debug(message) {}
  verbose(message) {}
  info(message) {}
  warn(message) {}
  error(message) {}
}

module.exports = Logger;
