import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getHorizonServerUrl } from "~/lib/utils";
import { Horizon } from "@stellar/stellar-sdk";

export const stellarRouter = createTRPCRouter({
    details: publicProcedure
        .input(z.object({ id: z.string(), network: z.string() }))
        .query(async ({ input }) => {
            const server = new Horizon.Server(getHorizonServerUrl(input.network));
            // the JS SDK uses promises for most actions, such as retrieving an account
            const account = await server.loadAccount(input.id);
            return {
                id: account.account_id,
                balances: account.balances,
                subentryCount: account.subentry_count,
                xlm: account.balances.find(
                    (balance) => balance.asset_type === "native",
                ),
            };
        }),
});
