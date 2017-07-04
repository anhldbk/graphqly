// mutations
gschema
  .mutation(`createPost(post: PostInput!): Response!`)
  // use Joi for validate input [optionally]
  .validate({
    title: String().min(3).max(10)
  })
  .resolve((root, args, context) => {
    const { post } = args;
  });

gschema
  .mutation("userLogin($username: String!, $password: String!): Response")
  .variables({
    username: "anhld",
    password: "123"
  })
  .resolve((root, args, context) => {
    // can invoke other query and mutation method
    gschema.mutation("tokenCreate").params({ username, role }).then();
  });

// mutations can be hooked also
