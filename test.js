const Schema = require("./lib/schema/schema");
const gschema = new Schema();

gschema.type("Post").def(`
    title: String
    content: String
`)

gschema.type("PostEx").ext("Post").def(`
    likes: Int
`);

gschema.build();
