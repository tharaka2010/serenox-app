import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore();
const auth = getAuth();

/**
  * Submits user feedback to the 'feedback' collection in Firestore.
  * @param {string} message - The feedback message from the user.
 */
export const submitFeedback = async (message) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User is not authenticated.");
  }

  if (!message || message.trim() === "") {
    throw new Error("Feedback message cannot be empty.");
  }

  const feedbackData = {
    userId: currentUser.uid,
    userEmail: currentUser.email,
    message: message,
    status: "New",
    createdAt: serverTimestamp(),
  };

  try {
    const feedbackCollectionRef = collection(db, "feedback");
    await addDoc(feedbackCollectionRef, feedbackData);
    console.log("Feedback submitted successfully!");
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw new Error("Failed to submit feedback.");
  }
};
