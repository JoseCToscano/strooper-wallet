"use client";
import { FC, useState } from "react";
import {
  Keypair,
  Transaction,
  Networks,
  TransactionBuilder,
  Horizon,
  BASE_FEE,
  Operation,
} from "@stellar/stellar-sdk";
import { api } from "~/trpc/react";
import { useSearchParams } from "next/navigation";
import {
  getFullName,
  storeKey,
  storeCredentialId,
  storeData,
} from "~/lib/utils";
import { Button } from "~/components/ui/button";
import LoadingDots from "~/components/icons/loading-dots";
import { useCreateStellarPasskey } from "~/hooks/useCreateStellarPasskey";

export const NewPassKey: FC = () => {
  const searchParams = useSearchParams();
  const { create, loading: isCreatingPasskey } = useCreateStellarPasskey();

  return (
    <div>
      <Button
        className="w-full rounded-md border-[1px] border-zinc-800 p-2 text-lg text-zinc-800 transition-colors duration-300 hover:bg-zinc-900"
        onClick={create}
      >
        {isCreatingPasskey ? (
          <>
            <LoadingDots />
          </>
        ) : (
          "Create Passkey"
        )}
      </Button>
    </div>
  );
};
