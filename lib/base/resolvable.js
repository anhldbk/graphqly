const _ = require('lodash');

/**
 * Class defines a single operation (`mutation`, `query`, `subscription`)
 */
class Resolvable{
  constructor(kind, def) {
    if(!_.isString(kind)){
      throw new Error("Invalid resolvable kind");
    }
    if(!_.isString(def)){
      throw new Error("Invalid resolvable definition");
    }
    this._kind = kind;
    this._name = this._getName(def);
    this._dependencies = this._getDependencies(def);
    this._def = def;
  }

  /**
   * Get dependent structures
   * 
   * @return {Array}   Array of structure names
   */
  _getDependencies(def){
    let begin = 0, end, len = def.length;
    let depedencies = [];
    const stopChars = ",)}!]";    
    for(; begin < len; begin++){
        if(def[begin] != ':'){
        continue;
        }
        for(end = begin +1; end < len; end++){
            if (stopChars.indexOf(def[end]) != -1) {
                break;
            }
        }
        let depedency = def.substr(begin +1, end - begin -1).trim();
        depedency =depedency.replace(/[\(\[!\)]/g,'');
        depedencies.push(depedency);
    }
    return depedencies;
  }

  /**
   * Get the operation's name in resolvable definitions
   * @param  {String} def   A definition string
   * @return {String}   Operation name
   */
  _getName(def) {
    if (!_.isString(def)) {
      throw new Error("Invalid definition");
    }
    let i = 0, len = def.length;
    const stopChars = "({:";
    for (; i < len; i++) {
      if (stopChars.indexOf(def[i]) != -1) {
        break;
      }
    }
    if(i == len){
      return undefined;
    }
    return def.substr(0, i).trim();
  }

  resolve(fn){
    if(!_.isFunction(fn)){
      throw new Error("Invalid resolvable function");
    }
    this._fn = fn;
  }
}

module.exports = Resolvable;
