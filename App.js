import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import DiningHalls from './screens/DiningHalls';
import MenuScreen from './screens/MenuScreen';
import HoursScreen from './screens/HourScreen';
import ProfileScreen from './screens/ProfileScreen';
import Registration from './screens/Registration';
import Login from './screens/Login';
import ProfileDetails from './screens/ProfileDetails';

const Stack = createStackNavigator();

export default function App() {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (initializing) setInitializing(false);
        });

        // Cleanup subscription
        return unsubscribe;
    }, [initializing]);

    if (initializing) return null;

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="DiningHalls">
                <Stack.Screen 
                    name="DiningHalls" 
                    component={DiningHalls} 
                    options={{ title: 'Vanderbilt NetNutrition' }} 
                />
                <Stack.Screen 
                    name="MenuScreen" 
                    component={MenuScreen} 
                    options={({ route }) => ({ 
                        title: `${route.params?.hallName || 'Menu'}`,
                        headerBackTitle: 'Back'
                    })} 
                />
                <Stack.Screen 
                    name="HoursScreen" 
                    component={HoursScreen} 
                    options={({ route }) => ({ 
                        title: `${route.params?.hallName || 'Hours'}`,
                        headerBackTitle: 'Back'
                    })} 
                />
                <Stack.Screen 
                    name="ProfileScreen" 
                    component={ProfileScreen} 
                    options={{ title: 'Profile' }} 
                />
                {/* Always show Registration and Login screens */}
                <Stack.Screen 
                    name="Registration" 
                    component={Registration} 
                    options={{ title: 'Registration' }} 
                />
                <Stack.Screen 
                    name="Login" 
                    component={Login} 
                    options={{ title: 'Login' }} 
                />
                {/* ProfileDetails will only show if user is authenticated */}
                {user && (
                    <Stack.Screen 
                        name="ProfileDetails" 
                        component={ProfileDetails} 
                        options={{ 
                            title: 'Profile Details',
                            headerLeft: null,  
                        }} 
                    />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
