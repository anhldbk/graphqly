import graphqly from "graphqly";

// in brief
//
const gserver = graphqly.createServer({
  port: 3000,
  host: 'localhost',
  endpoint: '/graphql',
  graphiql: true
});

const gschema = graphqly.createSchema();
gserver.use(gschema);
gserver.start((err) => {

});
