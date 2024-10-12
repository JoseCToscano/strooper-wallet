import { useState } from "react";
import { Keypair } from "@stellar/stellar-sdk";

export const useCreateNewStellarAddress = () => {
  const [publicKey, setPublicKey] = useState("");
  const [secretKey, setSecretKey] = useState("");

  const generateStellarKeypair = () => {
    const keypair = Keypair.random();
    setPublicKey(keypair.publicKey());
    setSecretKey(keypair.secret());
    console.log(
      "Generated Stellar Keypair:",
      keypair.publicKey(),
      keypair.secret(),
    );
    return keypair;
  };
};
