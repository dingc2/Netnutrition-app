import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button, ActivityIndicator, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth } from '../firebase';
import { Platform } from 'react-native';
import { DB_DOMAIN } from '@env';

const DiningHalls = ({ navigation }) => {
    const [diningHalls, setDiningHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const domain = DB_DOMAIN;

    useEffect(() => {
        fetchDiningHalls();
    }, []);

    const fetchDiningHalls = async () => {
        try {
            const response = await fetch(`http://${domain}:3000/dining-halls`);
            const data = await response.json();
            const hallsWithHours = await Promise.all(data.map(async (hall) => {
                const hoursResponse = await fetch(`http://${domain}:3000/dining-halls/${hall.name}/hours`);
                const hoursData = await hoursResponse.json();
                return { ...hall, hours: hoursData };
            }));
            
            const sortedHalls = hallsWithHours.sort((a, b) => {
                const aIsOpen = checkIfOpen(a.hours);
                const bIsOpen = checkIfOpen(b.hours);
                if (aIsOpen === bIsOpen) return 0;
                return aIsOpen ? -1 : 1;
            });
            
            setDiningHalls(sortedHalls);
        } catch (error) {
            console.error('Error fetching dining halls:', error);
            setError('Failed to fetch dining halls');
        } finally {
            setLoading(false);
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
            const { meals } = todayHours;
            return Object.values(meals).some(meal => {
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
                <ActivityIndicator testID="loading-indicator" size="large" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text>{error}</Text>
            </View>
        );
    }

    if (diningHalls.length === 0) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text>No dining halls available</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.navBar}>
                <TouchableOpacity testID="wait-times-button" onPress={openWaitTimes} style={styles.navButton}>
                    <Text style={styles.linkText}>See Current Wait Times</Text>
                </TouchableOpacity>
                <TouchableOpacity testID="profile-button" onPress={handleProfilePress} style={styles.navButton}>
                    <Icon name="user" size={24} color="#000" />
                    <Text style={styles.navText}>Profile</Text>
                    {auth.currentUser && (
                        <View style={styles.authIndicator} />
                    )}
                </TouchableOpacity>
            </View>

            <FlatList
                testID="dining-halls-list"
                data={diningHalls}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <View style={styles.contentContainer}>
                            <Text style={styles.text}>{item.name}</Text>
                            <View style={styles.status}>
                                <Icon
                                    name="circle"
                                    size={18}
                                    color={checkIfOpen(item.hours) ? "green" : "red"}
                                    style={styles.icon}
                                />
                                <Text style={styles.statusText}>
                                    {checkIfOpen(item.hours) ? 'Open' : 'Closed'}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.buttonContainer}>
                            <View style={styles.button}>
                                <Button
                                    testID={`view-hours-${item.name}`}
                                    title="View Hours"
                                    onPress={() => navigation.navigate('HoursScreen', { 
                                        hallName: item.name 
                                    })}
                                />
                            </View>
                            <View style={styles.button}>
                                <Button
                                    testID={`view-menu-${item.name}`}
                                    title="View Menu"
                                    onPress={() => navigation.navigate('MenuScreen', { 
                                        hallName: item.name 
                                    })}
                                />
                            </View>
                        </View>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#99773d',
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 20,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    navText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    linkText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#00008B', 
        textDecorationLine: 'underline', 
    },
    authIndicator: {
        position: 'absolute',
        top: 15,
        right: 60,
        width: 8,
        height: 8,
        backgroundColor: '#4CAF50',
        borderRadius: 4,
    },
    item: {
        padding: 15,
        backgroundColor: '#ddd',
        borderRadius: 5,
        marginBottom: 10,
        position: 'relative',
    },
    contentContainer: {
        position: 'relative',
        minHeight: 50,
    },
    text: {
        fontSize: 18,
    },
    status: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
    icon: {
        marginRight: 5,
    },
    statusText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 10,
    },
    button: {
        marginRight: 10,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default DiningHalls;