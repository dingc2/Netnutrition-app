import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const MenuScreen = ({ route }) => {
    const { hallName, menu } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{hallName} Menu</Text>
            <FlatList
                data={menu}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.menuItem}>
                        <Text style={styles.menuText}>{item.name}</Text>
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
    menuText: {
        fontSize: 18,
    },
});

export default MenuScreen;
