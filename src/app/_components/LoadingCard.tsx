import { Card, CardContent } from "~/components/ui/card";
import { Shield } from "lucide-react";
import LoadingDots from "~/components/icons/loading-dots";

const LoadingCard = () => {
  return (
    <div className="flex min-h-[95vh] items-center justify-center">
      <Card className="w-full max-w-md border-0 bg-white shadow-lg">
        <CardContent className="space-y-8 p-8">
          <div className="space-y-2 text-center">
            <Shield className="mx-auto h-12 w-12 text-zinc-800" />
            <h1 className="flex items-center justify-center text-2xl font-semibold text-zinc-900">
              Secure Access
            </h1>
            <p className="text-sm text-zinc-500">
              Verifying secure session for enhanced security
            </p>
          </div>

          <div className="items-center justify-center rounded-lg bg-zinc-50 p-4 text-sm">
            <LoadingDots />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingCard;
