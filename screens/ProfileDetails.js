import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, FlatList, TouchableOpacity } from 'react-native';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const ProfileDetails = ({ route, navigation }) => {
    const { name, email, favoriteItems } = route.params; // Expecting favoriteItems to be passed from the previous screen
    const [favorites, setFavorites] = useState(favoriteItems || []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigation.reset({
                index: 0,
                routes: [{ name: 'DiningHalls' }],
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to log out. Please try again.');
        }
    };

    const navigateToDiningHalls = () => {
        navigation.navigate('DiningHalls');
    };

    const removeFavorite = (itemToRemove) => {
        setFavorites((prevFavorites) =>
            prevFavorites.filter((item) => item.id !== itemToRemove.id)
        );
    };

    const renderFavoriteItem = ({ item }) => (
        <View style={styles.favoriteItem}>
            <Text style={styles.favoriteText}>{item.name}</Text>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFavorite(item)}
            >
                <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.diningHallsButton}
                onPress={navigateToDiningHalls}
            >
                <Text style={styles.diningHallsButtonText}>View Dining Halls</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            <View style={styles.contentContainer}>
                <Text style={styles.title}>Profile</Text>
                <View style={styles.infoContainer}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Name: </Text>
                        <Text style={styles.info}>{name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Email: </Text>
                        <Text style={styles.info}>{email}</Text>
                    </View>
                </View>

                <Text style={styles.favoriteTitle}>Meal Planner</Text>
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderFavoriteItem}
                    ListEmptyComponent={<Text style={styles.emptyMessage}>No Items in Meal Planner.</Text>}
                />
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
    diningHallsButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
    },
    logoutButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: '#FF3B30',
        padding: 10,
        borderRadius: 5,
    },
    diningHallsButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    logoutButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    contentContainer: {
        marginTop: 80, 
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    infoContainer: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    info: {
        fontSize: 16,
    },
    favoriteTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    favoriteItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    favoriteText: {
        fontSize: 16,
    },
    removeButton: {
        backgroundColor: '#FF5722',
        padding: 5,
        borderRadius: 5,
    },
    emptyMessage: {
        textAlign: 'center',
        fontSize: 16,
        color: '#999',
    },
});

export default ProfileDetails;
