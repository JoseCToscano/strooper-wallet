import {
  Horizon,
  TransactionBuilder,
  Networks,
  Keypair,
} from "@stellar/stellar-sdk";
import { env } from "~/env";
import {
  addressToScVal,
  getContractXDR,
  handleHorizonServerError,
  hasEnoughBalance,
  numberToi128,
} from "~/lib/utils";
import type { NextRequest, NextResponse } from "next/server";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const DEFAULT_AMOUNT = 50000000;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const addr = searchParams.get("addr"); // Extract `addr` from query parameters

    if (!addr) {
      return NextResponse.json(
        { error: "Contract address (addr) is required as a query parameter" },
        { status: 400 },
      );
    }

    // Load the funder's account
    const funderKeypair = Keypair.fromSecret(env.FUNDER_SECRET_KEY);
    const funderAccount = await server.loadAccount(funderKeypair.publicKey());

    // If Account has not enough balance, request for airdrop
    const accountBalance =
      funderAccount.balances.find((b) => b.asset_type === "native")?.balance ??
      "0";
    console.log("Account balance:", accountBalance);
    if (!hasEnoughBalance(accountBalance, DEFAULT_AMOUNT)) {
      console.log("Re-funding account...");
      console.log(funderKeypair.publicKey());
      await fetch(
        `https://friendbot.stellar.org?addr=${funderKeypair.publicKey()}`,
      );
    }

    const paramsForTransfer = [
      addressToScVal(funderKeypair.publicKey()), // From
      addressToScVal(addr), // To
      numberToi128(DEFAULT_AMOUNT), // Amount
    ];

    const xdr = await getContractXDR(
      env.NATIVE_CONTRACT_ID,
      "transfer",
      funderKeypair.publicKey(),
      paramsForTransfer,
    );

    const transaction = TransactionBuilder.fromXDR(xdr, Networks.TESTNET);

    // Sign the transaction
    transaction.sign(funderKeypair);

    // Submit the transaction
    const transactionResult = await server
      .submitTransaction(transaction)
      .catch(handleHorizonServerError);
    return NextResponse.json(
      { success: true, result: transactionResult },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
