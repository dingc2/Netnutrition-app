// test/screens/Login.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import Login from 'screens/Login.js';
import { signInWithEmailAndPassword } from 'firebase/auth';

jest.mock('firebase/auth');

describe('Login Screen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByTestId, getByPlaceholderText, getByText } = render(
      <Login navigation={mockNavigation} />
    );

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByTestId('login-button')).toBeTruthy();
    // Testing for the text content using a partial match
    expect(getByText(/don't have an account/i)).toBeTruthy();
    expect(getByText('Register here')).toBeTruthy();
  });

  it('shows error when fields are empty', async () => {
    const { getByTestId } = render(<Login navigation={mockNavigation} />);
    
    fireEvent.press(getByTestId('login-button'));
    
    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Please fill out all fields.'
    );
  });

  it('shows error when only email is provided', async () => {
    const { getByTestId, getByPlaceholderText } = render(
      <Login navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.press(getByTestId('login-button'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Please fill out all fields.'
    );
  });

  it('shows error when only password is provided', async () => {
    const { getByTestId, getByPlaceholderText } = render(
      <Login navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByTestId('login-button'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Please fill out all fields.'
    );
  });

  it('handles successful login', async () => {
    const mockUser = {
      displayName: 'Test User',
      email: 'test@example.com'
    };

    signInWithEmailAndPassword.mockResolvedValueOnce({
      user: mockUser
    });

    const { getByTestId, getByPlaceholderText } = render(
      <Login navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
    });

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        'ProfileDetails',
        {
          name: 'Test User',
          email: 'test@example.com'
        }
      );
    });
  });

  it('handles login with user without displayName', async () => {
    const mockUser = {
      email: 'test@example.com'
    };

    signInWithEmailAndPassword.mockResolvedValueOnce({
      user: mockUser
    });

    const { getByTestId, getByPlaceholderText } = render(
      <Login navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        'ProfileDetails',
        {
          name: 'User',
          email: 'test@example.com'
        }
      );
    });
  });

  it('handles failed login attempt', async () => {
    const errorMessage = 'Invalid email or password';
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error(errorMessage));

    const { getByTestId, getByPlaceholderText } = render(
      <Login navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');
    
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', errorMessage);
    });
  });

  it('navigates to registration screen when register link is pressed', () => {
    const { getByText } = render(<Login navigation={mockNavigation} />);
    
    fireEvent.press(getByText('Register here'));
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Registration');
  });

  it('disables login button while loading', async () => {
    signInWithEmailAndPassword.mockImplementationOnce(() => 
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({ user: { email: 'test@example.com' } });
        }, 100);
      })
    );

    const { getByTestId, getByPlaceholderText } = render(
      <Login navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      const button = getByTestId('login-button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });
});