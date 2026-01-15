// app/screen/docappiment.js

import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { db, auth } from '../../firebase.tsx'; // Ensure this path is correct
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Specific Firestore functions
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

// Helper function to get upcoming Saturday and Sunday
const getWeekendDatesForDisplay = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize to start of day for consistent calculations

    let currentWeekSaturday = new Date(now);
    currentWeekSaturday.setDate(now.getDate() + (6 - now.getDay())); // Get Saturday of current week
    // If today is Sunday and currentWeekSaturday points to a past date (this week's Saturday)
    if (now.getDay() === 0 && currentWeekSaturday.getDate() < now.getDate()) {
        currentWeekSaturday.setDate(currentWeekSaturday.getDate() + 7); // Move to next Saturday
    }
     if (now.getDay() > 6) { // If it's already Sunday, this Saturday already passed, get next week's
         currentWeekSaturday.setDate(currentWeekSaturday.getDate() + 7);
     }


    let currentWeekSunday = new Date(now);
    currentWeekSunday.setDate(now.getDate() + (7 - now.getDay())); // Get Sunday of current week (7-0=7 for Sunday)
    // If today is Monday-Saturday, and currentWeekSunday points to a past date (this week's Sunday)
    if (now.getDay() > 0 && currentWeekSunday.getDate() < now.getDate()) {
         currentWeekSunday.setDate(currentWeekSunday.getDate() + 7); // Move to next Sunday
    }
    if (now.getDay() === 0) { // If today is Sunday, currentWeekSunday is today
         currentWeekSunday = now;
    }

    // Ensure Sunday is after Saturday if Saturday is from this week and Sunday needs to be next week
    if (currentWeekSaturday.getTime() > currentWeekSunday.getTime() && currentWeekSaturday.getDay() === 6 && currentWeekSunday.getDay() === 0) {
        currentWeekSunday.setDate(currentWeekSaturday.getDate() + 1);
    }

    const dates = [];
    // Only add if Saturday is not already passed relative to now
    if (currentWeekSaturday.getTime() >= now.getTime() || currentWeekSaturday.getDay() === 6) {
         dates.push({
             label: currentWeekSaturday.toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
             value: currentWeekSaturday.toISOString()
         });
    }
    // Only add if Sunday is not already passed relative to now
    if (currentWeekSunday.getTime() >= now.getTime() || currentWeekSunday.getDay() === 0) {
        // Avoid adding same date twice if Saturday and Sunday resolve to the same date (shouldn't happen with correct logic)
        if (dates.length === 0 || dates[0].value !== currentWeekSunday.toISOString()) {
             dates.push({
                 label: currentWeekSunday.toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                 value: currentWeekSunday.toISOString()
             });
        }
    }


    // Final check to pick the *next* Saturday and Sunday clearly
    // As of Wednesday, July 9, 2025 at 11:34:22 PM +0530 (today is a Wednesday):
    // Next Saturday: July 12, 2025
    // Next Sunday: July 13, 2025
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1); // Start from tomorrow

    let saturdayFound = false;
    let sundayFound = false;
    let d = new Date(tomorrow);
    const upcomingDates = [];

    for(let i = 0; i < 14; i++) { // Check next 14 days to find the next Sat/Sun
        const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday

        if (dayOfWeek === 6 && !saturdayFound) { // Found next Saturday
            upcomingDates.push({
                label: d.toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                value: d.toISOString()
            });
            saturdayFound = true;
        } else if (dayOfWeek === 0 && !sundayFound) { // Found next Sunday
            upcomingDates.push({
                label: d.toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                value: d.toISOString()
            });
            sundayFound = true;
        }

        if (saturdayFound && sundayFound) break; // Found both
        d.setDate(d.getDate() + 1);
    }

    // Ensure Saturday appears before Sunday if both are found
    upcomingDates.sort((a, b) => new Date(a.value).getTime() - new Date(b.value).getTime());

    return upcomingDates;
};


