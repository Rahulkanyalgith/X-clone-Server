import { Tweet } from "@prisma/client";

import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";

interface createTweetPayload {
  content: string;
  imageURL?: string;
}

const queries = {
  getAllTweets: () =>
    prismaClient.tweet.findMany({ orderBy: { createdAt: "desc" } }),
};

const muatations = {
  createTweet: async (
    parent: any,
    { payload }: { payload: createTweetPayload },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user) throw new Error("You are not authnicated");
    const tweet = await prismaClient.tweet.create({
      data: {
        content: payload.content,
        imageURL: payload.imageURL,
        author: { connect: { id: ctx.user.id } },
      },
    });
    return tweet;
  },
};

const extraResolvers = {
  Tweet: {
    author: (parent: Tweet) =>
      prismaClient.user.findUnique({ where: { id: parent.authorId } }),
  },
};

export const resolvers = { muatations, extraResolvers , queries };
