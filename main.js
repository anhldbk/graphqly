const _ = require("lodash");

function getFields(definition) {
  const tokens = definition.split(/[\n:,]+/);
  return _.filter(
    tokens,
    (token, index) => token.length !== 0 && index % 2 === 0
  );
}

const def = "";
console.log(getFields(def));