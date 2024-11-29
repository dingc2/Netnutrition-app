import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { DB_DOMAIN } from '@env';
import CustomBottomNav from '../navigation/CustomButtonNav';

const ProfileDetails = ({ navigation }) => {
    const domain = DB_DOMAIN;
    const generateUniqueKey = (item) => {
        // Create a unique key using multiple properties
        return `${item.food_id}-${item.dining_hall}-${Date.now()}`;
    };

    const [mealPlanItems, setMealPlanItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [totalNutrition, setTotalNutrition] = useState({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
    });

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

    useEffect(() => {
        // Calculate total nutrition whenever meal plan items change
        const totals = mealPlanItems.reduce((acc, item) => ({
            calories: acc.calories + (parseFloat(item.calories) || 0),
            protein: acc.protein + (parseFloat(item.protein) || 0),
            carbs: acc.carbs + (parseFloat(item.carbohydrates) || 0),
            fat: acc.fat + (parseFloat(item.fat) || 0),
            sodium: acc.sodium + (parseFloat(item.sodium) || 0),
            dietaryFiber: acc.dietaryFiber + (parseFloat(item.dietary_fiber) || 0)
        }), {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            sodium: 0,
            dietaryFiber: 0
        });
        setTotalNutrition(totals);
    }, [mealPlanItems]);

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
            const formattedData = data.map(item => {
                // Convert servings to number and default to 1 if not present
                const servings = Number(item.servings) || 1;
                
                return {
                    meal_plan_id: item.meal_plan_id?.toString() || Math.random().toString(),
                    food_id: item.food_id?.toString() || '',
                    food_name: item.food_name?.toString() || 'Unnamed Item',
                    dining_hall: item.dining_hall?.toString() || '',
                    servings: servings,
                    serving_size: item.serving_size?.toString() || '',
                    is_vegetarian: Boolean(item.is_vegetarian),
                    is_vegan: Boolean(item.is_vegan),
                    // Scale all nutritional values by number of servings
                    calories: item.calories ? Math.round(Number(item.calories) * servings) : 0,
                    protein: item.protein ? Math.round(Number(item.protein) * servings) : 0,
                    carbohydrates: item.carbohydrates ? Math.round(Number(item.carbohydrates) * servings) : 0,
                    fat: item.fat ? Math.round(Number(item.fat) * servings) : 0,
                    sodium: item.sodium ? Math.round(Number(item.sodium) * servings) : 0,
                    dietary_fiber: item.dietary_fiber ? Math.round(Number(item.dietary_fiber) * servings) : 0
                };
            });
    
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
    const details = [
        item.dining_hall,
        item.calories ? `${item.calories} cal` : null,
        `${item.servings} serving${item.servings !== 1 ? 's' : ''}`,
        item.serving_size
    ].filter(Boolean).join(' • ');

    return (
        <View style={styles.mealPlanItem}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                    {item.food_name}
                </Text>
                <Text style={styles.itemDetails} numberOfLines={1}>
                    {details}
                </Text>
                <View style={styles.nutritionInfo}>
                    <Text style={styles.nutritionText}>
                        P: {item.protein}g • C: {item.carbohydrates}g • F: {item.fat}g
                    </Text>
                </View>
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
            <View style={styles.contentContainer}>
                {/* Profile Information */}
                <Text style={styles.title}>Profile</Text>
                <View style={styles.infoContainer}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Email: </Text>
                        <Text style={styles.info}>{user?.email || 'Not available'}</Text>
                    </View>
                </View>
     
                {/* Nutritional Summary */}
                <View style={styles.totalNutrition}>
                    <Text style={styles.totalNutritionTitle}>Daily Totals</Text>
                    <View style={styles.nutritionGrid}>
                        <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionValue}>
                                {totalNutrition.calories}
                            </Text>
                            <Text style={styles.nutritionLabel}>Calories</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionValue}>
                                {totalNutrition.protein}g
                            </Text>
                            <Text style={styles.nutritionLabel}>Protein</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionValue}>
                                {totalNutrition.carbs}g
                            </Text>
                            <Text style={styles.nutritionLabel}>Carbs</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionValue}>
                                {totalNutrition.fat}g
                            </Text>
                            <Text style={styles.nutritionLabel}>Fat</Text>
                        </View>
                    </View>
                </View>
     
                {/* Meal Planner Section */}
                <Text style={styles.sectionTitle}>Meal Planner</Text>
                
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                    </View>
                ) : (
                    <FlatList
                        data={mealPlanItems}
                        keyExtractor={(item) => `meal-plan-${item.meal_plan_id}`}
                        renderItem={({ item }) => (
                            <View style={styles.mealPlanItem}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName} numberOfLines={2}>
                                        {item.food_name}
                                    </Text>
                                    
                                    <Text style={styles.itemDetails} numberOfLines={1}>
                                        {[
                                            item.dining_hall,
                                            `${item.servings} serving${item.servings !== 1 ? 's' : ''}`,
                                            item.serving_size
                                        ].filter(Boolean).join(' • ')}
                                    </Text>
     
                                    <View style={styles.itemNutrition}>
                                        <Text style={styles.nutritionPrimary}>
                                            {item.calories} calories
                                        </Text>
                                    </View>
     
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
                        )}
                        ListEmptyComponent={
                            <Text style={styles.emptyMessage}>
                                No items in your meal planner. Add items from the menu!
                            </Text>
                        }
                    />
                )}
            </View>
     
            <CustomBottomNav navigation={navigation} currentScreen="ProfileDetails" />
     
            <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </View>
     );
};

const newStyles = {
    contentContainer: {
        flex: 1,
        paddingBottom: 60,
    },
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
    totalNutrition: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    totalNutritionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    nutritionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    nutritionItem: {
        alignItems: 'center',
    },
    nutritionValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    nutritionLabel: {
        fontSize: 14,
        color: '#666',
    },
    nutritionInfo: {
        marginVertical: 4,
    },
    nutritionText: {
        fontSize: 14,
        color: '#666',
    },
});

export default ProfileDetails;
