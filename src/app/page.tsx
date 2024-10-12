"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Fingerprint, Shield } from "lucide-react";
import { api } from "~/trpc/react";
import { useSessionStore } from "~/hooks/stores/useSessionStore";
import LoadingDots from "~/components/icons/loading-dots";
import { StrooperWallet } from "~/app/_components/StrooperWallet";
import Image from "next/image";

export default function Home() {
  const [isTelegramAppReady, setIsTelegramAppReady] = useState<boolean>(false);
  const [biometricAuthStatus, setBiometricAuthStatus] = useState<string>(
    "Checking biometrics...",
  );
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true); // Track if authentication is in progress
  const [authFailed, setAuthFailed] = useState<boolean>(false); // Track if authentication failed
  const [biometricAttempted, setBiometricAttempted] = useState<boolean>(false); // Track if biometrics were attempted
  const {
    user,
    isAuthenticated,
    setIsAuthenticated,
    setUser,
    clearSession,
    setDefaultContractId,
  } = useSessionStore();

  const { data: updatedUser } = api.telegram.getUser.useQuery(
    { telegramUserId: String(user?.id) },
    {
      enabled: !!user?.id,
    },
  );

  const registerUser = api.telegram.saveUser.useMutation({
    onSuccess: (data) => {
      console.log("User registered successfully:", data);
    },
    onError: (error) => {
      console.error("Error registering user:", error);
    },
  });

  const test = api.stellar.details.useQuery({
    id: "CAEZYXRIPT3Y2TDBSUREH2TCKBMONZW7T2BGW2QOJ2DMLMMFXVN7GUNX",
    network: "Testnet",
  });

  useEffect(() => {
    if (test.data) {
      console.log("Test data: ", test.data);
    }
  }, [test.data]);

  useEffect(() => {
    if (updatedUser?.defaultContractAddress) {
      setDefaultContractId(updatedUser?.defaultContractAddress);
    }
  }, [updatedUser]);

  // Function to dynamically load the Telegram WebApp script if it hasn't been loaded
  const loadTelegramScript = (): Promise<boolean> => {
    console.log("called loadTelegramScript");
    return new Promise<boolean>((resolve, reject) => {
      // Check if the script is already in the document
      if (document.getElementById("telegram-web-app-script")) {
        console.log("Telegram WebApp script is already loaded");
        return resolve(false); // If the script is already present, resolve immediately
      }

      // Create and append the script if it doesn't exist
      const script = document.createElement("script");
      script.id = "telegram-web-app-script"; // Add an id to track it
      script.src = "https://telegram.org/js/telegram-web-app.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () =>
        reject(new Error("Failed to load Telegram WebApp script"));
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    console.log("Somple console log to watch out on re-renders :)");
  }, []);

  // Function to trigger haptic feedback
  const triggerHapticFeedback = (
    type:
      | "light"
      | "medium"
      | "heavy"
      | "rigid"
      | "soft"
      | "success"
      | "warning"
      | "error"
      | "selectionChanged",
  ) => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      switch (type) {
        case "light":
        case "medium":
        case "heavy":
        case "rigid":
        case "soft":
          window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
          break;
        case "success":
        case "warning":
        case "error":
          window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
          break;
        case "selectionChanged":
          window.Telegram.WebApp.HapticFeedback.selectionChanged();
          break;
        default:
          console.warn("Invalid haptic feedback type");
      }
    } else {
      console.error("Haptic feedback is not supported");
    }
  };

  // Function to handle biometric authentication
  const authenticate = () => {
    setIsAuthenticating(true);
    // INIT BIOMETRIC AUTHENTICATION
    if (window.Telegram?.WebApp) {
      if (window.Telegram.WebApp.BiometricManager.isInited) {
        requestBiometrics();
      } else {
        window.Telegram.WebApp.BiometricManager.init(() => {
          requestBiometrics();
        });
      }
    } else {
      console.log("Telegram not available");
    }
    setIsAuthenticating(false);
  };

  const requestBiometricAccess = (cb: () => void) => {
    if (!window.Telegram.WebApp.BiometricManager.isAccessGranted) {
      window.Telegram.WebApp.BiometricManager.requestAccess(
        {
          reason:
            "We require access to Biometric authentication to keep your Wallet data safe",
        },
        (isAccessGranted) => {
          if (isAccessGranted) {
            console.log("Biometric access granted");
            cb();
          } else {
            if (
              window.confirm(
                "Biometric access denied. Please enable biometric access in settings",
              )
            ) {
              window.Telegram.WebApp.BiometricManager.openSettings();
            }
          }
        },
      );
    }
  };

  const authenticateWithBiometrics = () => {
    window.Telegram.WebApp.BiometricManager.authenticate(
      {
        reason: "Authenticate to access your account",
      },
      (isAuthenticated, biometricToken) => {
        console.log("Biometric authentication result:", isAuthenticated);
        if (isAuthenticated) {
          triggerHapticFeedback("success");
          setIsAuthenticated(true);
          setBiometricAuthStatus("Biometric authentication successful");
        } else {
          setAuthFailed(true);
          setBiometricAuthStatus("Biometric authentication failed");
        }
      },
    );
  };

  const requestBiometrics = () => {
    if (window.Telegram.WebApp.BiometricManager.isBiometricAvailable) {
      if (window.Telegram.WebApp.BiometricManager.isAccessGranted) {
        authenticateWithBiometrics();
      } else {
        requestBiometricAccess(authenticateWithBiometrics);
        console.log("Biometric access not granted");
      }
    } else {
      console.log(
        "Biometric not available",
        window.Telegram.WebApp.BiometricManager.isAccessRequested,
      );
    }
  };

  useEffect(() => {
    console.log("Simple console log to watch out on re-renders :)");
  }, []);

  // UseEffect to dynamically load the Telegram script and then authenticate
  useEffect(() => {
    loadTelegramScript()
      .then((requiresAuth) => {
        console.log("Telegram script loaded:", requiresAuth);
        if (requiresAuth) {
          window.Telegram.WebApp.ready();
          setIsTelegramAppReady(true);
          // Access the user data from Telegram
          const userData = window.Telegram.WebApp.initDataUnsafe?.user;
          if (userData) {
            registerUser.mutate({
              telegramId: userData.id,
              username: userData.username ?? "",
              firstName: userData.first_name,
              lastName: userData.last_name ?? "",
            });
            setUser(userData);
          }
          authenticate(); // Trigger initial authentication only once
        }
      })
      .catch((err) => {
        console.error("Error loading Telegram script:", err);
      });
  }, []); // Empty dependency array ensures it runs only once on initial load

  const handleRetry = () => {
    // Reset states and retry authentication
    setAuthFailed(false);
    setBiometricAttempted(false); // Allow re-attempt
    setBiometricAuthStatus("Retrying biometric authentication...");
    authenticate(); // Trigger the authentication flow again when the user clicks retry
  };

  // Function to handle data when returning from the browser
  // const handlePasskeyReturn = () => {
  //   const queryParams = new URLSearchParams(window.location.search);
  //   const status = queryParams.get("status");
  //
  //   if (status === "success") {
  //     console.log("Passkey created successfully!");
  //     setAuthStatus("Authenticated");
  //   } else {
  //     console.log("Passkey creation failed.");
  //     setAuthStatus("Failed");
  //   }
  // };

  const openUrl = (url: string) => {
    return window.Telegram.WebApp.openLink(url);
  };

  const handleLogout = () => {
    clearSession();
    window.Telegram.WebApp.BiometricManager.updateBiometricToken("");
  };

  return (
    <div>
      {isAuthenticated ? (
        <StrooperWallet
          openUrl={openUrl}
          onLogout={handleLogout}
          triggerHapticFeedback={triggerHapticFeedback}
        />
      ) : (
        <div className="flex flex-col bg-zinc-100 p-4">
          <div className="flex min-h-[95vh] items-center justify-center">
            <Card className="w-full max-w-md border-0 bg-white shadow-lg">
              <CardContent className="space-y-8 p-8">
                <div className="space-y-2 text-center">
                  <Shield className="mx-auto h-12 w-12 text-zinc-800" />
                  <h1 className="flex items-center justify-center text-2xl font-semibold text-zinc-900">
                    Secure Access
                  </h1>
                  <p className="text-sm text-zinc-500">
                    Authenticate to view your wallet
                  </p>
                </div>

                {!isAuthenticated && (
                  <Button
                    className="w-full bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
                    size="lg"
                    onClick={() => {
                      handleRetry();
                    }}
                  >
                    <Fingerprint className="mr-2 h-6 w-6" />
                    {isAuthenticating ? (
                      <LoadingDots color="white" />
                    ) : biometricAttempted ? (
                      "Retry"
                    ) : (
                      "Authenticate"
                    )}
                  </Button>
                )}
                {authFailed && (
                  <span className="">
                    <p className="text-sm text-red-500">
                      Biometrics Auth failed. Please try again.
                    </p>
                  </span>
                )}

                <div className="rounded-lg bg-zinc-50 p-4 text-sm">
                  {user && (
                    <>
                      <p className="font-mono text-zinc-700">
                        <span className="text-zinc-400">User:</span>{" "}
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="font-mono text-zinc-700">
                        <span className="text-zinc-400">Username:</span>{" "}
                        {user?.username}
                      </p>
                    </>
                  )}
                  {!isTelegramAppReady && (
                    <div className="flex items-center justify-center">
                      <LoadingDots />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex -translate-y-4 flex-row items-center justify-center p-0">
            <Image
              className=""
              src="/helmet-logo.png"
              alt="Strooper Logo"
              width={30}
              height={30}
            />
            <h1 className="8xl font-bold">Strooper Wallet</h1>
          </div>
        </div>
      )}
    </div>
  );
}
