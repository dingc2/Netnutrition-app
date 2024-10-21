import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';

const MenuScreen = ({ route }) => {
    const { hallId, hallName } = route.params;
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [mealTypes, setMealTypes] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [filteredMenuItems, setFilteredMenuItems] = useState([]);
    const [selectedItemNutrition, setSelectedItemNutrition] = useState(null);
    const [isNutritionModalVisible, setIsNutritionModalVisible] = useState(false);
    const [favoriteIndicatorVisible, setFavoriteIndicatorVisible] = useState(false);
    const [selectedDietaryFilter, setSelectedDietaryFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    const dietaryFilters = [
        { id: 'all', label: 'All' },
        { id: 'vegan', label: 'Vegan' },
        { id: 'vegetarian', label: 'Vegetarian' },
        { id: 'gluten-free', label: 'Gluten-Free' },
        { id: 'halal', label: 'Halal' },
        { id: 'kosher', label: 'Kosher' }
    ];

    useEffect(() => {
        fetchMealTypes();
        const today = new Date().getDay();
        setSelectedDay(daysOfWeek[today === 0 ? 6 : today - 1]);
    }, []);

    useEffect(() => {
        filterMenuItems();
    }, [menuItems, selectedDietaryFilter]);

    const filterMenuItems = () => {
        if (!selectedDietaryFilter || selectedDietaryFilter === 'all') {
            setFilteredMenuItems(menuItems);
            return;
        }

        const filtered = menuItems.filter(item => {
            const dietaryInfo = (item.dietary_info || '').toLowerCase();
            return dietaryInfo.includes(selectedDietaryFilter.toLowerCase());
        });
        
        setFilteredMenuItems(filtered);
    };

    const fetchMealTypes = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch('http://localhost:3000/meal-types');
            if (!response.ok) throw new Error('Failed to fetch meal types');
            const data = await response.json();
            setMealTypes(data);
        } catch (error) {
            console.error('Error fetching meal types:', error);
            setError('Failed to load meal types. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMenuForMeal = async (mealTypeId, day) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(
                `http://localhost:3000/dining-halls/${hallId}/menu/${mealTypeId}/${day}`
            );
            if (!response.ok) throw new Error('Failed to fetch menu items');
            const data = await response.json();
            setMenuItems(data);
            setSelectedMeal(mealTypeId);
        } catch (error) {
            console.error('Error fetching menu:', error);
            setError('Failed to load menu items. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchNutritionalInfo = async (itemId) => {
        try {
            setIsLoading(true);
            const response = await fetch(
                `http://localhost:3000/menu-items/${itemId}/nutrition`
            );
            if (!response.ok) throw new Error('Failed to fetch nutritional info');
            const data = await response.json();
            setSelectedItemNutrition(data);
            setIsNutritionModalVisible(true);
        } catch (error) {
            console.error('Error fetching nutritional info:', error);
            setError('Failed to load nutritional information. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToFavorites = (item) => {
        // Implement the logic for adding the item to favorites
        console.log(`${item.item_name} added to favorites!`);
        setFavoriteIndicatorVisible(true);
        setTimeout(() => {
            setFavoriteIndicatorVisible(false);
        }, 2000);
    };

    const renderDaySelector = () => (
        <FlatList
            horizontal
            data={daysOfWeek}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={[
                        styles.dayButton,
                        selectedDay === item && styles.selectedDay
                    ]}
                    onPress={() => {
                        setSelectedDay(item);
                        if (selectedMeal) {
                            fetchMenuForMeal(selectedMeal, item);
                        }
                    }}
                >
                    <Text style={[
                        styles.dayButtonText,
                        selectedDay === item && styles.selectedDayText
                    ]}>
                        {item.substring(0, 3)}
                    </Text>
                </TouchableOpacity>
            )}
            style={styles.daySelector}
            showsHorizontalScrollIndicator={false}
        />
    );

    const renderDietaryFilters = () => (
        <View style={styles.dietaryFiltersContainer}>
            <FlatList
                horizontal
                data={dietaryFilters}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.dietaryFilterButton,
                            selectedDietaryFilter === item.id && styles.selectedDietaryFilter
                        ]}
                        onPress={() => setSelectedDietaryFilter(item.id)}
                    >
                        <Text style={[
                            styles.dietaryFilterText,
                            selectedDietaryFilter === item.id && styles.selectedDietaryFilterText
                        ]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );

    const renderNutritionModal = () => (
        <Modal
            visible={isNutritionModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setIsNutritionModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Nutritional Information</Text>
                    {selectedItemNutrition && (
                        <>
                            <Text style={styles.nutritionItem}>
                                Item: {selectedItemNutrition.item_name}
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Serving Size: {selectedItemNutrition.serving_size}
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Calories: {selectedItemNutrition.calories}
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Protein: {selectedItemNutrition.protein_g}g
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Carbohydrates: {selectedItemNutrition.carbohydrates_g}g
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Fat: {selectedItemNutrition.fat_g}g
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Fiber: {selectedItemNutrition.fiber_g}g
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Sodium: {selectedItemNutrition.sodium_mg}mg
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Allergens: {selectedItemNutrition.allergens}
                            </Text>
                        </>
                    )}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setIsNutritionModalVisible(false)}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => {
                        fetchMealTypes();
                        if (selectedMeal && selectedDay) {
                            fetchMenuForMeal(selectedMeal, selectedDay);
                        }
                    }}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{hallName} Menu</Text>
            {renderDaySelector()}
            <View style={styles.mealTypeContainer}>
                {mealTypes.map((mealType) => (
                    <TouchableOpacity
                        key={mealType.id}
                        style={[
                            styles.mealTypeButton,
                            selectedMeal === mealType.id && styles.selectedMealType
                        ]}
                        onPress={() => fetchMenuForMeal(mealType.id, selectedDay)}
                    >
                        <Text style={[
                            styles.mealTypeText,
                            selectedMeal === mealType.id && styles.selectedMealTypeText
                        ]}>
                            {mealType.meal_name.charAt(0).toUpperCase() + mealType.meal_name.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {renderDietaryFilters()}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <FlatList
                    data={filteredMenuItems}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.menuItem}>
                            <Text style={styles.itemName}>{item.item_name}</Text>
                            <Text style={styles.dietaryInfo}>{item.dietary_info}</Text>
                            <TouchableOpacity
                                style={styles.nutritionButton}
                                onPress={() => fetchNutritionalInfo(item.id)}
                            >
                                <Text style={styles.nutritionButtonText}>
                                    View Nutritional Info
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.favoriteButton}
                                onPress={() => handleAddToFavorites(item)}
                            >
                                <Text style={styles.favoriteButtonText}>Add to Meal Planner</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.emptyMessage}>
                            No items available for the selected filters
                        </Text>
                    }
                />
            )}
            {renderNutritionModal()}
            {favoriteIndicatorVisible && (
                <View style={styles.favoriteIndicator}>
                    <Text style={styles.favoriteIndicatorText}>Added to Meal Planner!</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    daySelector: {
        marginBottom: 15,
    },
    dayButton: {
        padding: 10,
        marginHorizontal: 5,
        borderRadius: 8,
        backgroundColor: '#eee',
        minWidth: 60,
        alignItems: 'center',
    },
    selectedDay: {
        backgroundColor: '#4CAF50',
    },
    dayButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    selectedDayText: {
        color: 'white',
    },
    mealTypeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    mealTypeButton: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#eee',
        minWidth: 100,
        alignItems: 'center',
    },
    selectedMealType: {
        backgroundColor: '#4CAF50',
    },
    mealTypeText: {
        fontSize: 16,
        fontWeight: '600',
    },
    selectedMealTypeText: {
        color: 'white',
    },
    menuItem: {
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    dietaryInfo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    nutritionButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 5,
    },
    nutritionButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    favoriteButton: {
        backgroundColor: '#FFCC00',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    favoriteButtonText: {
        color: 'black',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyMessage: {
        textAlign: 'center',
        fontSize: 16,
        color: '#999',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    nutritionItem: {
        fontSize: 16,
        marginVertical: 5,
    },
    closeButton: {
        marginTop: 15,
        backgroundColor: '#FF5722',
        padding: 10,
        borderRadius: 6,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    favoriteIndicator: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        zIndex: 1,
    },
    favoriteIndicatorText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    dietaryFiltersContainer: {
        marginBottom: 15,
    },
    dietaryFilterButton: {
        padding: 8,
        marginHorizontal: 5,
        borderRadius: 8,
        backgroundColor: '#eee',
        minWidth: 80,
        alignItems: 'center',
    },
    selectedDietaryFilter: {
        backgroundColor: '#4CAF50',
    },
    dietaryFilterText: {
        fontSize: 14,
        fontWeight: '500',
    },
    selectedDietaryFilterText: {
        color: 'white',
    },
});

export default MenuScreen;
