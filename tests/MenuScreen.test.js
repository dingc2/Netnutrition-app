import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MenuScreen from './screens/MenuScreen';
import fetchMock from 'jest-fetch-mock';

// Mock the route params
const mockRoute = {
  params: {
    hallId: '1',
    hallName: 'Test Hall'
  }
};

// Mock data
const mockMealTypes = [
  { id: 1, meal_name: 'breakfast' },
  { id: 2, meal_name: 'lunch' },
  { id: 3, meal_name: 'dinner' }
];

const mockMenuItems = [
  {
    id: 1,
    item_name: 'Test Item 1',
    dietary_info: 'vegetarian, gluten-free'
  },
  {
    id: 2,
    item_name: 'Test Item 2',
    dietary_info: 'vegan'
  }
];

const mockNutritionalInfo = {
  item_name: 'Test Item 1',
  serving_size: '1 serving',
  calories: 300,
  protein_g: 10,
  carbohydrates_g: 40,
  fat_g: 12,
  fiber_g: 5,
  sodium_mg: 400,
  allergens: 'none'
};

describe('MenuScreen', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('renders loading state initially', () => {
    const { getByTestId } = render(<MenuScreen route={mockRoute} />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('fetches and displays meal types', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockMealTypes));
    
    const { getAllByTestId } = render(<MenuScreen route={mockRoute} />);
    
    await waitFor(() => {
      const mealTypeButtons = getAllByTestId('meal-type-button');
      expect(mealTypeButtons).toHaveLength(3);
      expect(mealTypeButtons[0]).toHaveTextContent('Breakfast');
    });
  });

  it('filters menu items based on dietary preferences', async () => {
    fetchMock
      .mockResponseOnce(JSON.stringify(mockMealTypes))
      .mockResponseOnce(JSON.stringify(mockMenuItems));

    const { getByText, getAllByTestId } = render(<MenuScreen route={mockRoute} />);

    // Wait for initial load
    await waitFor(() => {
      expect(getAllByTestId('menu-item')).toHaveLength(2);
    });

    // Click vegetarian filter
    fireEvent.press(getByText('Vegetarian'));

    // Check filtered results
    await waitFor(() => {
      const menuItems = getAllByTestId('menu-item');
      expect(menuItems).toHaveLength(1);
      expect(menuItems[0]).toHaveTextContent('Test Item 1');
    });
  });

  it('displays nutritional information modal', async () => {
    fetchMock
      .mockResponseOnce(JSON.stringify(mockMealTypes))
      .mockResponseOnce(JSON.stringify(mockMenuItems))
      .mockResponseOnce(JSON.stringify(mockNutritionalInfo));

    const { getByText, getAllByText } = render(<MenuScreen route={mockRoute} />);

    await waitFor(() => {
      fireEvent.press(getAllByText('View Nutritional Info')[0]);
    });

    await waitFor(() => {
      expect(getByText('Nutritional Information')).toBeTruthy();
      expect(getByText('Calories: 300')).toBeTruthy();
    });
  });

  it('handles error states appropriately', async () => {
    fetchMock.mockRejectOnce(new Error('Network error'));

    const { getByText } = render(<MenuScreen route={mockRoute} />);

    await waitFor(() => {
      expect(getByText('Failed to load meal types. Please try again.')).toBeTruthy();
    });
  });

  it('updates selected day and fetches new menu', async () => {
    fetchMock
      .mockResponseOnce(JSON.stringify(mockMealTypes))
      .mockResponseOnce(JSON.stringify(mockMenuItems));

    const { getByText, getAllByTestId } = render(<MenuScreen route={mockRoute} />);

    await waitFor(() => {
      fireEvent.press(getByText('Tue'));
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/dining-halls/1/menu'),
      expect.any(Object)
    );
  });
});