const _ = require("lodash");

function omitNil(object) {
  return _.omitBy(object, _.isNil);
}

// check if an object have selected fields
function hasFields(object, fields) {
  if (!_.isObject(object) || !_.isArray(fields)) {
    throw new Error("Invalid argument");
  }

  for (let field of fields) {
    if (_.isNil(_.get(object, field))) {
      return false;
    }
  }

  return true;
}

module.exports = {
  omitNil,
  hasFields
};
