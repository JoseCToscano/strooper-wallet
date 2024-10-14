import { env } from "~/env";
import { useState } from "react";

export const useFunder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const fund = async (contractAddress: string) => {
    setIsLoading(true);
    const response = await fetch(
      `${env.NEXT_PUBLIC_APP_URL}/api/fund?addr=${encodeURIComponent(
        contractAddress,
      )}`,
    );
    const responseJSON = await response.json();
    setIsLoading(false);
    return responseJSON;
  };

  return { fund, isLoading };
};
