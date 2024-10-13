import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Shield, CheckCircle, ArrowLeft, ExternalLink } from "lucide-react";
import { shortStellarAddress } from "~/lib/utils";
import Image from "next/image";

interface TransactionConfirmationProps {
  amount: string;
  recipient: string;
}

const TransactionConfirmation: React.FC<TransactionConfirmationProps> = ({
  amount,
  recipient,
}) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 p-4">
      <Card className="w-full max-w-md border-0 bg-white shadow-lg">
        <CardHeader className="flex items-center justify-center space-y-1">
          <Image
            className="mx-auto my-0"
            src={"/helmet-black.png"}
            alt="Strooper Logo"
            width={65}
            height={65}
          />
          <CardTitle className="text-center text-2xl font-semibold text-zinc-900">
            Transaction Confirmed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-2">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <p className="text-lg font-medium text-zinc-900">
              Your transaction was successful!
            </p>
          </div>

          <div className="space-y-3 rounded-lg bg-zinc-50 p-4">
            <h2 className="text-sm font-semibold text-zinc-700">
              Transaction Details
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Amount Sent:</span>
                <span className="font-medium text-zinc-900">{amount} XLM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Recipient:</span>
                <span className="font-medium text-zinc-900">
                  {shortStellarAddress(recipient)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <Button
              onClick={() =>
                window.open(
                  `https://stellar.expert/explorer/public/tx/${recipient}`,
                  "_blank",
                )
              }
              className="bg-zinc-800 py-2 text-sm text-white transition-colors duration-300 hover:bg-zinc-900"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Block Explorer
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-zinc-300 py-2 text-sm text-zinc-700 transition-colors duration-300 hover:bg-zinc-100"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Wallet
            </Button>
          </div>

          <p className="text-center text-xs text-zinc-500">
            Transaction completed at {new Date().toLocaleString()}
          </p>
        </CardContent>
      </Card>
      <span className="mt-4 text-xs text-zinc-500">
        Strooper Wallet • ©2024
      </span>
    </div>
  );
};

export default TransactionConfirmation;
