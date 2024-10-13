import { account, sac } from "~/lib/client-helpers";

export const useCounterContract = () => {
  const sign = async () => {
    const counter = sac.getSACClient(
      "CCZGEGDKGBZ6EFGJSUXUP66KPJT5CD44G3CUW5NGFXW26A7TU3SCQ7KN",
    );
  };

  return {
    sign,
  };
};
