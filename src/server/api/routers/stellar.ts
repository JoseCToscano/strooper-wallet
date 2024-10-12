import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getHorizonServerUrl, handleHorizonServerError } from "~/lib/utils";
import {
  Horizon,
  Networks,
  Transaction,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { account } from "~/lib/server-helpers";
import { rpc } from "~/lib/client-helpers";

export const stellarRouter = createTRPCRouter({
  details: publicProcedure
    .input(z.object({ id: z.string(), network: z.string() }))
    .query(async ({ input }) => {
      console.log("fetching details for contract");
      const ctc = await rpc.getContractData(
        "CAEZYXRIPT3Y2TDBSUREH2TCKBMONZW7T2BGW2QOJ2DMLMMFXVN7GUNX",
      );
      console.log("ctc:", ctc);

      const acc = await rpc.getAccount(
        "CAEZYXRIPT3Y2TDBSUREH2TCKBMONZW7T2BGW2QOJ2DMLMMFXVN7GUNX",
      );
      console.log("acc:", acc);

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
  send: publicProcedure
    .input(z.object({ xdr: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const result = await account.send(input.xdr);
        console.log("Successfully sent XDR to Stellar network", result);
        //
        // console.log("Attempting to send XDR to Stellar network");
        // const server = new Horizon.Server(
        //   "https://horizon-testnet.stellar.org",
        // );
        // const transaction = TransactionBuilder.fromXDR(
        //   input.xdr,
        //   Networks.TESTNET,
        // );
        //
        // // Submit the transaction to the Stellar network
        // const result = await server.submitTransaction(transaction);
        // console.log("Successfully sent XDR to Stellar network", result);

        return {
          success: true,
          result,
        };
      } catch (e) {
        // This will throw a TRPCError with the appropriate message
        handleHorizonServerError(e);
      }
    }),
});
