import { api } from "~/trpc/react";

export const useGetContractId = () => {
  const getContractIdQuery = api.stellar.getContractId.useQuery("", {
    disabled: true,
  });

  const fetcher = async (signerId: string) => {
    try {
      console.log("signer id is: ", signerId);
      const res = await getContractIdQuery.refetch(signerId);
      console.log("contract id is: ", res.data);
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  return { getContractId: fetcher };
};
