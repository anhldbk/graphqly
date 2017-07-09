Graphqly
=======================

`Graphqly` is a library to reduce the complexity of developing Graphql services.

### Motivation

I think it's `complicated` to develop & maintain Graphql services (mainly their schemas). Let's look at how we currently define such schemas:

```js
import { makeExecutableSchema, addResolveFunctionsToSchema } from "graphql-tools";

const rootSchema = [
  `
  interface List {
    offset: Int!
    limit: Int!
    total: Int!
  }
  type Post {
    id: Int!
    title: String!
    content: String!
  }
  type Posts implements List {
    offset: Int!
    limit: Int!
    total: Int!
    posts: [Post!]
  }
  type Query {
    # List all posts
    posts: [Post]
  }
  type Mutation {
    addPost(title: String!, content: String!): Post
  }
  type Subscription {
    # Subscription fires on every comment added
    postAdded: Post
  }
  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`
];

const rootResolvers = {
  Query: {
    posts(root, args, context) {
      // ..
    }
  },
  Mutation: {
    addPost(root, { title, content }, context) {
      // ..
    }
  }
};

const resolverMap = {
  List: {
    __resolveType(obj, context, info) {
      if (obj.products) {
        return "Products";
      }
      return null;
    }
  }
}

const schema = makeExecutableSchema({
  typeDefs: [...rootSchema],
  resolvers: _.merge(rootResolvers)
});
addResolveFunctionsToSchema(executableSchema, resolverMap);
```

In my opinion, there are several things to pay attention to:
+ We have to define basic structures (type, interface, input, enum) and there's no mechanism for us to `reuse` such structures in other defintions. By `reuse`, I mean we can't have something like:

    ```
    type PostEx extends Post{
        
    }
    ```
    This makes `reusability` hard.

+ Each operation (query, mutation, subscription) requires an associated resolver function. Separating definitions and resolvers makes Graphql flexible. But if you have large operations to serve, it's a pain in the ass to organize them properly.

`Graphqly` is designed to solve above problems elegantly.

### Installation

```
npm install graphqly --save

# or if you're using yarn
# yarn add graphqly
```

### Example

For more information, please visit repo [graphqly-demo](https://github.com/anhldbk/graphqly-demo)

```js
import graphly from "graphqly";

const gBuilder = graphly.createBuilder();

// define types, inputs ... (in any order)
gBuilder.type("Products").implements("List").def(`
    products: [Product]!
`);

gBuilder.type("Product").def(`
    id: ID!
    name: String!
    link: String
    price: Int
`);

// we're too lazy to define a separate input, so we can `extend` other structure
gBuilder.input("ProductInput").ext("Product");

gBuilder.enum("ProductOrder").def(`
    PRICE_DESCENDING
    PRICE_ASCENDING
    NEWEST
`);

// define interface `List`
gBuilder.iface("List").def(`
    total: Int!,
    offset: Int!,
    limit: Int!,
    # number of items actually in this window
    size: Int!
`);

gBuilder
.query(`
    products(limit: Int = 20, offset: Int = 0, filter: ProductFilter): Products
`)
.resolve((root, args, context) => {
    // your resolver here
});

// and finally
const schema = gBuilder.build(); // inside, `makeExecutableSchema` is invoked
```

Last but not least, we may reuse other definitions by grouping them into providers:

```js
function Brand(builder){
  builder.type("Brands").implements("List").def(`
    brands: [Brand]!
    `);
  builder.type("Brand").def(`
    id: ID!
    name: String!
    link: String
    createdAt: String!
    updatedAt: String
    `);
}

gBuilder.use(Brand) // it's fun, right?
```

### Incoming features
- Support subscriptions
- Make resolving functions `hookable`. I think the design of `hapi` may be applied to Graphql services.
- ... (your proposals)

Please submit a pull request if you see anything that can be improved!

### License

GNU GPL3