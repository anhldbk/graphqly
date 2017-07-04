// define type
gschema.type("Post").define(`
    title: String!
    content: String
`);
// Type can extend another type or an INTERFACE
gschema.type("Vote").extend("Post")(`
    vote: Int!
`);

// enum
gschema.enum("OrderStatus")(`
  PENDING
  DONE
  CANCELED
`);

// Inputs can extend types
gschema.input("PostInput").extend("Post")(`
  view : Int
`);

// Interfaces
gschema.interface("List")(`
    offset: Int!
    size: Int!
    window: Int!
`).resolve({
    posts: "Posts",
    orders: "Orders"
});
