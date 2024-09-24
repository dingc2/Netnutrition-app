import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProfileDetails = ({ route }) => {
    const { name, email } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <View style={styles.infoContainer}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.info}>{name}</Text>

                <Text style={styles.label}>Email:</Text>
                <Text style={styles.info}>{email}</Text>
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
    infoContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    info: {
        fontSize: 16,
        marginBottom: 10,
    },
});

export default ProfileDetails;
