import { api } from "~/trpc/react";
import type { RefetchOptions } from "@tanstack/react-query";
import { type Signers } from "@prisma/client";

export const useGetSigners = () => {
  const getSignersQuery = api.stellar.getSigners.useQuery("", {
    enabled: false,
  });

  const fetcher = async (contractId: string): Signers[] => {
    try {
      console.log("contract id is: ", contractId);
      const res = await getSignersQuery.refetch(contractId as RefetchOptions);
      console.log("signers are: ", res.data);
      return res.data as Signers[];
    } catch (err) {
      throw err;
    }
  };

  return { getSigners: fetcher };
};
