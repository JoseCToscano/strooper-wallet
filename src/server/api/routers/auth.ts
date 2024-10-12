import { z } from "zod";
import base64url from "base64url";
import crypto from "crypto";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export function verifySignature(
  authenticatorData: Uint8Array,
  signature: Uint8Array,
  publicKey: string,
): boolean {
  try {
    // Step 1: Parse the clientDataJSON (base64url encoded)
    const clientDataHash = crypto
      .createHash("sha256")
      .update(authenticatorData)
      .digest();

    // Step 2: Create a verification object
    const verify = crypto.createVerify("SHA256");

    // Combine authenticatorData and clientDataHash for verification
    verify.update(Buffer.concat([authenticatorData, clientDataHash]));
    verify.end();

    // Step 3: Verify the signature using the public key
    const isValid = verify.verify(publicKey, signature);

    return isValid;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}
export const authRouter = createTRPCRouter({
  createStrooperWallet: publicProcedure
    .input(
      z.object({
        userTelegramId: z.string(),
        stellarPublicKey: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Save the user's Stellar public key in the database
      const { userTelegramId, stellarPublicKey } = input;
      console.log(`Linking user ${userTelegramId} to Stellar public key`);
      console.log(`Stellar public key: ${stellarPublicKey}`);
      const user = await ctx.db.user.findFirstOrThrow({
        where: {
          telegramId: userTelegramId,
        },
      });

      await ctx.db.wallet.create({
        data: {
          publicKey: stellarPublicKey,
          userId: user?.id,
        },
      });
      return { success: true };
    }),
});
