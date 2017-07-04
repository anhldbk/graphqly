// define query handler
gschema.query(
    `posts: Posts!` // gschema will parse
)
// query can be cached
.cache({
  expiresIn: 60000
})
.resolve(() => {})
// it can be also resolved into a chain of promises
resolve([
  security,
  handler
])
;

// ************************************
// hook (for caching, authorizing, extending...)
gschema.query(
    `posts($filter: FilterInput): Posts!` // gschema will parse
)
// use Joi for validate input [optionally]
.validate({
  title: String().min(3).max(10)
})
// attach hooks on the fly
// Promise.reject() will prevent requests from being processed further
.before(() => {})
.resolve(() => {
  // `this` is resolved to the associated `gserver` instance
})
.after(() => {});

// OR attach hooks for pre-defined queries or posts
gschema.query("posts").hook(isBefore = true).resolve(() => {});
gschema.query("posts").before().resolve(() => {});
gschema.query("posts").before(() => {});
gschema.query("posts").after(() => {});
gschema.query("posts").after(() => {

});

// you can hook to multiple queries as well
gschema.query(["posts", "users"]).hook(() => {
    // you can access to the parsed params
});

// you can hook to queries and mutations also
gschema.hook(['posts', 'createPost'], isBefore= true).resolve(() => {})
gschema.before(['posts', 'createPost']).resolve(() => {})
