import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { DB_DOMAIN } from '@env';
import CustomBottomNav from '../navigation/CustomButtonNav';

const HoursScreen = ({ navigation, route }) => {
    const { hallName } = route.params;
    const [hours, setHours] = useState([]);
    const domain = DB_DOMAIN;
    // const url = "http://" + domain + ":3000/dining-halls/${hallId}/hours";

    useEffect(() => {
        fetchHours();
    }, []);

    const fetchHours = async () => {
        try {
            const response = await fetch(`http://${domain}:3000/dining-halls/${hallName}/hours`);
            const data = await response.json();

            // Format the hours data
            const formattedHours = data.map(dayData => ({
                day: dayData.day,
                breakfast: dayData.meals.breakfast 
                    ? `${formatTime(dayData.meals.breakfast.open)} - ${formatTime(dayData.meals.breakfast.close)}`
                    : 'Closed',
                lunch: dayData.meals.lunch
                    ? `${formatTime(dayData.meals.lunch.open)} - ${formatTime(dayData.meals.lunch.close)}`
                    : 'Closed',
                dinner: dayData.meals.dinner
                    ? `${formatTime(dayData.meals.dinner.open)} - ${formatTime(dayData.meals.dinner.close)}`
                    : 'Closed'
            }));

            setHours(formattedHours);
        } catch (error) {
            console.error('Error fetching hours:', error);
        }
    };

    const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const adjustedHour = hour % 12 || 12;
        return `${adjustedHour}:${minutes} ${ampm}`;
    };

    const renderDayItem = ({ item }) => (
        <View style={styles.dayItem}>
            <Text style={styles.day}>{item.day}</Text>
            <Text style={styles.mealType}>Breakfast: {item.breakfast}</Text>
            <Text style={styles.mealType}>Lunch: {item.lunch}</Text>
            <Text style={styles.mealType}>Dinner: {item.dinner}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{hallName} - Hours</Text>
            <View style={styles.contentContainer}>
                <FlatList
                    data={hours}
                    keyExtractor={(item) => item.day}
                    renderItem={renderDayItem}
                />
            </View>
            <CustomBottomNav navigation={navigation} currentScreen="HoursScreen" />
        </View>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        paddingBottom: 60,
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    dayItem: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#ddd',
        borderRadius: 5,
    },
    day: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    mealType: {
        fontSize: 16,
        color: '#555',
    },
});

export default HoursScreen;
