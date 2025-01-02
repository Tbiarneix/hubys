import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { createContext } from '@/graphql/context';

// Import all type definitions and resolvers
import { typeDefs as userTypeDefs } from '@/graphql/types/User';
import { resolvers as userResolvers } from '@/graphql/resolvers/User';

const schema = makeExecutableSchema({
  typeDefs: [userTypeDefs],
  resolvers: [userResolvers],
});

const server = new ApolloServer({
  schema,
});

const handler = startServerAndCreateNextHandler(server, {
  context: createContext,
});

export { handler as GET, handler as POST };
