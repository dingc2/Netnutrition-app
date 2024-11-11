import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileScreen from 'screens/ProfileScreen.js';

describe('Profile Screen', () => {
  const mockNavigation = {
    navigate: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByTestId } = render(<ProfileScreen navigation={mockNavigation} />);
    
    expect(getByTestId('profile-title')).toBeTruthy();
    expect(getByTestId('login-button')).toBeTruthy();
    expect(getByTestId('register-button')).toBeTruthy();
  });

  it('navigates to login screen when Login button is pressed', () => {
    const { getByTestId } = render(<ProfileScreen navigation={mockNavigation} />);
    
    fireEvent.press(getByTestId('login-button'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
  });

  it('navigates to registration screen when Register button is pressed', () => {
    const { getByTestId } = render(<ProfileScreen navigation={mockNavigation} />);
    
    fireEvent.press(getByTestId('register-button'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Registration');
  });
});