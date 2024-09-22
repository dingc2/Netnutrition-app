import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MenuScreen = ({ route }) => {
    const { hallName } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{hallName} - Menu</Text>
            <View style={styles.menu}>
                <Text style={styles.menuItem}>Pizza</Text>
                <Text style={styles.menuItem}>Salad</Text>
                <Text style={styles.menuItem}>Pasta</Text>
                <Text style={styles.menuItem}>Burgers</Text>
                <Text style={styles.menuItem}>Desserts</Text>
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    menu: {
        padding: 10,
        backgroundColor: '#ddd',
        borderRadius: 5,
    },
    menuItem: {
        fontSize: 18,
        marginBottom: 10,
    },
});

export default MenuScreen;
