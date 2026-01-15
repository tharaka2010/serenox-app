import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const registerForPushNotificationsAsync = async (user) => {
  if (!user) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return;
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    if (token) {
      const db = getFirestore();
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        fcmToken: token,
      });
      console.log('FCM token stored for user:', user.uid);
    }
  } catch (error) {
    console.error('Error getting or storing FCM token:', error);
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
};
