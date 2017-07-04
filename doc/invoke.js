// you may invoke other queries (same for mutations)
gschema.query(`
  posts: {
    id
    content
    title
  }
`)
.invoke()
.then();

gschema.mutation(`
  createPost($post: PostInput): {
    code
    message
  }
`)
.variables({
  post: {}
})
.invoke()
.then();


gschema.service(`
  tokenCreate($user: String!, $role: String!): Token!
`)
.variables({
  user: "anhld",
  role: "admin"
})
.invoke()
.then();
