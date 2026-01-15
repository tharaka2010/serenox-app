const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize the Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();
const logger = functions.logger;

// Set global options (optional, but good practice)
setGlobalOptions({ maxInstances: 10 });

/**
 * Cloud Function that triggers when a new document is created in the
 * 'notifications' collection using the v2 API.
 */
exports.sendPushNotification = onDocumentCreated("notifications/{notificationId}", async (event) => {
  // 1. Get the data from the new notification document
  const snapshot = event.data;
  if (!snapshot) {
    logger.info("No data associated with the event, exiting function.");
    return;
  }
  const notificationData = snapshot.data();
  const { title, body, targetAudience } = notificationData;

  logger.info(`New notification created: "${title}". Targeting:`, targetAudience);

  // 2. Get the list of users to send the notification to
  let usersQuery = db.collection("users");

  // --- Build the query based on the target audience ---
  if (targetAudience && typeof targetAudience === "object") {
    if (targetAudience.gender) {
      usersQuery = usersQuery.where("gender", "==", targetAudience.gender);
    }
    if (targetAudience.language) {
      usersQuery = usersQuery.where("languagePreference", "==", targetAudience.language);
    }
    if (targetAudience.age_min) {
      usersQuery = usersQuery.where("age", ">=", targetAudience.age_min);
    }
    if (targetAudience.age_max) {
      usersQuery = usersQuery.where("age", "<=", targetAudience.age_max);
    }
  }

  // 3. Execute the query and get the user documents
  const usersSnapshot = await usersQuery.get();

  if (usersSnapshot.empty) {
    logger.info("No users found matching the criteria.");
    return;
  }

  // 4. Collect all the valid FCM tokens from the matched users
  const tokens = [];
  usersSnapshot.forEach((doc) => {
    const user = doc.data();
    if (user.fcmToken && typeof user.fcmToken === "string") {
      tokens.push(user.fcmToken);
    }
  });

  if (tokens.length === 0) {
    logger.info("No valid FCM tokens found for the matched users.");
    return;
  }

  logger.info(`Found ${tokens.length} tokens to send notifications to.`);

  // 5. Construct the push notification payload
  const payload = {
    notification: {
      title: title,
      body: body,
      imageUrl: notificationData.imageUrl, // Add the image URL here
      sound: "default",
    },
  };

  // 6. Send the notification to all collected tokens
  try {
    // Use sendToDevice for v2, as it's more robust for multiple tokens
    const response = await admin.messaging().sendToDevice(tokens, payload);
    logger.info("Successfully sent notifications:", response.successCount);
    if (response.failureCount > 0) {
      logger.error("Failed to send some notifications:", response.failureCount);
    }
  } catch (error) {
    logger.error("Error sending push notifications:", error);
  }
});
