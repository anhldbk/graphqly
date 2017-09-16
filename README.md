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

### 3. Usage

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

// subscriptions may not need to provide resolving functions
// If you want to manipulate published data, you must provide resolving functions of 
// `(payload, args, context, info) => {any}` as described by
// https://github.com/apollographql/graphql-subscriptions#payload-manipulation
gBuilder.subscription(`
  productAdded: Product
`);


gBuilder.query(`
  products(limit: Int = 20, offset: Int = 0, filter: ProductFilter): Products
`)
.resolve((root, args, context) => {
  // your resolver here
  // `this` is binded to the current Query instance
});

gBuilder.mutation(`
  createProduct(product: ProductInput): Response!
`)
.resolve(function(root, args, context) {
  const { product } = args;
  // Publish events whenever a new product is added
  // `this` is binded to the current Mutation instance
  this.publish("productAdded", product);
  return createProduct({ product });
});

// and finally
const schema = gBuilder.build(); // inside, `makeExecutableSchema` is invoked
```

You may work with meta data of Resolvable instances (including Queries, Mutations & Subscriptions) via methods `set`, `get`:

```js
gBuilder.query(`
  products(limit: Int = 20, offset: Int = 0, filter: ProductFilter): Products
`)
.set("scope", ["products.read"]) // imagine we have scopes to use when authorizing requests
.resolve(function(root, args, context) {
  // your resolver here
  // `this` is binded to the current Query instance
  console.log(this.get("scope")); // will printed ["products.read"] out.
});
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

function Product(builder){
  // ......
}

gBuilder.use(Brand); // it's fun, right?

// you can also use multiple providers
gBuilder.use([Brand, Product]);
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
  // hook functions will receive above configuring options,
  handle: function(opts){
    // if you invoke done(value), resolving functions will not be called
    // the promise chain will stop immediately
    // NOTE: `this` is binded to the associated Resolvable (determine at runtime)
    //  If you use `arrow functions`, `this` is not binded consistently. So use a normal one instead.
    return function(root, args, context, done){
      console.log("Logging...");
      // we may get `scope` here to determine if users are authorized to access the API
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
        console.log("In query....", this._name);
        // Remember to return an array.
        return [root, args, context];
      }
    }
  })
  ;
```
## 3.4 Logging

`createBuilder` accepts configurable options. Currently, `graphqly` only allows users to configure logging capability.

```js
import { createBuilder, extra } from "graphqly";
const gBuilder = createBuilder({
  loggerFactory: new extra.winston.WinstonLoggerFactory()
});

// now in resolving functions, you may use functions `error`, `info`...
gBuilder
  .query("products(limit: Int = 20, offset: Int = 0, filter: ProductFilter): Products")
  .resolve(function(root, args, context){
    this.info("Accessing API `products`");
    const { offset, limit, filter } = args;
    return getProducts({ offset, limit, filter });
  });
```

You may provide your own logger factories. Please have a look at directory `lib/extra/winston` for more information.

By default, there's no logger factory configured. But if you configure it, in case of runtime errors in resolving functions, you may have related information printed out. For example

```
2017-07-26T13:29:49.403Z - error: [Subscription orderTimelineChanged] Filtering error. Detail: ReferenceError: _ is not defined
```

### 4. License

GNU GPL3

>Please submit a pull request if you see anything that can be improved!
