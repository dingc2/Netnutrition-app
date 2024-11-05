import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { DB_DOMAIN } from '@env';

const HoursScreen = ({ route }) => {
    const { hallId, hallName } = route.params;
    const [hours, setHours] = useState([]);
    const domain = DB_Domain;
    const url = "http://" + domain + ":3000/dining-halls/${hallId}/hours";

    useEffect(() => {
        fetchHours();
    }, []);

    // Helper function to convert 24-hour time to 12-hour format
    const convertTo12HourFormat = (time) => {
        let [hour, minute] = time.split(':');
        hour = parseInt(hour);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12; 
        return `${hour}:${minute} ${ampm}`;
    };

    const fetchHours = async () => {
        try {
            const response = await fetch(url);
            const data = await response.json();

            // Map meal_type_id to meal names
            const mealTypeMap = {
                1: 'breakfast',
                2: 'lunch',
                3: 'dinner'
            };

            // Group hours by day of the week
            const groupedHours = data.reduce((acc, curr) => {
                if (!acc[curr.day_of_week]) {
                    acc[curr.day_of_week] = { breakfast: '', lunch: '', dinner: '' };
                }
                const timeRange = `${convertTo12HourFormat(curr.opening_time)} - ${convertTo12HourFormat(curr.closing_time)}`;
                const mealName = mealTypeMap[curr.meal_type_id];
                if (mealName) {
                    acc[curr.day_of_week][mealName] = timeRange;
                }
                return acc;
            }, {});

            // Convert object to array for FlatList
            const formattedHours = Object.entries(groupedHours).map(([day, times]) => ({
                day,
                ...times
            }));
            setHours(formattedHours);
        } catch (error) {
            console.error('Error fetching hours:', error);
        }
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
            <FlatList
                data={hours}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderDayItem}
            />
        </View>
    );
};

const styles = StyleSheet.create({
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
