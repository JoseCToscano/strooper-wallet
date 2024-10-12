"use client";
import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useStrooper } from "~/hooks/useStrooper";
import { shortStellarAddress } from "~/lib/utils";
import { FC } from "react";
import { Wallet } from "@prisma/client";

interface SelectWalletProps {
  availableWallets: Wallet[];
}
export const SelectWallet: FC<SelectWalletProps> = ({ availableWallets }) => {
  const { setPublicKey } = useStrooper();

  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue
          placeholder={`Select Wallet (${availableWallets.length})`}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Your Stellar Wallets</SelectLabel>
          {availableWallets?.map((wallet) => (
            <SelectItem
              value={wallet.publicKey}
              key={wallet.publicKey}
              onClick={() => setPublicKey(wallet.publicKey)}
            >
              {shortStellarAddress(wallet.publicKey)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
