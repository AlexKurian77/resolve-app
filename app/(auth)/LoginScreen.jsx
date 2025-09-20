import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ResolveLogo from "../../assets/images/resolve.png";
import { signIn, signUp } from "../../firebase/authService";
import { createUserDoc } from "../../firebase/firestoreService";

export default function LoginScreen() {
  const [tab, setTab] = useState("login");
  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  // Sign up fields
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  // Message
  const [message, setMessage] = useState("");

  const handleSignUp = async () => {
    try {
      const userCred = await signUp(signupEmail, signupPassword);
      await createUserDoc(userCred.user.uid, { displayName: signupUsername });
      setMessage("Signup successful!");
      router.replace("/HomeScreen");
      ToastAndroid.show("Account created successfully!", ToastAndroid.SHORT);
    } catch (err) {
      setMessage(err.message);
      console.log(err);
    }
  };

  const handleSignIn = async () => {
    try {
      await signIn(loginEmail, loginPassword);
      setMessage("Login successful!");
      router.replace("/HomeScreen");
      ToastAndroid.show("Logged In successfully!", ToastAndroid.SHORT);
    } catch (err) {
      setMessage(err.message);
      console.log(err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f6faef]">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView>
          <View className="flex-1 px-4 pt-12">
            {/* Header */}
            <View className="flex-row items-center mb-8 justify-center">
              <View className="bg-[#e3f6e8] p-2 rounded-full mr-3">
                <Image
                  source={ResolveLogo}
                  style={{ width: 200, height: 200 }}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Tabs */}
            <View className="flex-row mb-4 justify-center">
              <TouchableOpacity
                className={`px-6 py-2 rounded-tl-2xl rounded-bl-2xl ${tab === "login" ? "bg-[#4bb38a]" : "bg-[#e3f6e8]"}`}
                onPress={() => setTab("login")}
              >
                <Text
                  className={`font-semibold ${tab === "login" ? "text-white" : "text-[#4bb38a]"}`}
                >
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-6 py-2 rounded-tr-2xl rounded-br-2xl ${tab === "signup" ? "bg-[#b7aaff]" : "bg-[#e3e3f6]"}`}
                onPress={() => setTab("signup")}
              >
                <Text
                  className={`font-semibold ${tab === "signup" ? "text-white" : "text-[#b7aaff]"}`}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Card */}
            <View className="bg-[#f8fbf4] rounded-2xl p-6 shadow-sm border border-[#e3f6e8] mx-1">
              {tab === "login" ? (
                <>
                  <Text className="text-xl font-semibold text-[#222] mb-2 text-center">
                    Welcome Back
                  </Text>
                  <Text className="text-[#7a8b99] text-center mb-6">
                    Sign in to continue your journey
                  </Text>
                  <View className="mb-4">
                    <Text className="text-[#4bb38a] font-medium mb-1">
                      Email
                    </Text>
                    <TextInput
                      className="w-full border border-[#e3f6e8] rounded-lg px-4 py-2 bg-white"
                      placeholder="Email"
                      placeholderTextColor="#b7aaff"
                      value={loginEmail}
                      onChangeText={setLoginEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                  <View className="mb-6">
                    <Text className="text-[#4bb38a] font-medium mb-1">
                      Password
                    </Text>
                    <TextInput
                      className="w-full border border-[#e3f6e8] rounded-lg px-4 py-2 bg-white"
                      placeholder="Password"
                      placeholderTextColor="#b7aaff]"
                      secureTextEntry
                      value={loginPassword}
                      onChangeText={setLoginPassword}
                    />
                  </View>
                  <TouchableOpacity
                    className="bg-[#4bb38a] w-full py-3 rounded-lg mb-3 shadow-sm"
                    onPress={handleSignIn}
                  >
                    <Text className="text-white text-center font-semibold">
                      Login
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text className="text-xl font-semibold text-[#222] mb-2 text-center">
                    Create Account
                  </Text>
                  <Text className="text-[#7a8b99] text-center mb-6">
                    Sign up to start your journey
                  </Text>
                  <View className="mb-4">
                    <Text className="text-[#4bb38a] font-medium mb-1">
                      Username
                    </Text>
                    <TextInput
                      className="w-full border border-[#e3f6e8] rounded-lg px-4 py-2 bg-white"
                      placeholder="Username"
                      placeholderTextColor="#b7aaff"
                      value={signupUsername}
                      onChangeText={setSignupUsername}
                      autoCapitalize="words"
                    />
                  </View>
                  <View className="mb-4">
                    <Text className="text-[#4bb38a] font-medium mb-1">
                      Email
                    </Text>
                    <TextInput
                      className="w-full border border-[#e3f6e8] rounded-lg px-4 py-2 bg-white"
                      placeholder="Email"
                      placeholderTextColor="#b7aaff"
                      value={signupEmail}
                      onChangeText={setSignupEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                  <View className="mb-6">
                    <Text className="text-[#4bb38a] font-medium mb-1">
                      Password
                    </Text>
                    <TextInput
                      className="w-full border border-[#e3f6e8] rounded-lg px-4 py-2 bg-white"
                      placeholder="Password"
                      placeholderTextColor="#b7aaff]"
                      secureTextEntry
                      value={signupPassword}
                      onChangeText={setSignupPassword}
                    />
                  </View>
                  <TouchableOpacity
                    className="bg-[#b7aaff] w-full py-3 rounded-lg shadow-sm"
                    onPress={handleSignUp}
                  >
                    <Text className="text-white text-center font-semibold">
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              {message ? (
                <Text className="mt-4 text-red-500 text-center">{message}</Text>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
