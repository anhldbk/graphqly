// Reference: https://stackoverflow.com/questions/368280/javascript-hashmap-equivalent
// linking the key-value-pairs is optional
// if no argument is provided, linkItems === undefined, i.e. !== false
// --> linking will be enabled
//
function OrderedMap(linkItems) {
    this.current = undefined;
    this.size = 0;

    if(linkItems === false)
        this.disableLinking();
}

OrderedMap.noop = function() {
    return this;
};

OrderedMap.illegal = function() {
    throw new Error("illegal operation for maps without linking");
};

// map initialisation from existing object
// doesn't add inherited properties if not explicitly instructed to:
// omitting foreignKeys means foreignKeys === undefined, i.e. == false
// --> inherited properties won't be added
OrderedMap.from = function(obj, foreignKeys) {
    var map = new OrderedMap;

    for(var prop in obj) {
        if(foreignKeys || obj.hasOwnProperty(prop))
            map.put(prop, obj[prop]);
    }

    return map;
};

OrderedMap.prototype.disableLinking = function() {
    this.link = OrderedMap.noop;
    this.unlink = OrderedMap.noop;
    this.disableLinking = OrderedMap.noop;
    this.next = OrderedMap.illegal;
    this.key = OrderedMap.illegal;
    this.value = OrderedMap.illegal;
    this.removeAll = OrderedMap.illegal;

    return this;
};

// overwrite in OrderedMap instance if necessary
OrderedMap.prototype.hash = function(value) {
    return (typeof value) + ' ' + (value instanceof Object ?
        (value.__hash || (value.__hash = ++arguments.callee.current)) :
        value.toString());
};

OrderedMap.prototype.hash.current = 0;

// --- mapping functions

OrderedMap.prototype.get = function(key) {
    var item = this[this.hash(key)];
    return item === undefined ? undefined : item.value;
};

OrderedMap.prototype.contain = function(key) {
    var item = this[this.hash(key)];
    return item !== undefined;
};


OrderedMap.prototype.put = function(key, value) {
    var hash = this.hash(key);

    if(this[hash] === undefined) {
        var item = { key : key, value : value };
        this[hash] = item;

        this.link(item);
        ++this.size;
    }
    else this[hash].value = value;

    return this;
};

OrderedMap.prototype.remove = function(key) {
    var hash = this.hash(key);
    var item = this[hash];

    if(item !== undefined) {
        --this.size;
        this.unlink(item);

        delete this[hash];
    }

    return this;
};

// only works if linked
OrderedMap.prototype.removeAll = function() {
    while(this.size)
        this.remove(this.key());

    return this;
};

// --- linked list helper functions

OrderedMap.prototype.link = function(item) {
    if(this.size == 0) {
        item.prev = item;
        item.next = item;
        this.current = item;
    }
    else {
        item.prev = this.current.prev;
        item.prev.next = item;
        item.next = this.current;
        this.current.prev = item;
    }
};

OrderedMap.prototype.unlink = function(item) {
    if(this.size == 0)
        this.current = undefined;
    else {
        item.prev.next = item.next;
        item.next.prev = item.prev;
        if(item === this.current)
            this.current = item.next;
    }
};

// --- iterator functions - only work if map is linked

OrderedMap.prototype.next = function() {
    this.current = this.current.next;
};

OrderedMap.prototype.key = function() {
    return this.current.key;
};

OrderedMap.prototype.value = function() {
    return this.current.value;
};

module.exports = OrderedMap;
