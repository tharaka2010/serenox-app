import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";

import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function Male_1() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <View className="bg-blue-500 p-4 flex-row items-center ">
        <Text className="text-white text-lg font-bold">General Knowledge</Text>
        <TouchableOpacity
          className="ml-auto"
          onPress={() => router.push("/notification-settings")}
        >
          <Feather name="menu" size={24} color="white" />
        </TouchableOpacity>
      </View>
      {/* Scrollable Content */}
      <ScrollView className="flex-1">
        {/* Top Section */}
        <View className="h-[200px] flex-row items-center justify-center relative  mt-[50px]">
          {/* Placeholder Image */}
          <Image
            source={require("../../../assets/mainLanding/General/1.png")}
            className=" w-[485px] h-[400px]  shadow-md rounded-b-3xl"
            resizeMode="cover"
          />
        </View>

        <View>
          <Text className="mt-[120px] mr-10 ml-10">
            When pregnancy doesn’t go as planned, couples often face a mix of
            emotions and seek answers to various concerns. Here are some common
            questions and topics they want to explore:
          </Text>
          <Text className=" mt-5 mr-10 ml-10 text-lg text-black font-bold">
          {" "}1.Miscarriage Awareness:
          </Text>
          <Text className="mr-10 ml-12">
            {" "} {" "}{" "}
            Many women want to understand what a miscarriage is, why it happens,
            and how to cope with the emotional and physical aspects. Miscarriage
            is common, with up to one in five pregnancies ending in loss. For
            those experiencing multiple losses, it's important to know when to
            seek medical advice or see a fertility specialist.
          </Text>
          

          <Text className=" mt-5 mr-10 ml-10 text-lg text-black font-bold">
          {" "}2.Fertility and Timing:
          </Text>
          <Text className="mr-10 ml-12">
            {" "} {" "}{" "}
            Despite doing everything "right," sometimes conception doesn’t happen as expected. Women may want to know more about tracking ovulation, the optimal timing for conception, and the potential need for professional help after several months of trying.
          </Text>


          <Text className=" mt-5 mr-10 ml-10 text-lg text-black font-bold">
          {" "}3.Mental Health Support:
          </Text>
          <Text className="mr-10 ml-12">
            {" "} {" "}{" "}
            Fertility challenges, miscarriages, and the stress of not getting pregnant as planned can take an emotional toll. Seeking therapy or joining supportive communities where experiences can be shared can be invaluable. A therapist specializing in perinatal mental health can provide tools for processing grief and stress.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
