const _ = require("lodash");
const graphqly = require("./lib/");
const gBuilder = graphqly.createSchema();

gBuilder.iface("List").def(`
    offset: Int
    size: Int
    total: Int
`);

gBuilder.type("PostEx").ext("Post").def(`
    likes: Int
`);

gBuilder.type("Post").def(`
    title: String
    content: String
`);

const i = gBuilder.input("PostInput").ext("Post");

gBuilder.type("Posts").implements("List").def(`
    size: Int
`);

const query = gBuilder.query("posts: Posts").resolve(() => {});
console.log(query);

// gBuilder.type("Response").def(`
//     code: Int
//     message: String
// `);

// gBuilder.query(`posts: Posts`).resolve(() => {});

// gBuilder.enum("OrderStatus").def(`
//     PENDING
//     PROCESSING
//     DELIVERING
//     DONE
//     CANCELED
// `);

// gBuilder
//   .mutation(
//     `
//     createToken: Post
// `
//   )
//   .resolve(() => {});

// gBuilder
//   .mutation(
//     `
//     postCreate(input: PostInput): Int
// `
//   )
//   .resolve(() => {});

// const defs = gBuilder.build();

// console.log(defs);
