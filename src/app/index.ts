import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

import { User } from "./user";
import { Tweet } from "./post";

import { GraphqlContext } from "../interfaces";
import JWTService from "../services/jwt";

export async function initServer() {
  const app = express();

  app.use(bodyParser.json());
  app.use(cors());

  const graphqlserver = new ApolloServer<GraphqlContext>({
    typeDefs: `
            ${User.types}
            ${Tweet.types}


            type Query {
            ${User.queries}
            ${Tweet.queries}
        
            }

            type Mutation {
            ${Tweet.muatations}
            }


            `,
    resolvers: {
      Query: {
        ...User.resolvers.queries,
        ...Tweet.resolvers.queries
      },
      Mutation: {
        ...Tweet.resolvers.muatations
      },
      ...Tweet.resolvers.extraResolvers,
      ...User.resolvers.extraResolvers
    },
  });

  await graphqlserver.start();

  app.use(
    "/graphql",
    expressMiddleware(graphqlserver, {
      context: async ({ req, res }) => {
        return {
          user: req.headers.authorization
            ? JWTService.decodeToken(
                req.headers.authorization.split("Bearer ")[1]
              )
            : undefined,
        };
      },
    })
  );

  return app;
}
