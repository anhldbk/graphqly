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

/**
   * Get dependent & unknown structures
   * Known ones are ["String", "Int", "Float", "Boolean", "ID"]
   * 
   * @return {Array}   Array of structure names
   */
function getDependencies(def) {
  let begin = 0,
    end,
    len = def.length,
    dependency,
    depedencies = [];

  const knownDependencies = ["String", "Int", "Float", "Boolean", "ID"],
    stopChars = ":=,)}!]\n";

  for (; begin < len; begin++) {
    if (def[begin] != ":") {
      continue;
    }
    for (end = begin + 1; end < len; end++) {
      if (stopChars.indexOf(def[end]) != -1) {
        break;
      }
    }
    dependency = def.substr(begin + 1, end - begin - 1).trim();
    dependency = dependency.replace(/[\(\[!\)]/g, "");
    if (knownDependencies.indexOf(dependency) == -1) {
      depedencies.push(dependency);
    }
    begin = end;
  }

  return depedencies;
}

module.exports = {
  omitNil,
  hasFields,
  getDependencies
};
