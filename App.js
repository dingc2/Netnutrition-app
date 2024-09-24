import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DiningHalls from './screens/DiningHalls';
import MenuScreen from './screens/MenuScreen';
import HoursScreen from './screens/HourScreen';
import ProfileScreen from './screens/ProfileScreen';
import Registration  from './screens/Registration';
import Login from './screens/Login';
import ProfileDetails from './screens/ProfileDetails';

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="DiningHalls">
                <Stack.Screen name="DiningHalls" component={DiningHalls} options={{ title: 'Vanderbilt NetNutrition' }} />
                <Stack.Screen name="MenuScreen" component={MenuScreen} options={{ title: 'Menu' }} />
                <Stack.Screen name="HoursScreen" component={HoursScreen} options={{ title: 'Hours' }} />
                <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ title: 'Profile' }} />
                <Stack.Screen name="Registration" component={Registration} options={{ title: 'Registration' }} />
                <Stack.Screen name="Login" component={Login} options={{ title: 'Login' }} />
                <Stack.Screen name="ProfileDetails" component={ProfileDetails} options={{ title: 'Profile Details' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
