import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const ProfileScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Please Login or Register</Text>
            <Button
                title="Login"
                onPress={() => navigation.navigate('Login')}
            />
            <Button
                title="Register"
                onPress={() => navigation.navigate('Registration')}
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
});

export default ProfileScreen;
