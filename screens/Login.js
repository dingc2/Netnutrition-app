import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

const SignInScreen = ({ navigation, route }) => {
    const { name } = route.params || {};

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // Basic form validation
        if (!email || !password) {
            Alert.alert('Error', 'Please fill out all fields.');
            return;
        }

        // Navigate to profile after successful login
        navigation.navigate('ProfileDetails', { name: name || 'User', email });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Log In</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
            />
            <Button title="Log In" onPress={handleLogin} />
            <Text style={styles.registerPrompt}>
                Don't have an account? <Text onPress={() => navigation.navigate('Registration')} style={styles.link}>Register here</Text>
            </Text>
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
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    registerPrompt: {
        marginTop: 20,
    },
    link: {
        color: 'blue',
    },
});

export default SignInScreen;
