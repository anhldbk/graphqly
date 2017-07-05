function getDependencies(def){
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

const def = `posts(input: PostInput!): Posts!`;

console.log(getDependencies(def))