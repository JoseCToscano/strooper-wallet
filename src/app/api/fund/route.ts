import {
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Keypair,
  BASE_FEE,
  Asset,
} from "@stellar/stellar-sdk";
import { env } from "~/env";
import { hasEnoughBalance, toStroops } from "~/lib/utils";
import { NextRequest, NextResponse } from "next/server";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const DEFAULT_AMOUNT = toStroops("500");
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
    if (!hasEnoughBalance(accountBalance, DEFAULT_AMOUNT)) {
      await fetch(
        `https://friendbot.stellar.org?addr=${funderKeypair.publicKey()}`,
      );
    }

    // Build the transaction to fund the SAC
    const transaction = new TransactionBuilder(funderAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: addr, // This is the SAC address
          asset: Asset.native(), // Native XLM
          amount: DEFAULT_AMOUNT, // Amount to send (adjust as necessary)
        }),
      )
      .setTimeout(180)
      .build();

    // Sign the transaction
    transaction.sign(funderKeypair);

    // Submit the transaction
    const transactionResult = await server.submitTransaction(transaction);
    return NextResponse.json(
      { success: true, result: transactionResult },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error funding SAC:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
