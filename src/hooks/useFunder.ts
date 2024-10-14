import { env } from "~/env";
import { useState } from "react";
import toast from "react-hot-toast";

export const useFunder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fund = async (contractAddress: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_APP_URL}/api/fund?addr=${encodeURIComponent(
          contractAddress,
        )}`,
      );
      const responseJSON = await response.json();
      setIsLoading(false);
      return responseJSON;
    } catch (e) {
      setIsLoading(false);
      setError(
        (e as Error)?.message ??
          "Something went wrong. Unable to fund contract",
      );
      toast.error(
        (e as Error)?.message ??
          "Something went wrong. Unable to fund contract",
      );
    }
  };

  return { fund, isLoading, error };
};
