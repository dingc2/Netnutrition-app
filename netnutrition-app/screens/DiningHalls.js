import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const diningHalls = [
    {
        id: '1',
        name: 'Rothschild',
        isOpen: true,
        hours: [
            { day: 'Monday', open: '7:00 AM', close: '10:00 PM' },
            { day: 'Tuesday', open: '7:00 AM', close: '10:00 PM' },
        ],
        menu: [
            { id: '1', name: 'Pizza' },
            { id: '2', name: 'Salad' },
            { id: '3', name: 'Burger'},
        ]
    },

    {
        id: '2',
        name: 'Commons',
        isOpen: false,
        hours: [
            { day: 'Monday', open: '7:00 AM', close: '10:00 PM' },
            { day: 'Tuesday', open: '7:00 AM', close: '10:00 PM' },
        ],
        menu: [
            { id: '1', name: 'Pizza' },
            { id: '2', name: 'Salad' },
            { id: '3', name: 'Burger'},
        ]
    },

    {
        id: '3',
        name: 'Zeppos',
        isOpen: true,
        hours: [
            { day: 'Monday', open: '7:00 AM', close: '10:00 PM' },
            { day: 'Tuesday', open: '7:00 AM', close: '10:00 PM' },
        ],
        menu: [
            { id: '1', name: 'Pizza' },
            { id: '2', name: 'Salad' },
            { id: '3', name: 'Burger'},
        ]
    },

    {
        id: '4',
        name: 'Kissam',
        isOpen: true,
        hours: [
            { day: 'Monday', open: '7:00 AM', close: '10:00 PM' },
            { day: 'Tuesday', open: '7:00 AM', close: '10:00 PM' },
        ],
        menu: [
            { id: '1', name: 'Pizza' },
            { id: '2', name: 'Salad' },
            { id: '3', name: 'Burger'},
        ]
    },

    {
        id: '5',
        name: 'EBI',
        isOpen: false,
        hours: [
            { day: 'Monday', open: '7:00 AM', close: '10:00 PM' },
            { day: 'Tuesday', open: '7:00 AM', close: '10:00 PM' },
        ],
        menu: [
            { id: '1', name: 'Pizza' },
            { id: '2', name: 'Salad' },
            { id: '3', name: 'Burger'},
        ]
    },

];

const DiningHalls = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Available Dining Halls</Text>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('ProfileScreen')}
                >
                    <Icon name="user" size={24} color="#000" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={diningHalls}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <TouchableOpacity
                            style={styles.row}
                            onPress={() => navigation.navigate('MenuScreen', { hallName: item.name })}
                        >
                            <Text style={styles.text}>{item.name}</Text>
                            <View style={styles.status}>
                                <Icon
                                    name="circle"
                                    size={18}
                                    color={item.isOpen ? "green" : "red"}
                                    style={styles.icon}
                                />
                                <Text style={styles.statusText}>
                                    {item.isOpen ? 'Open' : 'Closed'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.buttonContainer}>
                            <View style={styles.button}>
                                <Button
                                    title="View Hours"
                                    onPress={() => navigation.navigate('HoursScreen', { hallName: item.name, hours: item.hours })}
                                />
                            </View>
                            <View style={styles.button}>
                                <Button
                                    title="View Menu"
                                    onPress={() => navigation.navigate('MenuScreen', { hallName: item.name, menu: item.menu })}
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
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    profileButton: {
        padding: 10,
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
        color: '#555',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 10,
    },
    button: {
        marginRight: 10,
    },
});

export default DiningHalls;
