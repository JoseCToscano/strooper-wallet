import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getHorizonServerUrl, handleHorizonServerError } from "~/lib/utils";
import { Asset, Horizon, Networks } from "@stellar/stellar-sdk";
import { account } from "~/lib/server-helpers";

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
  saveSigner: publicProcedure
    .input(z.object({ contractId: z.string(), signerId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.signers.create({
        data: {
          signerId: input.signerId,
          contractId: input.contractId,
        },
      });
    }),
  getContractId: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const signer = await ctx.db.signers.findFirstOrThrow({
        where: {
          signerId: input,
        },
      });
      return signer.contractId;
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
  getBalance: publicProcedure
    .input(z.object({ contractAddress: z.string() }))
    .query(async ({ input }) => {
      console.log("fetching balance for contract", input.contractAddress);
      const balance = await account.rpc?.getSACBalance(
        input.contractAddress,
        Asset.native(),
        Networks.TESTNET,
      );
      console.log("balance", balance);
      return balance?.balanceEntry?.amount ?? "0";
    }),
});
