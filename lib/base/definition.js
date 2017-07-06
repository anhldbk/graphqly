class Definition {
  constructor({ head = "", body = "" } = {}) {
    this.head = head;
    this.body = body;
  }

  toString() {
    return `${this.head} {\n${this.body}\n}`;
  }
}

module.exports = Definition;
