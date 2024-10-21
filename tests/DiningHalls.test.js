import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DiningHalls from './screens/DiningHalls';
import { auth } from '../firebase';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn()
};

// Mock firebase auth
jest.mock('../firebase', () => ({
  auth: {
    currentUser: null
  }
}));

// Mock data
const mockDiningHalls = [
  {
    id: 1,
    name: 'Test Hall 1',
    hours: [
      {
        day_of_week: 'Monday',
        opening_time: '07:00:00',
        closing_time: '22:00:00'
      }
    ]
  },
  {
    id: 2,
    name: 'Test Hall 2',
    hours: [
      {
        day_of_week: 'Monday',
        opening_time: '08:00:00',
        closing_time: '21:00:00'
      }
    ]
  }
];

describe('DiningHalls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.resetMocks();
  });

  it('renders loading state initially', () => {
    const { getByTestId } = render(<DiningHalls navigation={mockNavigation} />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('fetches and displays dining halls', async () => {
    fetch
      .mockResponseOnce(JSON.stringify(mockDiningHalls))
      .mockResponseOnce(JSON.stringify(mockDiningHalls[0].hours))
      .mockResponseOnce(JSON.stringify(mockDiningHalls[1].hours));

    const { getAllByTestId } = render(<DiningHalls navigation={mockNavigation} />);

    await waitFor(() => {
      const diningHalls = getAllByTestId('dining-hall-item');
      expect(diningHalls).toHaveLength(2);
      expect(diningHalls[0]).toHaveTextContent('Test Hall 1');
    });
  });

  it('navigates to menu screen when pressing view menu', async () => {
    fetch
      .mockResponseOnce(JSON.stringify(mockDiningHalls))
      .mockResponseOnce(JSON.stringify(mockDiningHalls[0].hours))
      .mockResponseOnce(JSON.stringify(mockDiningHalls[1].hours));

    const { getAllByText } = render(<DiningHalls navigation={mockNavigation} />);

    await waitFor(() => {
      fireEvent.press(getAllByText('View Menu')[0]);
    });

    expect(mockNavigation.navigate).toHaveBeenCalledWith('MenuScreen', {
      hallId: 1,
      hallName: 'Test Hall 1'
    });
  });

  it('shows correct open/closed status based on current time', async () => {
    // Mock current time
    jest.spyOn(Date.prototype, 'toLocaleTimeString').mockImplementation(() => '12:00:00');
    jest.spyOn(Date.prototype, 'toLocaleDateString').mockImplementation(() => 'Monday');

    fetch
      .mockResponseOnce(JSON.stringify(mockDiningHalls))
      .mockResponseOnce(JSON.stringify(mockDiningHalls[0].hours))
      .mockResponseOnce(JSON.stringify(mockDiningHalls[1].hours));

    const { getAllByTestId } = render(<DiningHalls navigation={mockNavigation} />);

    await waitFor(() => {
      const statusIndicators = getAllByTestId('status-indicator');
      expect(statusIndicators[0]).toHaveTextContent('Open');
    });
  });

  it('handles authentication state for profile navigation', async () => {
    auth.currentUser = { displayName: 'Test User', email: 'test@example.com' };

    fetch
      .mockResponseOnce(JSON.stringify(mockDiningHalls))
      .mockResponseOnce(JSON.stringify(mockDiningHalls[0].hours))
      .mockResponseOnce(JSON.stringify(mockDiningHalls[1].hours));

    const { getByTestId } = render(<DiningHalls navigation={mockNavigation} />);

    await waitFor(() => {
      fireEvent.press(getByTestId('profile-button'));
    });

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ProfileDetails', {
      name: 'Test User',
      email: 'test@example.com'
    });
  });

  it('handles error states appropriately', async () => {
    fetch.mockRejectOnce(new Error('Network error'));

    const { getByText } = render(<DiningHalls navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Error loading dining halls')).toBeTruthy();
    });
  });
});