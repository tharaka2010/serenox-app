import { Stack, useRouter } from "expo-router";
import { LanguageProvider } from '../context/LanguageContext';
import { TouchableOpacity } from "react-native";
import { Feather } from '@expo/vector-icons';
import { LogBox } from 'react-native'; // <--- මේක එකතු කරන්න

// --- Warnings අයින් කරන කෝඩ් එක ---
LogBox.ignoreLogs([
  'Firebase Analytics is not supported',
  'IndexedDB unavailable',
  'expo-notifications',
  'Push notifications'
]);

export default function RootLayout() {
  const router = useRouter();

  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* ඔයාගේ Screens ටික ඒ විදියටම තියන්න */}
        <Stack.Screen name="index" />
        <Stack.Screen name="screen/mainLanding" />
        <Stack.Screen name="screen/news" />
        <Stack.Screen
          name="screen/notification"
          options={{
            headerShown: true,
            title: 'Notifications',
            headerRight: () => (
              <TouchableOpacity onPress={() => router.push('/screen/notification?selectionMode=true')}>
                <Feather name="trash-2" size={24} color="black" style={{ marginRight: 15 }} />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen name="screen/article/[id]" />
        <Stack.Screen name="screen/news/[id]" />
        <Stack.Screen name="loginAuth/signinscreen" options={{ unmountOnBlur: true }} />
        <Stack.Screen name="loginAuth/signupscreen" options={{ unmountOnBlur: true }} />
        <Stack.Screen name="loginAuth/forgotPassword" options={{ unmountOnBlur: true }} />
        <Stack.Screen name="screen/Genaral/genaral_main" />
      </Stack>
    </LanguageProvider>
  );
}