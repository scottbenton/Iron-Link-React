import deepEqual from "fast-deep-equal";
import { useEffect } from "react";
import { immer } from "zustand/middleware/immer";
import { createWithEqualityFn } from "zustand/traditional";

import { AuthService } from "services/auth.service";

export enum AuthStatus {
  Loading,
  Unauthenticated,
  Authenticated,
}

interface AuthState {
  status: AuthStatus;
  uid: string | undefined;
}
interface AuthActions {
  subscribeToAuthStatus: () => () => void;
  sendOTPCodeToEmail: (email: string) => Promise<void>;
  verifyOTPCode: (email: string, otpCode: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = createWithEqualityFn<AuthState & AuthActions>()(
  immer((set) => ({
    status: AuthStatus.Loading,
    uid: undefined,

    subscribeToAuthStatus: () => {
      return AuthService.listenToAuthState(
        (uid) => {
          set((state) => {
            state.status = AuthStatus.Authenticated;
            state.uid = uid;
          });
        },
        () => {
          set((state) => {
            state.status = AuthStatus.Unauthenticated;
            state.uid = undefined;
          });
        },
      );
    },
    sendOTPCodeToEmail: (email) => {
      return AuthService.sendOTPCodeToEmail(email);
    },
    verifyOTPCode: (email, otpCode) => {
      return AuthService.verifyOTPCode(email, otpCode);
    },
    signOut: () => {
      return AuthService.logout();
    },
  })),
  deepEqual,
);

export function useUID() {
  return useAuthStore((state) => state.uid);
}

export function useAuthStatus() {
  return useAuthStore((state) => state.status);
}

export function useListenToAuth() {
  const subscribeToAuthStatus = useAuthStore(
    (store) => store.subscribeToAuthStatus,
  );

  useEffect(() => {
    console.debug("Subscribing to auth status");
    const unsubscribe = subscribeToAuthStatus();
    return unsubscribe;
  }, [subscribeToAuthStatus]);
}
