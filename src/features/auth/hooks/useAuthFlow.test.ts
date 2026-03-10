import { createElement } from "react";
import { Alert } from "react-native";
import { act, create } from "react-test-renderer";
import { useAuthFlow } from "./useAuthFlow";

type SignOutResult = {
  error: { message: string } | null;
};

jest.mock("@shared/api", () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

jest.mock("@shared/lib", () => ({
  formatPhoneForDisplay: (value: string) => value,
  normalizePhoneInput: (value: string) => value,
}));

type MockAuthModule = {
  supabase: {
    auth: {
      signOut: jest.Mock<Promise<SignOutResult>, []>;
    };
  };
};

describe("useAuthFlow", () => {
  const { supabase } = jest.requireMock("@shared/api") as MockAuthModule;
  const mockSignOut = supabase.auth.signOut;

  beforeEach(() => {
    mockSignOut.mockReset();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("does not clear local state when Supabase sign-out returns an error", async () => {
    mockSignOut.mockResolvedValue({ error: { message: "Sign out failed" } });

    const onNavigate = jest.fn();
    const onSignedOut = jest.fn();
    let hookState: ReturnType<typeof useAuthFlow> | null = null;

    function HookHarness() {
      hookState = useAuthFlow({ onNavigate, onSignedOut });
      return null;
    }

    act(() => {
      create(createElement(HookHarness));
    });

    await act(async () => {
      await hookState?.handleSignOut();
    });

    expect(onSignedOut).not.toHaveBeenCalled();
    expect(onNavigate).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith("Error", "Sign out failed");
  });

  it("clears local state after a successful sign-out", async () => {
    mockSignOut.mockResolvedValue({ error: null });

    const onNavigate = jest.fn();
    const onSignedOut = jest.fn();
    let hookState: ReturnType<typeof useAuthFlow> | null = null;

    function HookHarness() {
      hookState = useAuthFlow({ onNavigate, onSignedOut });
      return null;
    }

    act(() => {
      create(createElement(HookHarness));
    });

    await act(async () => {
      await hookState?.handleSignOut();
    });

    expect(onSignedOut).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith("home");
  });
});
