import { z } from "zod";
import {
    Horizon,
    TransactionBuilder,
    Networks,
    Operation,
    BASE_FEE,
    Asset,
} from "@stellar/stellar-sdk";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { shortStellarAddress } from "~/lib/utils";

export const telegramRouter = createTRPCRouter({
    saveUser: publicProcedure
        .input(
            z.object({
                telegramId: z.number(),
                username: z.string(),
                firstName: z.string(),
                lastName: z.string(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const existingUser = await ctx.db.user.findFirst({
                where: {
                    telegramId: String(input.telegramId),
                },
            });
            if (existingUser) {
                return existingUser;
            }
            const user = ctx.db.user.create({
                data: {
                    telegramId: String(input.telegramId),
                    telegramUsername: input.username,
                    telegramFirstName: input.firstName,
                    telegramLastName: input.lastName,
                },
            });
            return user;
        }),
    session: publicProcedure
        .input(z.object({ telegramUserId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const user = await ctx.db.user.findFirstOrThrow({
                where: { telegramId: input.telegramUserId },
            });

            const session = await ctx.db.session.create({
                data: {
                    userId: String(user.id),
                    expiresAt: new Date(Date.now() + 1000 * 60 * 10), // Session expires in 10 minutes
                },
            });
            return session;
        }),
    getSession: publicProcedure
        .input(z.object({ sessionId: z.string() }))
        .query(async ({ input, ctx }) => {
            console.log("getSession called with sessionId:", input.sessionId);
            const session = await ctx.db.session.findFirstOrThrow({
                where: { id: input.sessionId },
            });
            // if (session.expiresAt < new Date()) {
            //   throw new Error("Session expired");
            // }
            if (session.userId) {
                console.log("session.userId", session.userId);
                const user = await ctx.db.user.findFirstOrThrow({
                    where: { id: session.userId },
                });
                return { session, user };
            }
            throw new Error("User not found");
        }),
    payment: publicProcedure
        .input(
            z.object({
                telegramUserId: z.string(),
                publicKey: z.string(),
                amount: z.number(),
                receiverAddress: z.string(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const server = new Horizon.Server("https://horizon-testnet.stellar.org");
            const standardTimebounds = 300; // 5 minutes for the user to review/sign/submit
            const account = await server.loadAccount(input.publicKey);
            const transaction = new TransactionBuilder(account, {
                fee: BASE_FEE,
                networkPassphrase: Networks.TESTNET,
            })
                .addOperation(
                    Operation.payment({
                        destination: input.receiverAddress,
                        asset: Asset.native(),
                        amount: String(input.amount),
                    }),
                )
                .setTimeout(standardTimebounds)
                .build();

            const user = await ctx.db.user.findFirstOrThrow({
                where: { telegramId: input.telegramUserId },
            });

            const newPaymentSession = await ctx.db.session.create({
                data: {
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 1000 * 60 * 10),
                    unsignedXDR: transaction.toXDR(),
                    publicKey: input.publicKey,
                },
            });

            return newPaymentSession;
        }),
    accountData: publicProcedure
        .input(z.object({ publicKey: z.string() }))
        .query(async ({ input }) => {
            const server = new Horizon.Server("https://horizon-testnet.stellar.org");
            const account = await server.loadAccount(input.publicKey);
            return account;
        }),
    operations: publicProcedure
        .input(
            z.object({
                id: z.string(),
                limit: z.number().default(5).optional(),
            }),
        )
        .query(async ({ input, ctx }) => {
            const server = new Horizon.Server("https://horizon-testnet.stellar.org");
            const ops = await server
                .operations()
                .forAccount(input.id)
                .order("desc")
                .limit(input.limit ?? 15)
                .call();
            return ops.records.map((op) => {
                const operation = {
                    id: op.id,
                    created_at: op.created_at,
                    type: op.type,
                    label: `${op.type}`,
                    source: op.source_account,
                    desc: "",
                    asset_code: "",
                };
                switch (op.type) {
                    case Horizon.HorizonApi.OperationResponseType.invokeHostFunction:
                        if (op.asset_balance_changes.length) {
                            console.log(op);
                            operation.desc = op.asset_balance_changes.reduce(
                                (acc, change) => {
                                    if (change.asset_code) {
                                        operation.asset_code = change.asset_code;
                                    }
                                    if (change.to === "env.ISSUER_PUBLIC_KEY") {
                                        return `${acc ? `${acc},` : ""}${change.type} ${Number(change.amount)} ${change.asset_type === "native" ? "XLM" : change.asset_code}: Fees & Commissions`;
                                    }
                                    return `${acc ? `${acc},` : ""}${change.type} ${Number(change.amount)} ${change.asset_type === "native" ? "XLM" : change.asset_code} ${change.to ? `to ${shortStellarAddress(change.to)}` : ""}`;
                                },
                                "",
                            );
                        } else {
                            operation.desc = "No asset balance changes";
                        }
                        if (op.function?.toLowerCase().includes("invokecontract")) {
                            operation.label = "Soroban contract function call";
                        } else {
                            operation.label = "Invoke host function";
                        }
                        break;
                    case Horizon.HorizonApi.OperationResponseType.createAccount:
                        operation.label = "Create account";
                        operation.desc = `create account ${shortStellarAddress(op.account)}`;
                        break;
                    case Horizon.HorizonApi.OperationResponseType.payment:
                        operation.label = "Payment";
                        operation.desc = `payment ${Number(op.amount)} ${op.asset_code ?? ""} to ${shortStellarAddress(op.to)}`;

                        operation.asset_code = op.asset_code ?? "";
                        break;
                    case Horizon.HorizonApi.OperationResponseType.pathPayment:
                        operation.label = "Path payment";
                        operation.desc = `path payment ${Number(op.amount)} ${op.asset_code} to ${op.to}`;
                        operation.asset_code = op.asset_code ?? "";
                        break;
                    case Horizon.HorizonApi.OperationResponseType.manageOffer:
                        operation.label = "Manage offer";
                        operation.desc = `${op.buying_asset_code ?? ""} for ${Number(op.amount)} ${op.selling_asset_code}`;
                        operation.asset_code =
                            op.buying_asset_code && op.selling_asset_code
                                ? `${op.buying_asset_code}<>${op.selling_asset_code}`
                                : (op.buying_asset_code ?? "");
                        break;
                    case Horizon.HorizonApi.OperationResponseType.createPassiveOffer:
                        operation.label = "Create passive offer";
                        operation.desc = `create passive offer ${op.offer_id} ${op.buying_asset_code} for ${op.amount} ${op.selling_asset_code}`;
                        operation.asset_code =
                            op.buying_asset_code && op.selling_asset_code
                                ? `${op.buying_asset_code}<>${op.selling_asset_code}`
                                : (op.buying_asset_code ?? "");
                        break;
                    case Horizon.HorizonApi.OperationResponseType.setOptions:
                        operation.label = "Set options";
                        operation.desc = `set options for ${shortStellarAddress(op.source_account)} ${op.home_domain}`;
                        break;
                    case Horizon.HorizonApi.OperationResponseType.changeTrust:
                        operation.label = "Change trust";
                        operation.desc = `change trust for ${op.asset_code}`;
                        operation.asset_code = op.asset_code ?? "";
                        break;
                    case Horizon.HorizonApi.OperationResponseType.allowTrust:
                        operation.label = "Allow trust";
                        operation.desc = `allow trust for ${op.asset_code}`;
                        operation.asset_code = op.asset_code ?? "";
                        break;
                    case Horizon.HorizonApi.OperationResponseType.accountMerge:
                        operation.label = "Account merge";
                        operation.desc = `merge account ${op.into}`;
                        break;
                    case Horizon.HorizonApi.OperationResponseType.inflation:
                        operation.label = "Inflation";
                        operation.desc = `inflation`;
                        break;
                    case Horizon.HorizonApi.OperationResponseType.manageData:
                        operation.label = "Manage data";
                        operation.desc = `manage data for ${op.name}`;
                        break;
                    case Horizon.HorizonApi.OperationResponseType.bumpSequence:
                        operation.label = "Bump sequence";
                        operation.desc = `bump sequence to ${op.bump_to}`;
                        break;
                    case Horizon.HorizonApi.OperationResponseType.createClaimableBalance:
                        operation.label = "Create claimable balance";
                        operation.desc = `create claimable balance`;
                        break;
                    case Horizon.HorizonApi.OperationResponseType.claimClaimableBalance:
                        operation.label = "Claim claimable balance";
                        operation.desc = `claim claimable balance`;
                        break;
                    case Horizon.HorizonApi.OperationResponseType
                        .beginSponsoringFutureReserves:
                        operation.label = "Begin sponsoring future reserves";
                        operation.desc = `begin sponsoring future reserves`;
                        break;
                    case Horizon.HorizonApi.OperationResponseType
                        .endSponsoringFutureReserves:
                        operation.label = "End sponsoring future reserves";
                        operation.desc = `end sponsoring future reserves`;
                        break;
                    case Horizon.HorizonApi.OperationResponseType.revokeSponsorship:
                        operation.label = "Revoke sponsorship";
                        operation.desc = `revoke sponsorship`;
                        break;
                    case Horizon.HorizonApi.OperationResponseType.clawback:
                    case Horizon.HorizonApi.OperationResponseType
                        .clawbackClaimableBalance:
                        operation.label = "Clawback";
                        operation.desc = `clawback`;
                        break;
                    case Horizon.HorizonApi.OperationResponseType.setTrustLineFlags:
                        operation.label = "Set trust line flags";
                        operation.desc = `set trust line flags`;
                        break;
                    case Horizon.HorizonApi.OperationResponseType
                        .manageBuyOffer as Horizon.HorizonApi.OperationResponseType.manageOffer: // Horizon API is not correctly mapping manageBuyOffer
                        operation.label = "Manage buy offer";
                        operation.desc = `${Number(op.amount ?? "0")} ${op.buying_asset_code} for ${op.price}`;
                        operation.asset_code =
                            op.buying_asset_code && op.selling_asset_code
                                ? `${op.buying_asset_code}<>${op.selling_asset_code}`
                                : (op.buying_asset_code ?? "");
                        break;
                    default:
                        console.log("unkown operation", op);
                        operation.desc = `unknown operation`;
                }
                return operation;
            });
        }),
});
