import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const MenuScreen = ({ route }) => {
    const { hallId, hallName } = route.params;
    const [menu, setMenu] = useState([]);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const response = await fetch(`http://localhost:3000/dining-halls/${hallId}/menu`);
            const data = await response.json();
            setMenu(data);
        } catch (error) {
            console.error('Error fetching menu:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{hallName} Menu</Text>
            <FlatList
                data={menu}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.menuItem}>
                        <Text style={styles.itemName}>{item.item_name}</Text>
                        <Text style={styles.dietaryInfo}>{item.dietary_info}</Text>
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
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    menuItem: {
        padding: 15,
        backgroundColor: '#ddd',
        borderRadius: 5,
        marginBottom: 10,
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    itemDescription: {
        fontSize: 16,
        marginTop: 5,
    },
    dietaryInfo: {
        fontSize: 14,
        fontStyle: 'italic',
        marginTop: 5,
    },
});

export default MenuScreen;