const timeSlots = [
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
    "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM",
    "08:00 PM"
];

const COLORS = {
    PRIMARY: "#2BC4B0",
    ACCENT_PURPLE: "#D8BFD8",
    TEXT_DARK: "#333333",
    TEXT_MEDIUM: "#6B7280",
    TEXT_LIGHT: "#A0AEC0",
    WHITE: "#FFFFFF",
    STAR_YELLOW: "#FFC107",
    BORDER_LIGHT: "#E2E8F0",
};

export default function DocAppointment() {
    const { doctorId } = useLocalSearchParams();
    const router = useRouter();

    const [doctorDetails, setDoctorDetails] = useState(null);
    const [loadingDoctor, setLoadingDoctor] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [selectedDateISO, setSelectedDateISO] = useState(null); // ISO string for selected date
    const [selectedTime, setSelectedTime] = useState(null); // String like "04:00 PM"
    const [showDatePicker, setShowDatePicker] = useState(false);

    const availableDates = getWeekendDatesForDisplay();

    useEffect(() => {
        const fetchDoctor = async () => {
            if (!doctorId) {
                Alert.alert("Error", "No doctor selected. Please go back and select a doctor.");
                setLoadingDoctor(false);
                return;
            }
            try {
                
                const docRef = doc(db, "doctors", doctorId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setDoctorDetails({ id: docSnap.id, ...docSnap.data() });
                } else {
                    Alert.alert("Error", "Doctor not found.");
                    router.back(); // Go back if doctor not found
                }
            } catch (error) {
                console.error("Error fetching doctor details:", error);
                Alert.alert("Error", "Failed to load doctor details. " + error.message);
            } finally {
                setLoadingDoctor(false);
            }
        };

        fetchDoctor();
    }, [doctorId]); // Depend on doctorId so it refetches if changed

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || new Date(selectedDateISO || new Date());
        setShowDatePicker(Platform.OS === 'ios'); // On iOS, picker stays open, on Android, it closes

        if (selectedDate) {
            const dayOfWeek = currentDate.getDay();
            // 0 for Sunday, 6 for Saturday
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                setSelectedDateISO(currentDate.toISOString());
            } else {
                Alert.alert("Invalid Date", "Please select a Saturday or Sunday for the appointment.");
                setSelectedDateISO(null); // Clear invalid selection
            }
        }
    };

    const handleMakeAppointment = async () => {
        if (!selectedDateISO || !selectedTime) {
            Alert.alert("Missing Information", "Please select both a date and a time for your appointment.");
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Authentication Required", "You must be logged in to book an appointment.");
            router.replace('/login');
            return;
        }

        setIsBooking(true);

        try {
            // 1. Fetch custom header and footer from settings
            const settingsDocRef = doc(db, "settings", "customContent"); // Assuming one doc with ID 'customContent'
            const settingsDocSnap = await getDoc(settingsDocRef);
            const settingsData = settingsDocSnap.exists() ? settingsDocSnap.data() : {};
            const customHeader = settingsData.heder || "Your Appointment is Confirmed!"; // Corrected to 'heder'
            const customFooter = settingsData.footer || "Thank you for choosing our service.";
            const demoZoomLink = "https://zoom.us/j/1234567890"; // Placeholder Zoom link

            // 2. Save the appointment
            const appointmentDate = new Date(selectedDateISO);
            const appointmentData = {
                doctorId: doctorDetails.id,
                doctorName: doctorDetails.name,
                doctorSpecialty: doctorDetails.specialty,
                userId: user.uid,
                userEmail: user.email,
                appointmentDate: appointmentDate,
                appointmentTime: selectedTime,
                status: "pending",
                createdAt: serverTimestamp(),
            };
            const appointmentsCollectionRef = collection(db, "appointments");
            const appointmentDocRef = await addDoc(appointmentsCollectionRef, appointmentData);
            const bookingNumber = appointmentDocRef.id;

            // 3. Create and save the private notification with improved formatting
            const notificationMessage = `
${customHeader}
---
Hello ${user.displayName || user.email},

Your consultation with **Dr. ${doctorDetails.name}** has been successfully scheduled.

**Appointment Details:**
- **Date:** ${appointmentDate.toLocaleDateString('en-LK')}
- **Time:** ${selectedTime}
- **Booking Number:** ${bookingNumber}

**How to Join:**
You can join your virtual consultation using the link below:
${demoZoomLink}

---
${customFooter}
            `;

            const userNotificationsRef = collection(db, "users", user.uid, "notifications");
            await addDoc(userNotificationsRef, {
                title: "Appointment Confirmed!", // More engaging title
                message: notificationMessage,
                read: false,
                createdAt: serverTimestamp(),
            });

            // 4. Show a simple confirmation alert
            Alert.alert(
                "Success!",
                "Your appointment has been booked. Please check your notifications for the full details.",
                [
                    {
                        text: "OK",
                        onPress: () => router.replace('/screen/mainLanding')
                    }
                ]
            );

        } catch (error) {
            console.error("Error making appointment:", error);
            Alert.alert("Booking Failed", "Something went wrong. Please check your internet and try again. " + error.message);
        } finally {
            setIsBooking(false);
        }
    };


    if (loadingDoctor) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                <Text style={{ marginTop: 10, color: COLORS.TEXT_MEDIUM }}>Loading Doctor Details...</Text>
            </SafeAreaView>
        );
    }

    if (!doctorDetails) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Text style={{ color: COLORS.TEXT_DARK }}>Doctor details could not be loaded or doctor not found.</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButtonIcon}>
                        <Feather name="arrow-left" size={24} color={COLORS.WHITE} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Book Appointment</Text>
                </View>

                {/* Doctor's Card Section */}
                <View style={styles.doctorCard}>
                    <Image source={{ uri: doctorDetails.image }} style={styles.doctorImage} />
                    <Text style={styles.doctorName}>{doctorDetails.name}</Text>
                    <Text style={styles.doctorSpecialty}>{doctorDetails.specialty}</Text>
                    {doctorDetails.bio && <Text style={styles.doctorBio}>{doctorDetails.bio}</Text>}
                    <View style={styles.ratingContainer}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Feather
                                key={i}
                                name="star"
                                size={18}
                                color={i < Math.floor(doctorDetails.rating || 0) ? COLORS.STAR_YELLOW : COLORS.BORDER_LIGHT}
                                style={styles.starIcon}
                            />
                        ))}
                    </View>
                </View>

                {/* Appointment Selection Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Appointment Date (Weekend Only)</Text>
                    <Picker
                        selectedValue={selectedDateISO}
                        onValueChange={(itemValue, itemIndex) => {
                            if (itemValue) {
                                setSelectedDateISO(itemValue);
                            } else {
                                setSelectedDateISO(null);
                            }
                        }}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                    >
                        <Picker.Item label="-- Choose a Weekend Date --" value={null} />
                        {availableDates.map((dateObj) => (
                            <Picker.Item key={dateObj.value} label={dateObj.label} value={dateObj.value} />
                        ))}
                    </Picker>

                    {/* Optional: If you prefer a native date picker over Picker for dates, you can use this */}
                    {/*
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                        <Text style={styles.datePickerButtonText}>
                            {selectedDateISO ? new Date(selectedDateISO).toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "Tap to Select Date"}
                        </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={selectedDateISO ? new Date(selectedDateISO) : new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'} // Use 'spinner' for iOS for better UX
                            onChange={handleDateChange}
                            minimumDate={new Date()} // Can't pick past dates
                        />
                    )}
                    */}
                </View>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Appointment Time (4:00 PM - 8:00 PM)</Text>
                    <Picker
                        selectedValue={selectedTime}
                        onValueChange={(itemValue, itemIndex) => setSelectedTime(itemValue)}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                    >
                        <Picker.Item label="-- Select Time --" value={null} />
                        {timeSlots.map((time, index) => (
                            <Picker.Item key={index} label={time} value={time} />
                        ))}
                    </Picker>
                </View>

                {/* "Make Consultation" button */}
                <TouchableOpacity
                    style={[styles.makeAppointmentButton, (!selectedDateISO || !selectedTime || isBooking) && styles.disabledButton]}
                    onPress={handleMakeAppointment}
                    disabled={!selectedDateISO || !selectedTime || isBooking}
                >
                    {isBooking ? (
                        <ActivityIndicator color={COLORS.WHITE} />
                    ) : (
                        <Text style={styles.makeAppointmentButtonText}>Make Consultation</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.WHITE,
    },
    scrollViewContent: {
        paddingBottom: 20, // Add some padding at the bottom
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.WHITE,
    },
    header: {
        backgroundColor: COLORS.PRIMARY,
        paddingHorizontal: 20,
        height: Platform.OS === 'android' ? 60 : 90,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: Platform.OS === "android" ? 0 : 30,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
    backButtonIcon: {
        position: 'absolute',
        left: 20,
        top: Platform.OS === 'android' ? 20 : 50,
        zIndex: 1,
    },
    headerTitle: {
        color: COLORS.WHITE,
        fontSize: 22,
        fontWeight: "700",
    },
    doctorCard: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 15,
        marginHorizontal: 20,
        marginTop: 20,
        padding: 20,
        flexDirection: "column",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 6,
        borderWidth: 1,
        borderColor: COLORS.BORDER_LIGHT,
    },
    doctorImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 15,
        borderWidth: 3,
        borderColor: COLORS.PRIMARY,
    },
    doctorName: {
        fontSize: 24,
        fontWeight: "bold",
        color: COLORS.TEXT_DARK,
        textAlign: "center",
        marginBottom: 5,
    },
    doctorSpecialty: {
        fontSize: 18,
        color: COLORS.TEXT_MEDIUM,
        textAlign: "center",
        marginBottom: 10,
    },
    doctorBio: {
        fontSize: 15,
        color: COLORS.TEXT_DARK,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 15,
    },
    ratingContainer: {
        flexDirection: "row",
        marginBottom: 15,
    },
    starIcon: {
        marginHorizontal: 2,
    },
    section: {
        marginHorizontal: 20,
        marginTop: 25,
        padding: 15,
        backgroundColor: COLORS.WHITE,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.BORDER_LIGHT,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: COLORS.TEXT_DARK,
        marginBottom: 10,
    },
    datePickerButton: {
        backgroundColor: COLORS.ACCENT_PURPLE,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    datePickerButtonText: {
        fontSize: 16,
        color: COLORS.TEXT_DARK,
        fontWeight: '500',
    },
    picker: {
        height: 150, // Adjust height as needed
        width: '100%',
        // backgroundColor: COLORS.BORDER_LIGHT, // Optional background
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.BORDER_LIGHT,
    },
    pickerItem: {
        fontSize: 16,
        color: COLORS.TEXT_DARK,
    },
    makeAppointmentButton: {
        backgroundColor: COLORS.PRIMARY,
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 30,
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 30,
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    makeAppointmentButtonText: {
        color: COLORS.WHITE,
        fontWeight: "700",
        fontSize: 18,
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    disabledButton: {
        backgroundColor: COLORS.TEXT_LIGHT, // Gray out when disabled
        opacity: 0.7,
        shadowOpacity: 0, // No shadow when disabled
        elevation: 0,
    },
    backButton: { // For the "Doctor not found" screen
        marginTop: 20,
        backgroundColor: COLORS.PRIMARY,
        padding: 10,
        borderRadius: 5,
    },
    backButtonText: {
        color: COLORS.WHITE,
    }
});