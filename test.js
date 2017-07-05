const Schema = require("./lib/schema/schema");
const gschema = new Schema();
const _ = require("lodash");

gschema.iface("List").def(`
    offset: Int
    size: Int
    total: Int
`);

gschema.type("PostEx").ext("Post").def(`
    likes: Int
`);

gschema.type("Post").def(`
    title: String
    content: String
`);

gschema.input("PostInput").ext("Post");

gschema.type("Posts").implements("List").def(`
    title: String
    content: String
`);

gschema.enum("OrderStatus").def(`
    PENDING
    PROCESSING
    DELIVERING
    DONE
    CANCELED
`);

gschema.mutation(`
    createToken: Post
`);

const defs = gschema.build();

console.log(defs);
