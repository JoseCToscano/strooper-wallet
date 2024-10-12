// Define the Telegram WebApp types
interface WebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface WebAppThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

interface WebAppInitData {
  query_id?: string;
  user?: WebAppUser;
  receiver?: WebAppUser;
  chat?: {
    id: number;
    type: string;
    title: string;
    username?: string;
    photo_url?: string;
  };
  auth_date: number;
  hash: string;
}

interface BiometricManager {
  isInited: boolean;
  isBiometricAvailable: boolean;
  biometricType: "finger" | "face" | "unknown";
  isAccessRequested: boolean;
  isAccessGranted: boolean;
  isBiometricTokenSaved: boolean;
  deviceId: string;

  init(callback?: () => void): void;
  requestAccess(
    params: { reason: string },
    callback?: (accessGranted: boolean) => void,
  ): void;
  authenticate(
    params: { reason: string },
    callback: (isAuthenticated: boolean, biometricToken?: string) => void,
  ): void;
  updateBiometricToken(
    token: string,
    callback?: (isUpdated: boolean) => void,
  ): void;
  openSettings(): void;
}

interface WebApp {
  initData: string;
  initDataUnsafe: WebAppInitData;
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: WebAppThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: any;
  MainButton: any;
  BiometricManager: BiometricManager;

  ready(): void;
  close(): void;
  onEvent(event: string, callback: (data: any) => void): void;
  offEvent(event: string, callback: (data: any) => void): void;
  openLink(url: string): void;
  showScanQrPopup(params: { text?: string }): void;
}

interface Window {
  Telegram: {
    WebApp: WebApp;
  };
}
