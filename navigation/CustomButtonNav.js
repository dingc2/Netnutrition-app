import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Linking } from 'react-native';
import { auth } from '../firebase';

const CustomBottomNav = ({ navigation, currentScreen }) => {
  const openWaitTimes = () => {
    Linking.openURL('https://campusdining.vanderbilt.edu/wait-times/');
  };

  const navigateToProfile = () => {
    if (auth.currentUser) {
      navigation.navigate('ProfileDetails');
    } else {
      navigation.navigate('ProfileScreen');
    }
  };

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => navigation.navigate('DiningHalls')}
      >
        <Icon
          name="cutlery"
          size={24}
          color={currentScreen === 'DiningHalls' ? '#99773d' : '#666'}
        />
        <Text style={styles.tabText}>Dining Halls</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tab}
        onPress={openWaitTimes}
      >
        <Icon name="clock-o" size={24} color="#666" />
        <Text style={styles.tabText}>Wait Times</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tab}
        onPress={navigateToProfile}
      >
        <Icon
          name="user"
          size={24}
          color={currentScreen === 'ProfileDetails' || currentScreen === 'ProfileScreen' ? '#99773d' : '#666'}
        />
        <Text style={styles.tabText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingBottom: 5,
    zIndex: 1000,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  }
});

export default CustomBottomNav;