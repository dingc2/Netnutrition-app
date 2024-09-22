// screens/HoursScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HoursScreen = ({ route }) => {
    const { hallName, hours } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{hallName} - Hours</Text>
            <View style={styles.hoursContainer}>
                {hours.map((hour, index) => (
                    <Text key={index} style={styles.hour}>
                        {hour.day}: {hour.open} - {hour.close}
                    </Text>
                ))}
            </View>
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
    hoursContainer: {
        padding: 10,
        backgroundColor: '#ddd',
        borderRadius: 5,
    },
    hour: {
        fontSize: 16,
        marginBottom: 10,
    },
});

export default HoursScreen;
