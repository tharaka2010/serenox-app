# Serenox Mobile Application

This document provides a technical overview of the Serenox mobile application, a React Native project developed with Expo. It details the technology stack, setup instructions, and key features

## 1. Tech Stack

*   **Frontend:** React Native with Expo
*   **Backend:** Firebase (Authentication, Firestore, Analytics)
*   **Routing:** Expo Router
*   **Styling:** NativeWind (Tailwind CSS for React Native)
*   **Core Libraries:**
    *   `react-native-reanimated` for animations
    *   `expo-notifications` for push notifications
    *   `lottie-react-native` for Lottie animations

## 2. Prerequisites

To build and run this application, you will need the following installed on your local machine:

*   **Node.js:** (LTS version, e.g., 18.x or 20.x)
*   **Expo CLI:** `npm install -g expo-cli`
*   **Java Development Kit (JDK):** For Android development
*   **Android Studio:** For running the app on an Android emulator or device

## 3. Installation & Run Commands

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run the application:**
    *   To start the development server:
        ```bash
        npm start
        ```
        or
        ```bash
        expo start
        ```
    *   To run on Android:
        ```bash
        npm run android
        ```
    *   To run on iOS:
        ```bash
        npm run ios
        ```
    *   To run on the web:
        ```bash
        npm run web
        ```

## 4. Key Features

Based on the project structure, here are some of the main technical features:

*   **User Authentication:** The app includes functionality for user sign-up, sign-in, and password recovery.
*   **Article and News Feed:** The application is designed to display articles and news, with the ability to view individual items.
*   **Categorized Content:** Content is organized into categories such as "Child," "Female," "Male," and "General," suggesting a personalized user experience.
*   **Doctor Appointment Booking:** The app appears to have a feature for users to schedule appointments with doctors.
*   **Push Notifications:** The app is configured to send and receive push notifications to keep users engaged.
