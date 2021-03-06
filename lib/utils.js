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
  const lines = def.split(/\r?\n/);
  const parse = def => {
    let begin = 0,
      end,
      len = def.length,
      dependency,
      depedencies = [];

    const knownDependencies = ["String", "Int", "Float", "Boolean", "ID"],
      stopChars = ":=,)}!]#\n";

    for (; begin < len; begin++) {
      // found comments
      if (def[begin] == "#") {
        return depedencies;
      }
      if (def[begin] != ":") {
        continue;
      }
      for (end = begin + 1; end < len; end++) {
        if (def[end] == "#") {
          return depedencies;
        }
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
  };

  return _.reduce(
    lines,
    (acc, line) => {
      return acc.concat(parse(line));
    },
    []
  );
}

/**
   * Get the operation's name in resolvable definitions
   * @param  {String} def   A definition string
   * @return {String}   Operation name
   */
function getName(def) {
  const lines = def.split(/\r?\n/);
  const stopChars = "({:";
  const parse = def => {
    let index = 0,
      len = def.length;

    for (; index < len; index++) {
      // found comments
      if (def[index] == "#") {
        return "";
      }
      if (stopChars.indexOf(def[index]) == -1) {
        continue;
      }

      return def.substr(0, index).trim();
    }

    return "";
  };

  let name;
  for (let index = 0; index < lines.length; index++) {
    name = parse(lines[index]);
    if (name.length != 0) {
      return name;
    }
  }
  return "";
}

module.exports = {
  omitNil,
  hasFields,
  getDependencies,
  getName
};
