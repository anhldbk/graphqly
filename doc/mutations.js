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

// mutations can be hooked also
