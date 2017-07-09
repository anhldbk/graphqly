const { createBuilder } = require("../lib");
var expect = require("chai").expect;

describe("Create a schema", function() {
  const gBuilder = createBuilder();

  describe("Define interfaces", function() {
    const iface = gBuilder.iface("List").def(`
        offset: Int
        size: Int
        total: Int
    `);
    expect(iface._kind).to.equal("interface");
    expect(iface._name).to.equal("List");
  });

  describe("Define types", function() {
    const post = gBuilder.type(`Post`).def(`
        title: String
        content: String
    `);
    expect(post._kind).to.equal("type");
    expect(post._name).to.equal("Post");

    // and extend it
    const input = gBuilder.input("PostInput").ext("Post");
    expect(input._kind).to.equal("input");
    expect(input._name).to.equal("PostInput");

    // we can also implement an interface
    gBuilder.type("Posts").implements("List").def(`
      offset: Int
      size: Int
      window: Int
    `);

    gBuilder.type(`Response`).def(`
        code: String
        message: String
    `);
  });

  describe("Define queries", function() {
    // queries must provide returnd types and resolve function
    expect(gBuilder.query.bind(gBuilder, "posts")).to.throw(Error);

    const query = gBuilder.query("posts: Posts").resolve(() => {});
    expect(query._kind).to.equal("query");
    expect(query._name).to.equal("posts");
  });

  describe("Define mutations", function() {
    // mutations must provide returnd types and resolve function
    expect(gBuilder.mutation.bind(gBuilder, "createPost")).to.throw(Error);

    const mutation = gBuilder
      .mutation("createPost(input: PostInput!): Response")
      .resolve(() => {});
    expect(mutation._kind).to.equal("mutation");
    expect(mutation._name).to.equal("createPost");
  });

  describe("Build", function() {
    gBuilder.build();
  });
});
