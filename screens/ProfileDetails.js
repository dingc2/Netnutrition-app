import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { DB_DOMAIN } from '@env';

const ProfileDetails = ({ navigation }) => {
    const domain = DB_DOMAIN;
    const generateUniqueKey = (item) => {
        // Create a unique key using multiple properties
        return `${item.food_id}-${item.dining_hall}-${Date.now()}`;
    };

    const [mealPlanItems, setMealPlanItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
                fetchMealPlanItems(user.uid);
            } else {
                navigation.replace('Login');
            }
        });

        return () => unsubscribe();
    }, []);

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


const fetchMealPlanItems = async (userId) => {
    try {
        const response = await fetch(`http://${domain}:3000/meal-planner/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch meal plan');
        
        const data = await response.json();
        
        // Sanitize and format the data
        const formattedData = data.map(item => ({
            meal_plan_id: item.meal_plan_id?.toString() || Math.random().toString(),
            food_id: item.food_id?.toString() || '',
            food_name: item.food_name?.toString() || 'Unnamed Item',
            dining_hall: item.dining_hall?.toString() || '',
            calories: item.calories ? Number(item.calories) : null,
            serving_size: item.serving_size?.toString() || '',
            is_vegetarian: Boolean(item.is_vegetarian),
            is_vegan: Boolean(item.is_vegan),
        }));

        setMealPlanItems(formattedData);
    } catch (error) {
        console.error('Error fetching meal plan:', error);
        Alert.alert('Error', 'Failed to load meal plan');
        setMealPlanItems([]); // Set empty array on error
    } finally {
        setLoading(false);
    }
};

const removeMealPlanItem = async (item) => {
    try {
        const domain = DB_DOMAIN;
        const response = await fetch(
            `http://${domain}:3000/meal-planner/${user.uid}/${item.food_id?.toString()}`,
            { method: 'DELETE' }
        );
        
        if (!response.ok) throw new Error('Failed to remove item');
        
        setMealPlanItems(prev => prev.filter(i => i.food_id !== item.food_id));
    } catch (error) {
        console.error('Error removing item:', error);
        Alert.alert('Error', 'Failed to remove item from meal plan');
    }
};

const renderMealPlanItem = ({ item }) => {
    // Format the details safely
    const details = [
        item.dining_hall,
        item.calories ? `${item.calories} cal` : null,
        item.serving_size
    ].filter(Boolean).join(' • ');

    return (
        <View style={styles.mealPlanItem}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                    {item.food_name}
                </Text>
                {details ? (
                    <Text style={styles.itemDetails} numberOfLines={1}>
                        {details}
                    </Text>
                ) : null}
                <View style={styles.tagsContainer}>
                    {item.is_vegetarian && (
                        <Text style={styles.dietaryTag}>Vegetarian</Text>
                    )}
                    {item.is_vegan && (
                        <Text style={styles.dietaryTag}>Vegan</Text>
                    )}
                </View>
            </View>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => {
                    Alert.alert(
                        'Remove Item',
                        'Are you sure you want to remove this item from your meal plan?',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                                text: 'Remove', 
                                onPress: () => removeMealPlanItem(item), 
                                style: 'destructive' 
                            }
                        ]
                    );
                }}
            >
                <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
        </View>
    );
};

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

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
                        <Text style={styles.label}>Email: </Text>
                        <Text style={styles.info}>{user?.email || 'Not available'}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Meal Planner</Text>
                <FlatList
                    data={mealPlanItems}
                    keyExtractor={(item) => `meal-plan-${item.meal_plan_id}`}
                    renderItem={renderMealPlanItem}
                    ListEmptyComponent={
                        <Text style={styles.emptyMessage}>
                        No items in your meal planner. Add items from the menu!
                        </Text>
                 }
                />
            </View>
        </View>
    );
};

const newStyles = {
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    profileInfo: {
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 20,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    email: {
        fontSize: 16,
        color: '#666',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 15,
        paddingHorizontal: 15,
    },
    mealPlanItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        marginHorizontal: 15,
        marginBottom: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    itemInfo: {
        flex: 1,
        marginRight: 10,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemDetails: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
        marginTop: 4,
    },
    dietaryTag: {
        fontSize: 12,
        color: '#4CAF50',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    removeButton: {
        backgroundColor: '#FF5722',
        padding: 8,
        borderRadius: 5,
        minWidth: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
};

const styles = StyleSheet.create({
    ...StyleSheet.create(newStyles),
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
