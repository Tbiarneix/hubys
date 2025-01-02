export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    name: String
    avatar: String
    bio: String
    birthDate: String
    createdAt: String!
    updatedAt: String!
  }

  input CreateUserInput {
    email: String!
    password: String!
    name: String
    avatar: String
    bio: String
    birthDate: String
  }

  input UpdateUserInput {
    name: String
    avatar: String
    bio: String
    birthDate: String
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    me: User
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): User
  }
`;
