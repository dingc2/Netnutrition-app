import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, ScrollView, FlatList, TextInput, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { auth } from '../firebase';
import { DB_DOMAIN } from '@env';

const MenuScreen = ({ route }) => {
    const domain = DB_DOMAIN;
    const { hallName } = route.params;
    const [menuData, setMenuData] = useState({});
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [selectedItemNutrition, setSelectedItemNutrition] = useState(null);
    const [isNutritionModalVisible, setIsNutritionModalVisible] = useState(false);
    const [favoriteIndicatorVisible, setFavoriteIndicatorVisible] = useState(false);
    const [selectedDietaryFilter, setSelectedDietaryFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [categorizedMenuItems, setCategorizedMenuItems] = useState({});
    const [userId, setUserId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMenuItems, setFilteredMenuItems] = useState({});
    const [isServingSizeModalVisible, setIsServingSizeModalVisible] = useState(false);
    const [selectedServings, setSelectedServings] = useState('1');
    const [itemToAdd, setItemToAdd] = useState(null);


    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    const dietaryFilters = [
        { id: 'all', label: 'All' },
        { id: 'vegan', label: 'Vegan' },
        { id: 'vegetarian', label: 'Vegetarian' },
        { id: 'gluten-free', label: 'Gluten Free' }
    ];

    useEffect(() => {
        const today = new Date().getDay();
        const currentDay = daysOfWeek[today === 0 ? 6 : today - 1];
        setSelectedDay(currentDay);
        fetchMenuForDay(currentDay);
    }, []);

    useEffect(() => {
        if (menuData[selectedMeal]) {
            const filteredData = {};
            Object.entries(menuData[selectedMeal]).forEach(([category, items]) => {
                const filteredItems = items.filter(item => {
                    if (selectedDietaryFilter === 'all') return true;
                    switch (selectedDietaryFilter) {
                        case 'vegan':
                            return item.dietaryInfo.vegan;
                        case 'vegetarian':
                            return item.dietaryInfo.vegetarian;
                        case 'gluten-free':
                            return !item.dietaryInfo.containsGluten;
                        default:
                            return true;
                    }
                });
                if (filteredItems.length > 0) {
                    filteredData[category] = filteredItems;
                }
            });
            setCategorizedMenuItems(filteredData);
        } else {
            setCategorizedMenuItems({});
        }
    }, [menuData, selectedMeal, selectedDietaryFilter]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserId(user.uid);
            }
        });
    
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (menuData[selectedMeal]) {
            const filtered = {};
            Object.entries(menuData[selectedMeal]).forEach(([category, items]) => {
                // First apply dietary filter
                const dietaryFiltered = items.filter(item => {
                    if (selectedDietaryFilter === 'all') return true;
                    switch (selectedDietaryFilter) {
                        case 'vegan':
                            return item.dietaryInfo.vegan;
                        case 'vegetarian':
                            return item.dietaryInfo.vegetarian;
                        case 'gluten-free':
                            return !item.dietaryInfo.containsGluten;
                        default:
                            return true;
                    }
                });

                // Then apply search filter
                const searchFiltered = dietaryFiltered.filter(item =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (searchFiltered.length > 0) {
                    filtered[category] = searchFiltered;
                }
            });
            setCategorizedMenuItems(filtered);
        } else {
            setCategorizedMenuItems({});
        }
    }, [menuData, selectedMeal, selectedDietaryFilter, searchQuery]);

    const fetchMenuForDay = async (day) => {
        try {
            setIsLoading(true);
            setError(null);
            const date = formatDate(day);
            const response = await fetch(
                `http://${domain}:3000/dining-halls/${encodeURIComponent(hallName)}/menu?date=${date}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch menu');
            }

            const data = await response.json();
            setMenuData(data);
            if (!selectedMeal && Object.keys(data).length > 0) {
                setSelectedMeal(Object.keys(data)[0]);
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
            setError('Failed to load menu. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (day) => {
        const date = new Date();
        const currentDay = date.getDay();
        const targetDay = daysOfWeek.indexOf(day);
        const diff = targetDay - (currentDay === 0 ? 6 : currentDay - 1);
        date.setDate(date.getDate() + diff);
        return date.toISOString().split('T')[0];
    };

    const fetchNutritionalInfo = async (itemId) => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://${domain}:3000/menu-items/${itemId}/nutrition`);
            if (!response.ok) throw new Error('Failed to fetch nutritional info');
            const data = await response.json();
            setSelectedItemNutrition(data);
            setIsNutritionModalVisible(true);
        } catch (error) {
            console.error('Error fetching nutritional info:', error);
            setError('Failed to load nutritional information.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToFavorites = async (item) => {
        if (!userId) {
            Alert.alert(
                'Sign In Required',
                'Please sign in to use the meal planner feature.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Sign In', onPress: () => navigation.navigate('Login') }
                ]
            );
            return;
        }

        setItemToAdd(item);
        setSelectedServings('1');
        setIsServingSizeModalVisible(true);
    };

    const handleConfirmServings = async () => {
        const servings = parseFloat(selectedServings);
        if (isNaN(servings) || servings <= 0) {
            Alert.alert('Invalid Input', 'Please enter a valid number of servings.');
            return;
        }
    
        try {
            // First fetch the base nutritional info
            const nutritionInfo = await fetchNutritionalInfoForPlanner(itemToAdd.id);
            
            // Scale all nutritional values based on servings
            const scaledNutrition = {
                calories: Math.round(nutritionInfo.nutrients.calories * servings),
                protein: Math.round(nutritionInfo.nutrients.protein * servings),
                totalFat: Math.round(nutritionInfo.nutrients.fat * servings),
                totalCarbohydrates: Math.round(nutritionInfo.nutrients.carbohydrates * servings),
                sodium: Math.round(nutritionInfo.nutrients.sodium * servings),
                dietaryFiber: Math.round(nutritionInfo.nutrients.dietaryFiber * servings)
            };
    
            const response = await fetch(`http://${domain}:3000/meal-planner/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    foodId: itemToAdd.id,
                    diningHall: hallName,
                    servings: servings,
                    foodName: itemToAdd.name,
                    servingSize: nutritionInfo.servingSize,
                    isVegetarian: itemToAdd.dietaryInfo.vegetarian,
                    isVegan: itemToAdd.dietaryInfo.vegan,
                    // Send the scaled nutrition values
                    calories: scaledNutrition.calories,
                    protein: scaledNutrition.protein,
                    fat: scaledNutrition.totalFat,
                    carbohydrates: scaledNutrition.totalCarbohydrates,
                    sodium: scaledNutrition.sodium,
                    dietaryFiber: scaledNutrition.dietaryFiber
                }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to add item to meal planner');
            }
    
            setIsServingSizeModalVisible(false);
            setFavoriteIndicatorVisible(true);
            setTimeout(() => setFavoriteIndicatorVisible(false), 2000);
        } catch (error) {
            console.error('Error adding to meal planner:', error);
            Alert.alert('Error', 'Failed to add item to meal planner');
        }
    };
    
    // Helper function to fetch nutritional info
    const fetchNutritionalInfoForPlanner = async (itemId) => {
        try {
            const response = await fetch(`http://${domain}:3000/menu-items/${itemId}/nutrition`);
            if (!response.ok) throw new Error('Failed to fetch nutritional info');
            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error('Failed to fetch nutritional information');
        }
    };

    const scaleNutrition = (nutrition, servings) => {
        return {
            ...nutrition,
            nutrients: {
                calories: Math.round(nutrition.nutrients.calories * servings),
                totalFat: Math.round(nutrition.nutrients.totalFat * servings),
                totalCarbohydrates: Math.round(nutrition.nutrients.totalCarbohydrates * servings),
                protein: Math.round(nutrition.nutrients.protein * servings),
                sodium: Math.round(nutrition.nutrients.sodium * servings),
                dietaryFiber: Math.round(nutrition.nutrients.dietaryFiber * servings)
            }
        };
    };

    const toggleCategory = (category) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };

    const renderDaySelector = () => (
        <View style={styles.daySelectorContainer}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.daySelectorContent}
            >
                {daysOfWeek.map((day) => (
                    <TouchableOpacity
                        key={day}
                        style={[styles.dayButton, selectedDay === day && styles.selectedDay]}
                        onPress={() => {
                            setSelectedDay(day);
                            fetchMenuForDay(day);
                        }}
                    >
                        <Text style={[styles.dayButtonText, selectedDay === day && styles.selectedDayText]}>
                            {day.substring(0, 3)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderServingSizeModal = () => (
        <Modal
            visible={isServingSizeModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setIsServingSizeModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Number of Servings</Text>
                    <Text style={styles.itemName}>{itemToAdd?.name}</Text>
                    
                    <View style={styles.servingInputContainer}>
                        <TextInput
                            style={styles.servingInput}
                            value={selectedServings}
                            onChangeText={setSelectedServings}
                            keyboardType="decimal-pad"
                            placeholder="1"
                        />
                        <Text style={styles.servingText}>servings</Text>
                    </View>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => setIsServingSizeModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.confirmButton]}
                            onPress={handleConfirmServings}
                        >
                            <Text style={styles.modalButtonText}>Add to Planner</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderDietaryFilters = () => (
        <View style={styles.dietaryFiltersContainer}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScrollContent}
            >
                {dietaryFilters.map((filter) => (
                    <TouchableOpacity
                        key={filter.id}
                        style={[
                            styles.dietaryFilterButton,
                            selectedDietaryFilter === filter.id && styles.selectedDietaryFilter
                        ]}
                        onPress={() => setSelectedDietaryFilter(filter.id)}
                    >
                        <Text style={[
                            styles.dietaryFilterText,
                            selectedDietaryFilter === filter.id && styles.selectedDietaryFilterText
                        ]}>
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderCategory = ({ item: category }) => {
        const isExpanded = expandedCategories.has(category);
        const items = categorizedMenuItems[category];

        return (
            <View style={styles.categoryContainer}>
                <TouchableOpacity onPress={() => toggleCategory(category)}>
                    <View style={styles.categoryHeader}>
                        <Text style={styles.categoryTitle}>{category}</Text>
                        <AntDesign 
                            name={isExpanded ? "up" : "down"} 
                            size={20} 
                            color="#666" 
                        />
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.categoryItems}>
                        {items.map((item) => (
                            <View key={item.id} style={styles.menuItem}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <View style={styles.dietaryInfo}>
                                    {item.dietaryInfo.vegetarian && 
                                        <Text style={styles.dietaryTag}>Vegetarian</Text>}
                                    {item.dietaryInfo.vegan && 
                                        <Text style={styles.dietaryTag}>Vegan</Text>}
                                </View>
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={styles.nutritionButton}
                                        onPress={() => fetchNutritionalInfo(item.id)}
                                    >
                                        <Text style={styles.nutritionButtonText}>
                                            View Nutrition
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.favoriteButton}
                                        onPress={() => handleAddToFavorites(item)}
                                    >
                                        <Text style={styles.favoriteButtonText}>
                                            Add to Planner
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

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
                                Item: {selectedItemNutrition.name}
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Serving Size: {selectedItemNutrition.servingSize}
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Calories: {selectedItemNutrition.nutrients.calories}
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Total Fat: {selectedItemNutrition.nutrients.totalFat}
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Total Carbohydrates: {selectedItemNutrition.nutrients.totalCarbohydrates}
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Protein: {selectedItemNutrition.nutrients.protein}
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Sodium: {selectedItemNutrition.nutrients.sodium}
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Dietary Fiber: {selectedItemNutrition.nutrients.dietaryFiber}
                            </Text>
                            <Text style={styles.nutritionItem}>Allergens:</Text>
                            {Object.entries(selectedItemNutrition.allergens)
                                .filter(([_, value]) => value)
                                .map(([allergen]) => (
                                    <Text key={allergen} style={styles.allergenItem}>
                                        • {allergen.charAt(0).toUpperCase() + allergen.slice(1)}
                                    </Text>
                                ))
                            }
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
                    testID="retry-button"
                    style={styles.retryButton}
                    onPress={() => fetchMenuForDay(selectedDay)}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderSearchBar = () => (
        <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
                <AntDesign name="search1" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
                {searchQuery !== '' && (
                    <TouchableOpacity 
                        onPress={() => setSearchQuery('')}
                        style={styles.clearButton}
                    >
                        <AntDesign name="close" size={20} color="#666" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    // MenuScreen.js return statement
return (
    <View style={styles.container}>
        <Text style={styles.title}>{hallName} Menu</Text>
        
        {renderSearchBar()}
        {renderDaySelector()}
        
        <View style={styles.mealTypeContainer}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mealTypeScrollContent}
            >
                {Object.keys(menuData).map((meal) => (
                    <TouchableOpacity
                        key={meal}
                        style={[
                            styles.mealTypeButton,
                            selectedMeal === meal && styles.selectedMealType
                        ]}
                        onPress={() => setSelectedMeal(meal)}
                    >
                        <Text style={[
                            styles.mealTypeText,
                            selectedMeal === meal && styles.selectedMealTypeText
                        ]}>
                            {meal}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
        
        {renderDietaryFilters()}

        {isLoading ? (
            <View style={styles.loadingContainer}>
                <ActivityIndicator testID="loading-indicator" size="large" color="#007AFF" />
            </View>
        ) : (
            <FlatList
                data={Object.keys(categorizedMenuItems)}
                keyExtractor={(item) => item}
                renderItem={renderCategory}
                ListEmptyComponent={
                    <Text style={styles.emptyMessage}>
                        {searchQuery 
                            ? `No items found matching "${searchQuery}"`
                            : 'No items available for the selected filters'}
                    </Text>
                }
            />
        )}

        {/* Nutrition Information Modal */}
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
                                Item: {selectedItemNutrition.name}
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Serving Size: {selectedItemNutrition.servingSize}
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Calories: {selectedItemNutrition.nutrients.calories}
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Total Fat: {selectedItemNutrition.nutrients.totalFat}
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Total Carbohydrates: {selectedItemNutrition.nutrients.totalCarbohydrates}
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Protein: {selectedItemNutrition.nutrients.protein}
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Sodium: {selectedItemNutrition.nutrients.sodium}
                            </Text>
                            <Text style={styles.nutritionItem}>
                                Dietary Fiber: {selectedItemNutrition.nutrients.dietaryFiber}
                            </Text>
                            <Text style={styles.nutritionItem}>Allergens:</Text>
                            {Object.entries(selectedItemNutrition.allergens)
                                .filter(([_, value]) => value)
                                .map(([allergen]) => (
                                    <Text key={allergen} style={styles.allergenItem}>
                                        • {allergen.charAt(0).toUpperCase() + allergen.slice(1)}
                                    </Text>
                                ))
                            }
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

        {/* Serving Size Modal */}
        <Modal
            visible={isServingSizeModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setIsServingSizeModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Number of Servings</Text>
                    <Text style={styles.itemName}>{itemToAdd?.name}</Text>
                    
                    <View style={styles.servingInputContainer}>
                        <TextInput
                            testID="serving-input"
                            style={styles.servingInput}
                            value={selectedServings}
                            onChangeText={setSelectedServings}
                            keyboardType="decimal-pad"
                            placeholder="1"
                            autoFocus={true}
                        />
                        <Text style={styles.servingText}>servings</Text>
                    </View>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => setIsServingSizeModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.confirmButton]}
                            onPress={handleConfirmServings}
                        >
                            <Text style={styles.modalButtonText}>Add to Planner</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
        
        {/* Success Indicator */}
        {favoriteIndicatorVisible && (
            <View style={styles.favoriteIndicator}>
                <Text style={styles.favoriteIndicatorText}>
                    Added to Meal Planner!
                </Text>
            </View>
        )}
    </View>
);
  };

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        paddingTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        paddingHorizontal: 15,
    },
    // Day selector styles
    daySelectorContainer: {
        marginBottom: 15,
        height: 50,
    },
    daySelectorContent: {
        paddingHorizontal: 15,
        gap: 10,
    },
    dayButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#eee',
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    selectedDay: {
        backgroundColor: '#4CAF50',
    },
    dayButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    selectedDayText: {
        color: 'white',
    },

    // Meal type styles
    mealTypeContainer: {
        marginBottom: 15,
        height: 50,
    },
    mealTypeScrollContent: {
        paddingHorizontal: 15,
        gap: 10,
    },
    mealTypeButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#eee',
        minWidth: 100,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    selectedMealType: {
        backgroundColor: '#4CAF50',
    },
    mealTypeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    selectedMealTypeText: {
        color: 'white',
    },

    // Dietary filter styles
    dietaryFiltersContainer: {
        marginBottom: 15,
        height: 50,
    },
    filterScrollContent: {
        paddingHorizontal: 15,
        gap: 10,
    },
    dietaryFilterButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#eee',
        minWidth: 90,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    selectedDietaryFilter: {
        backgroundColor: '#4CAF50',
    },
    dietaryFilterText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    selectedDietaryFilterText: {
        color: 'white',
    },

    // Category styles
    categoryContainer: {
        marginBottom: 10,
        backgroundColor: 'white',
        borderRadius: 8,
        overflow: 'hidden',
        marginHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f5f5f5',
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    categoryItems: {
        padding: 10,
    },

    // Menu item styles
    menuItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 5,
    },
    dietaryInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
        marginBottom: 8,
    },
    dietaryTag: {
        backgroundColor: '#E8F5E9',
        color: '#4CAF50',
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
        fontSize: 12,
        fontWeight: '500',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    nutritionButton: {
        flex: 1,
        backgroundColor: '#007AFF',
        padding: 8,
        borderRadius: 5,
        alignItems: 'center',
    },
    nutritionButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    favoriteButton: {
        flex: 1,
        backgroundColor: '#FFCC00',
        padding: 8,
        borderRadius: 5,
        alignItems: 'center',
    },
    favoriteButtonText: {
        color: '#333',
        fontWeight: '600',
        fontSize: 14,
    },

    // Search bar styles
    searchContainer: {
        paddingHorizontal: 15,
        paddingBottom: 15,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 40,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        marginLeft: 10,
        color: '#333',
    },
    searchIcon: {
        marginRight: 5,
    },
    clearButton: {
        padding: 5,
    },

    // Modal styles
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#333',
    },
    nutritionItem: {
        fontSize: 16,
        marginVertical: 5,
        color: '#333',
    },
    allergenItem: {
        fontSize: 16,
        marginLeft: 20,
        marginVertical: 2,
        color: '#666',
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#FF5722',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },

    // Loading and error states
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#FF5722',
        textAlign: 'center',
        marginBottom: 15,
    },
    retryButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        minWidth: 120,
        alignItems: 'center',
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyMessage: {
        textAlign: 'center',
        fontSize: 16,
        color: '#999',
        marginTop: 20,
    },

    // Favorite indicator
    favoriteIndicator: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        zIndex: 1000,
    },
    favoriteIndicatorText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    servingInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    servingInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        width: 80,
        marginRight: 10,
        fontSize: 18,
        textAlign: 'center',
    },
    servingText: {
        fontSize: 18,
        color: '#333',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 5,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#FF5722',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default MenuScreen;
