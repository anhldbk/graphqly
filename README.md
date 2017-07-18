Graphqly
=======================

`Graphqly` is a library to reduce the complexity of developing Graphql services.

### 1. Motivation

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

### 2. Installation

```
npm install graphqly --save

# or if you're using yarn
# yarn add graphqly
```

### 3. Example

For more information, please visit repo [graphqly-demo](https://github.com/anhldbk/graphqly-demo)

#### 3.1 Definitions

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

#### 3.2 Reusability

We may reuse other definitions by grouping them into providers:

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

#### 3.3 Extendability
`Graphqly` can be extended by using hooks. For example, we can have features of logging, caching, authorizing... through hooks.

`Graphqly` has 2 kinds of hooks:
- `Global hooks` in SchemaBuilder
- `Local hooks` in each operations (queries or mutations)

There are 4 hook points, including `pre.query`, `post.query`, `pre.mutation`, `post.mutation`.

```js
// Global hook
gBuilder.hook({
    options: {
        point: "pre.query"
    },
    handle: function(opts){
        return function(root, args, context, done){
          // `this` is binded to gBuilder
          console.log("Logging...");
          // if you invoke done(value), resolving functions will not be called
          // the promise chain will stop immediately
          return [root, args, context];
        };
    }
});

// Local hook
gBuilder
    .query("products(limit: Int = 20, offset: Int = 0, filter: ProductFilter): Products")
    .resolve((root, args, context) => {
        const { offset, limit, filter } = args;
        return getProducts({ offset, limit, filter });
    })
    .hook({
        options: {
            point: "pre.query"
        },
        handle: function(opts){
            return function(root, args, context){
                // `this` is binded to the query (or mutation)
                console.log("In query....", this._name)
                return [root, args, context];
            }
        }
    })
    ;
```

### 4. Incoming features
- Support subscriptions
- Make resolving functions `hookable`. I think the design of `hapi` may be applied to Graphql services.
- ... (your proposals)

Please submit a pull request if you see anything that can be improved!

### 5. License

GNU GPL3