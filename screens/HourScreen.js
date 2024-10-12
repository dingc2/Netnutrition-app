import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const HoursScreen = ({ route }) => {
    const { hallId, hallName } = route.params;
    const [hours, setHours] = useState([]);

    useEffect(() => {
        fetchHours();
    }, []);

    const fetchHours = async () => {
        try {
            const response = await fetch(`http://localhost:3000/dining-halls/${hallId}/hours`);
            const data = await response.json();
            setHours(data);
        } catch (error) {
            console.error('Error fetching hours:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{hallName} - Hours</Text>
            <FlatList
                data={hours}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.hourItem}>
                        <Text style={styles.day}>{item.day_of_week}</Text>
                        <Text style={styles.time}>{item.opening_time} - {item.closing_time}</Text>
                    </View>
                )}
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
    hourItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#ddd',
        borderRadius: 5,
        marginBottom: 10,
    },
    day: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    time: {
        fontSize: 16,
    },
});

export default HoursScreen;