const _ = require("lodash");

function omitNil(object) {
  return _.omitBy(object, _.isNil);
}

module.exports = {
  omitNil
}
