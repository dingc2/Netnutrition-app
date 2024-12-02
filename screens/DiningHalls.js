import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth } from '../firebase';
import { DB_DOMAIN } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomBottomNav from '../navigation/CustomButtonNav';

const DiningHalls = ({ navigation }) => {
    const [diningHalls, setDiningHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const domain = DB_DOMAIN;

    const loadFavorites = async () => {
        try {
            const userId = auth.currentUser?.uid || 'guest';
            const stored = await AsyncStorage.getItem(`favorites_${userId}`);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    };
    
    const sortDiningHalls = (halls, currentFavorites = favorites) => {
        const sorted = [...halls].sort((a, b) => {
            const aIsFavorite = currentFavorites.includes(a.name);
            const bIsFavorite = currentFavorites.includes(b.name);
            const aIsOpen = checkIfOpen(a.hours);
            const bIsOpen = checkIfOpen(b.hours);
     
            if (aIsFavorite !== bIsFavorite) return aIsFavorite ? -1 : 1;
            if (aIsOpen !== bIsOpen) return aIsOpen ? -1 : 1;
            return 0;
        });
        setDiningHalls(sorted);
     };
     
     const fetchDiningHalls = async (userFavorites) => {
        try {
            console.log(domain);
            const response = await fetch(`http://${domain}:3000/dining-halls`);
            const data = await response.json();
            const hallsWithHours = await Promise.all(data.map(async (hall) => {
                const hoursResponse = await fetch(`http://${domain}:3000/dining-halls/${hall.name}/hours`);
                const hoursData = await hoursResponse.json();
                return { ...hall, hours: hoursData };
            }));
            
            setFavorites(userFavorites);
            sortDiningHalls(hallsWithHours, userFavorites);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dining halls:', error);
            setLoading(false);
        }
     };
    
    useEffect(() => {
        async function init() {
            const userFavorites = await loadFavorites();
            fetchDiningHalls(userFavorites);
        }
        init();
    }, []);

    const toggleFavorite = async (hallName) => {
        try {
            const userId = auth.currentUser?.uid || 'guest';
            const newFavorites = favorites.includes(hallName)
                ? favorites.filter(name => name !== hallName)
                : [...favorites, hallName];
            
            setFavorites(newFavorites);
            await AsyncStorage.setItem(`favorites_${userId}`, JSON.stringify(newFavorites));
            sortDiningHalls(diningHalls, newFavorites);
        } catch (error) {
            console.error('Error saving favorite:', error);
        }
    };


    const handleProfilePress = () => {
        const user = auth.currentUser;
        if (user) {
            navigation.navigate('ProfileDetails', {
                name: user.displayName || 'User',
                email: user.email
            });
        } else {
            navigation.navigate('ProfileScreen');
        }
    };

    const checkIfOpen = (hours) => {
        if (!hours || hours.length === 0) return false;

        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

        const todayHours = hours.find(h => h.day === currentDay);
        if (todayHours) {
            return Object.values(todayHours.meals).some(meal => {
                if (!meal) return false;
                return currentTime >= meal.open && currentTime < meal.close;
            });
        }
        return false;
    };

    const openWaitTimes = () => {
        Linking.openURL('https://campusdining.vanderbilt.edu/wait-times/');
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <FlatList
                    data={diningHalls}
                    keyExtractor={(item) => item.name}
                    renderItem={({ item }) => {
                        const isOpen = checkIfOpen(item.hours);
                        const isFavorite = favorites.includes(item.name);
                        return (
                            <TouchableOpacity
                                style={[styles.card, isOpen && styles.openCard]}
                                onPress={() => navigation.navigate('MenuScreen', { hallName: item.name })}
                            >
                                <View style={styles.cardHeader}>
                                    <Text style={styles.hallName}>{item.name}</Text>
                                    <TouchableOpacity
                                        onPress={() => toggleFavorite(item.name)}
                                        style={styles.favoriteButton}
                                    >
                                        <Icon
                                            name={isFavorite ? "star" : "star-o"}
                                            size={24}
                                            color={isFavorite ? "#FFD700" : "#666"}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.cardContent}>
                                    <View style={[styles.statusBadge, isOpen ? styles.openBadge : styles.closedBadge]}>
                                        <Text style={styles.statusText}>
                                            {isOpen ? 'OPEN' : 'CLOSED'}
                                        </Text>
                                    </View>
                                    <View style={styles.cardActions}>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => navigation.navigate('MenuScreen', { hallName: item.name })}
                                        >
                                            <Icon name="cutlery" size={16} color="#fff" />
                                            <Text style={styles.actionText}>Menu</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => navigation.navigate('HoursScreen', { hallName: item.name })}
                                        >
                                            <Icon name="clock-o" size={16} color="#fff" />
                                            <Text style={styles.actionText}>Hours</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
            <CustomBottomNav navigation={navigation} currentScreen="DiningHalls" />
        </View>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        paddingBottom: 60,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    card: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        margin: 8,
        padding: 16,
        elevation: 2,
    },
    openCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    hallName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    favoriteButton: {
        padding: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginRight: 12,
    },
    openBadge: {
        backgroundColor: '#4CAF50',
    },
    closedBadge: {
        backgroundColor: '#f44336',
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    cardActions: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#99773d',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 6,
    },
    actionText: {
        color: '#fff',
        fontSize: 14,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default DiningHalls;