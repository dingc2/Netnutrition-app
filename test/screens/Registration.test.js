import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import RegisterScreen from 'screens/Registration.js';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

jest.mock('firebase/auth');

describe('Registration Screen', () => {
  const mockNavigation = {
    navigate: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <RegisterScreen navigation={mockNavigation} />
    );

    expect(getByPlaceholderText('Name')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByTestId('register-button')).toBeTruthy();
  });

  it('shows error when fields are empty', async () => {
    const { getByTestId } = render(<RegisterScreen navigation={mockNavigation} />);
    
    fireEvent.press(getByTestId('register-button'));
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Please fill out all fields.'
      );
    });
  });

  it('validates email format', async () => {
    const { getByTestId, getByPlaceholderText } = render(
      <RegisterScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Name'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('Email'), 'invalid-email');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    
    fireEvent.press(getByTestId('register-button'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Please enter a valid email address.'
      );
    });
  });

  it('validates password length', async () => {
    const { getByTestId, getByPlaceholderText } = render(
      <RegisterScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Name'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), '123');
    
    fireEvent.press(getByTestId('register-button'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Password must be at least 6 characters long.'
      );
    });
  });

  it('handles successful registration', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com'
    };

    createUserWithEmailAndPassword.mockResolvedValueOnce({
      user: mockUser
    });

    updateProfile.mockResolvedValueOnce();

    const { getByTestId, getByPlaceholderText } = render(
      <RegisterScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Name'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    
    fireEvent.press(getByTestId('register-button'));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalled();
      expect(updateProfile).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Registration successful! Please log in.'
      );
      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        'Login',
        { name: 'Test User' }
      );
    });
  });

  it('disables button during registration', async () => {
    createUserWithEmailAndPassword.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    const { getByTestId, getByPlaceholderText } = render(
      <RegisterScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Name'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    
    const button = getByTestId('register-button');
    fireEvent.press(button);

    await waitFor(() => {
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });
});