import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function App() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#FF9500]">
      <LinearGradient
        colors={["#FF9500", "#FF6B6B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 justify-center items-center"
      >
        <Text className="text-white text-4xl font-bold">
          Hello! Welcome Back
        </Text>
        <Text className="text-gray-300 text-lg mt-4">
          Sign in to your account
        </Text>
      

        <View className="w-full max-w-md mt-8">
          <TextInput
            placeholder="Username"
            placeholderTextColor="#b3b3b3"
            className="bg-white px-4 py-3 rounded-lg mb-4"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#b3b3b3"
            className="bg-white px-4 py-3 rounded-lg mb-4"
            secureTextEntry
          />

          <TouchableOpacity onPress={() => router.push("/registration")}>
            <Text className="text-blue-500 font-medium text-base justify-center pl-4">
              Forget password?{"\n"}
            </Text> 
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-blue-500 px-6 py-3 rounded-lg shadow-lg "
            onPress={() => router.push("screen/mainLanding")}
          >
            <Text className="text-white font-medium text-xl text-center ">
              Sign In
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-300 text-base">
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/registration")}>
              <Text className="text-blue-500 font-bold ">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
