import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button, ActivityIndicator, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth } from '../firebase';

const DiningHalls = ({ navigation }) => {
    const [diningHalls, setDiningHalls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDiningHalls();
    }, []);

    const fetchDiningHalls = async () => {
        try {
            const response = await fetch('http://localhost:3000/dining-halls');
            const data = await response.json();
            const hallsWithHours = await Promise.all(data.map(async (hall) => {
                const hoursResponse = await fetch(`http://localhost:3000/dining-halls/${hall.id}/hours`);
                const hoursData = await hoursResponse.json();
                return { ...hall, hours: hoursData };
            }));
            setDiningHalls(hallsWithHours);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dining halls:', error);
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
        const currentTime = now.toLocaleTimeString('en-US', { hour12: false });

        const todayHours = hours.find(h => h.day_of_week === currentDay);
        if (todayHours) {
            return currentTime >= todayHours.opening_time && currentTime < todayHours.closing_time;
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
            {/* Nav Bar */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={openWaitTimes} style={styles.navButton}>
                    <Text style={styles.linkText}>See Current Wait Times</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleProfilePress} style={styles.navButton}>
                    <Icon name="user" size={24} color="#000" />
                    <Text style={styles.navText}>Profile</Text>
                    {auth.currentUser && (
                        <View style={styles.authIndicator} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Dining Halls List */}
            <FlatList
                data={diningHalls}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <TouchableOpacity
                            style={styles.row}
                            onPress={() => navigation.navigate('MenuScreen', { hallId: item.id, hallName: item.name })}
                        >
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
                        </TouchableOpacity>
                        <View style={styles.buttonContainer}>
                            <View style={styles.button}>
                                <Button
                                    title="View Hours"
                                    onPress={() => navigation.navigate('HoursScreen', { hallId: item.id, hallName: item.name })}
                                />
                            </View>
                            <View style={styles.button}>
                                <Button
                                    title="View Menu"
                                    onPress={() => navigation.navigate('MenuScreen', { hallId: item.id, hallName: item.name })}
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
    },
    text: {
        fontSize: 18,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    status: {
        flexDirection: 'row',
        alignItems: 'center',
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
