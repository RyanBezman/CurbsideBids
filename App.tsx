import "./global.css";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { supabase } from "./lib/supabase";
import { User } from "@supabase/supabase-js";

type Screen = "home" | "signup" | "signin";
console.log("app started");

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Check auth state on mount
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      // Navigate to home when user signs in or signs up
      if (session?.user) {
        setScreen("home");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign Up Handler
  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone: phone,
        },
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else if (data.session) {
      // User is logged in - clear form, onAuthStateChange handles navigation
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
    } else if (data.user && !data.session) {
      // Email confirmation required
      Alert.alert(
        "Check your email",
        "Please check your email to confirm your account before signing in.",
        [{ text: "OK", onPress: () => setScreen("signin") }],
      );
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
    }
  };

  // Sign In Handler
  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else if (data.session) {
      // Clear form - onAuthStateChange will handle navigation
      setEmail("");
      setPassword("");
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setScreen("home");
  };

  // Sign Up Screen
  if (screen === "signup") {
    return (
      <SafeAreaView className="flex-1 bg-neutral-950">
        <StatusBar style="light" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
            <View className="flex-1 px-5 pt-6">
              {/* Header */}
              <View className="flex-row items-center mb-8">
                <TouchableOpacity
                  onPress={() => setScreen("home")}
                  className="w-10 h-10 bg-neutral-900 rounded-full items-center justify-center border border-neutral-800 mr-4"
                >
                  <Text className="text-white text-lg">←</Text>
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-white">
                  Create Account
                </Text>
              </View>

              {/* Form */}
              <View className="gap-4 mb-8">
                <View>
                  <Text className="text-neutral-400 text-sm mb-2 ml-1">
                    Full Name
                  </Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="John Doe"
                    placeholderTextColor="#525252"
                    className="bg-neutral-900 rounded-2xl px-5 py-4 text-white text-base border border-neutral-800"
                  />
                </View>

                <View>
                  <Text className="text-neutral-400 text-sm mb-2 ml-1">
                    Email
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="john@example.com"
                    placeholderTextColor="#525252"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="bg-neutral-900 rounded-2xl px-5 py-4 text-white text-base border border-neutral-800"
                  />
                </View>

                <View>
                  <Text className="text-neutral-400 text-sm mb-2 ml-1">
                    Phone Number
                  </Text>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="(555) 123-4567"
                    placeholderTextColor="#525252"
                    keyboardType="phone-pad"
                    className="bg-neutral-900 rounded-2xl px-5 py-4 text-white text-base border border-neutral-800"
                  />
                </View>

                <View>
                  <Text className="text-neutral-400 text-sm mb-2 ml-1">
                    Password
                  </Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a password"
                    placeholderTextColor="#525252"
                    secureTextEntry
                    className="bg-neutral-900 rounded-2xl px-5 py-4 text-white text-base border border-neutral-800"
                  />
                </View>
              </View>

              {/* Terms */}
              <Text className="text-neutral-500 text-xs text-center mb-6 px-4">
                By signing up, you agree to our{" "}
                <Text className="text-violet-400">Terms of Service</Text> and{" "}
                <Text className="text-violet-400">Privacy Policy</Text>
              </Text>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSignUp}
                disabled={loading}
                className="bg-violet-600 rounded-2xl py-4 mb-4"
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center text-base font-bold">
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>

              {/* Sign In Link */}
              <TouchableOpacity
                onPress={() => setScreen("signin")}
                disabled={loading}
              >
                <Text className="text-neutral-500 text-sm text-center">
                  Already have an account?{" "}
                  <Text className="text-violet-400 font-medium">Sign in</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Sign In Screen
  if (screen === "signin") {
    return (
      <SafeAreaView className="flex-1 bg-neutral-950">
        <StatusBar style="light" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 px-5 pt-6">
            {/* Header */}
            <View className="flex-row items-center mb-8">
              <TouchableOpacity
                onPress={() => setScreen("home")}
                className="w-10 h-10 bg-neutral-900 rounded-full items-center justify-center border border-neutral-800 mr-4"
              >
                <Text className="text-white text-lg">←</Text>
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-white">
                Welcome Back
              </Text>
            </View>

            {/* Form */}
            <View className="gap-4 mb-8">
              <View>
                <Text className="text-neutral-400 text-sm mb-2 ml-1">
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="john@example.com"
                  placeholderTextColor="#525252"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="bg-neutral-900 rounded-2xl px-5 py-4 text-white text-base border border-neutral-800"
                />
              </View>

              <View>
                <Text className="text-neutral-400 text-sm mb-2 ml-1">
                  Password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#525252"
                  secureTextEntry
                  className="bg-neutral-900 rounded-2xl px-5 py-4 text-white text-base border border-neutral-800"
                />
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="mb-8">
              <Text className="text-violet-400 text-sm text-center font-medium">
                Forgot password?
              </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={loading}
              className="bg-violet-600 rounded-2xl py-4 mb-4"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center text-base font-bold">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <TouchableOpacity
              onPress={() => setScreen("signup")}
              disabled={loading}
            >
              <Text className="text-neutral-500 text-sm text-center">
                Don't have an account?{" "}
                <Text className="text-violet-400 font-medium">Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Logged In Home Screen
  if (user) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-950">
        <StatusBar style="light" />

        <View className="flex-1 px-5 pt-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8">
            <View>
              <Text className="text-3xl font-bold text-white tracking-tight">
                Curbside
              </Text>
              <Text className="text-sm text-neutral-500 mt-1">
                Welcome back!
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleSignOut}
              className="bg-neutral-900 rounded-full px-4 py-2 border border-neutral-800"
            >
              <Text className="text-neutral-300 text-sm font-medium">
                Log Out
              </Text>
            </TouchableOpacity>
          </View>

          {/* User Info Card */}
          <View className="bg-neutral-900 rounded-2xl p-5 mb-6 border border-neutral-800">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-violet-600 rounded-full items-center justify-center mr-4">
                <Text className="text-white text-xl font-bold">
                  {(user.user_metadata?.full_name || user.email)
                    ?.charAt(0)
                    .toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                  {user.user_metadata?.full_name || user.email}
                </Text>
                <Text className="text-neutral-500 text-sm">Rider</Text>
              </View>
            </View>
          </View>

          {/* Search / Destination Input */}
          <TouchableOpacity className="bg-neutral-900 rounded-2xl px-5 py-4 mb-6 flex-row items-center border border-neutral-800">
            <View className="w-3 h-3 rounded-full bg-violet-500 mr-4" />
            <Text className="text-neutral-400 text-base flex-1">Where to?</Text>
            <Text className="text-violet-400">→</Text>
          </TouchableOpacity>

          {/* Quick Actions */}
          <View className="flex-row gap-3 mb-8">
            <TouchableOpacity className="flex-1 bg-violet-600 rounded-2xl py-5 items-center">
              <Text className="text-xl mb-1">🚗</Text>
              <Text className="text-white font-semibold text-sm">Ride</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-neutral-900 rounded-2xl py-5 items-center border border-neutral-800">
              <Text className="text-xl mb-1">📦</Text>
              <Text className="text-neutral-300 font-semibold text-sm">
                Package
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-neutral-900 rounded-2xl py-5 items-center border border-neutral-800">
              <Text className="text-xl mb-1">📅</Text>
              <Text className="text-neutral-300 font-semibold text-sm">
                Schedule
              </Text>
            </TouchableOpacity>
          </View>

          {/* Live Stats Bar */}
          <View className="bg-neutral-900 rounded-2xl p-4 mb-8 flex-row items-center border border-neutral-800">
            <View className="w-2 h-2 rounded-full bg-green-400 mr-3" />
            <Text className="text-neutral-400 text-sm flex-1">
              <Text className="text-white font-semibold">247</Text> drivers
              nearby
            </Text>
            <Text className="text-violet-400 text-sm font-medium">
              ~3 min pickup
            </Text>
          </View>

          {/* Recent Activity Placeholder */}
          <Text className="text-white text-lg font-semibold mb-4">
            Recent Activity
          </Text>
          <View className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800">
            <Text className="text-neutral-500 text-sm text-center">
              No recent rides yet
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Logged Out Home Screen
  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <StatusBar style="light" />

      <View className="flex-1 px-5 pt-6">
        {/* Logo & Greeting */}
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-3xl font-bold text-white tracking-tight">
              Curbside
            </Text>
            <Text className="text-sm text-neutral-500 mt-1">
              Bid. Ride. Save.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setScreen("signin")}
            className="w-11 h-11 bg-neutral-900 rounded-full items-center justify-center border border-neutral-800"
          >
            <Text className="text-base">👤</Text>
          </TouchableOpacity>
        </View>

        {/* Search / Destination Input */}
        <TouchableOpacity className="bg-neutral-900 rounded-2xl px-5 py-4 mb-6 flex-row items-center border border-neutral-800">
          <View className="w-3 h-3 rounded-full bg-violet-500 mr-4" />
          <Text className="text-neutral-400 text-base flex-1">Where to?</Text>
          <Text className="text-violet-400">→</Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View className="flex-row gap-3 mb-8">
          <TouchableOpacity className="flex-1 bg-violet-600 rounded-2xl py-5 items-center">
            <Text className="text-xl mb-1">🚗</Text>
            <Text className="text-white font-semibold text-sm">Ride</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-neutral-900 rounded-2xl py-5 items-center border border-neutral-800">
            <Text className="text-xl mb-1">📦</Text>
            <Text className="text-neutral-300 font-semibold text-sm">
              Package
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-neutral-900 rounded-2xl py-5 items-center border border-neutral-800">
            <Text className="text-xl mb-1">📅</Text>
            <Text className="text-neutral-300 font-semibold text-sm">
              Schedule
            </Text>
          </TouchableOpacity>
        </View>

        {/* Live Stats Bar */}
        <View className="bg-neutral-900 rounded-2xl p-4 mb-8 flex-row items-center border border-neutral-800">
          <View className="w-2 h-2 rounded-full bg-green-400 mr-3" />
          <Text className="text-neutral-400 text-sm flex-1">
            <Text className="text-white font-semibold">247</Text> drivers nearby
          </Text>
          <Text className="text-violet-400 text-sm font-medium">
            ~3 min pickup
          </Text>
        </View>

        {/* How It Works */}
        <Text className="text-white text-lg font-semibold mb-4">
          How it works
        </Text>

        <View className="gap-4 mb-6">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-violet-600/20 items-center justify-center mr-4 border border-violet-500/30">
              <Text className="text-violet-400 text-xs font-bold">1</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-medium">Enter destination</Text>
              <Text className="text-neutral-500 text-sm">
                Tell us where you're going
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-violet-600/20 items-center justify-center mr-4 border border-violet-500/30">
              <Text className="text-violet-400 text-xs font-bold">2</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-medium">Get live bids</Text>
              <Text className="text-neutral-500 text-sm">
                Drivers compete for your ride
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-violet-600/20 items-center justify-center mr-4 border border-violet-500/30">
              <Text className="text-violet-400 text-xs font-bold">3</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-medium">Choose & go</Text>
              <Text className="text-neutral-500 text-sm">
                Pick the best price, ride in minutes
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom CTA */}
        <View className="mt-auto pb-4">
          <TouchableOpacity
            onPress={() => setScreen("signup")}
            className="bg-violet-600 rounded-2xl py-4 mb-4"
          >
            <Text className="text-white text-center text-base font-bold">
              Get Started
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen("signin")}>
            <Text className="text-neutral-500 text-sm text-center">
              Already have an account?{" "}
              <Text className="text-violet-400 font-medium">Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
