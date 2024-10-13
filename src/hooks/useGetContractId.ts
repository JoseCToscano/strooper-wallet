import { api } from "~/trpc/react";
import { type RefetchOptions } from "@tanstack/react-query";

export const useGetContractId = () => {
  const getContractIdQuery = api.stellar.getContractId.useQuery("", {
    enabled: false,
  });

  const fetcher = async (signerId: string) => {
    try {
      console.log("signer id is: ", signerId);
      const res = await getContractIdQuery.refetch(signerId as RefetchOptions);
      console.log("contract id is: ", res.data);
      return res.data as string;
    } catch (err) {
      throw err;
    }
  };

  return { getContractId: fetcher };
};
