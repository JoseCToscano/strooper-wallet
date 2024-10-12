"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Fingerprint, Shield } from "lucide-react";
import { api } from "~/trpc/react";
import { useStrooper } from "~/hooks/useStrooper";
import { shortStellarAddress } from "~/lib/utils";
import { SelectWallet } from "~/app/_components/SelectWallet";
import { useSessionStore } from "~/hooks/stores/useSessionStore";
import LoadingDots from "~/components/icons/loading-dots";
import { StrooperWallet } from "~/app/_components/StrooperWallet";
import Image from "next/image";

export default function Home() {
  const [biometricAuthStatus, setBiometricAuthStatus] = useState<string>(
    "Checking biometrics...",
  );
  const [authFailed, setAuthFailed] = useState<boolean>(false); // Track if authentication failed
  const [biometricAttempted, setBiometricAttempted] = useState<boolean>(false); // Track if biometrics were attempted
  const { user, isAuthenticated, setIsAuthenticated, setUser, clearSession } =
    useSessionStore();

  const registerUser = api.telegram.saveUser.useMutation({
    onSuccess: (data) => {
      console.log("User registered successfully:", data);
    },
    onError: (error) => {
      console.error("Error registering user:", error);
    },
  });

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

  // Function to handle biometric authentication
  const authenticate = () => {
    console.log("Calling authenitcatye");
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
            window.confirm(
              "Biometric access denied. Please enable biometric access in settings",
            ) && window.Telegram.WebApp.BiometricManager.openSettings();
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
    console.log("Somple console log to watch out on re-renders :)");
  }, []);

  // UseEffect to dynamically load the Telegram script and then authenticate
  useEffect(() => {
    loadTelegramScript()
      .then((requiresAuth) => {
        console.log("Telegram script loaded:", requiresAuth);
        if (requiresAuth) {
          console.log(
            "window.Telegram.WebApp.version: ",
            window.Telegram.WebApp.version,
          );
          window.Telegram.WebApp.ready();
          // Access the user data from Telegram
          const userData = window.Telegram.WebApp.initDataUnsafe?.user;
          if (userData) {
            registerUser.mutate({
              telegramId: userData.id,
              username: userData.username,
              firstName: userData.first_name,
              lastName: userData.last_name,
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

  return (
    <div>
      {isAuthenticated ? (
        <StrooperWallet openUrl={openUrl} />
      ) : (
        <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
          <Card className="w-full max-w-md border-0 bg-white shadow-lg">
            <CardContent className="space-y-8 p-8">
              <div className="space-y-2 text-center">
                <h1 className="flex items-center justify-center text-2xl font-semibold text-zinc-900">
                  Secure Access
                </h1>
                <p className="text-sm text-zinc-500">
                  Authenticate to view your wallet
                </p>
              </div>

              <Button
                className="w-full bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
                size="lg"
                onClick={handleRetry}
              >
                <Fingerprint className="mr-2 h-6 w-6" />
                Authenticate
              </Button>

              {authFailed && (
                <span className="">
                  <p className="text-sm text-red-500">
                    Biometrics Auth failed. Please try again.
                  </p>
                </span>
              )}

              <div className="rounded-lg bg-zinc-50 p-4 text-sm">
                {user ? (
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
                ) : (
                  <div className="flex items-center justify-center">
                    <LoadingDots />
                  </div>
                )}
              </div>
              <div className="flex translate-y-4 flex-row items-center justify-center p-0">
                <Image
                  className=""
                  src="/helmet-logo.png"
                  alt="Strooper Logo"
                  width={30}
                  height={30}
                />
                <h1 className="8xl font-bold">Strooper Wallet</h1>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
