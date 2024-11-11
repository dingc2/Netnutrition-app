import React from 'react';
import { render } from '@testing-library/react-native';
import HoursScreen from 'screens/HourScreen.js';

// Mock environment variables
jest.mock('@env', () => ({
  DB_DOMAIN: 'localhost'
}));

describe('HoursScreen', () => {
  const mockRoute = {
    params: {
      hallName: 'Commons'
    }
  };

  const mockHoursData = [
    {
      day: 'Monday',
      meals: {
        breakfast: { open: '07:00', close: '10:30' },
        lunch: { open: '11:00', close: '14:00' },
        dinner: { open: '17:00', close: '20:00' }
      }
    },
    {
      day: 'Saturday',
      meals: {
        breakfast: null,
        lunch: { open: '11:00', close: '14:00' },
        dinner: { open: '17:00', close: '19:00' }
      }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    console.error = jest.fn();
  });

  it('renders the correct title with dining hall name', () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockHoursData
    });

    const { getByText } = render(<HoursScreen route={mockRoute} />);
    expect(getByText('Commons - Hours')).toBeTruthy();
  });

  it('fetches and displays hours data correctly', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockHoursData
    });

    const { findByText, findAllByText, queryByText } = render(<HoursScreen route={mockRoute} />);
    
    // Check days
    const monday = await findByText('Monday');
    const saturday = await findByText('Saturday');
    expect(monday).toBeTruthy();
    expect(saturday).toBeTruthy();

    // Verify lunch times appear twice (Monday and Saturday)
    const lunchTimes = await findAllByText('Lunch: 11:00 AM - 2:00 PM');
    expect(lunchTimes).toHaveLength(2);

    // Check specific meal times
    expect(queryByText('Breakfast: 7:00 AM - 10:30 AM')).toBeTruthy();
    expect(queryByText('Dinner: 5:00 PM - 8:00 PM')).toBeTruthy();

    // Saturday's special cases
    expect(queryByText('Breakfast: Closed')).toBeTruthy();
    expect(queryByText('Dinner: 5:00 PM - 7:00 PM')).toBeTruthy();
  });

  it('makes correct API call', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockHoursData
    });

    render(<HoursScreen route={mockRoute} />);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/dining-halls/Commons/hours'
    );
  });

  it('handles API error gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<HoursScreen route={mockRoute} />);

    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching hours:',
      expect.any(Error)
    );
  });

  it('correctly formats all meal times for a single day', async () => {
    const singleDayData = [{
      day: 'Monday',
      meals: {
        breakfast: { open: '07:00', close: '10:30' },
        lunch: { open: '11:00', close: '14:00' },
        dinner: { open: '17:00', close: '20:00' }
      }
    }];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => singleDayData
    });

    const { findByText } = render(<HoursScreen route={mockRoute} />);

    await expect(findByText('Breakfast: 7:00 AM - 10:30 AM')).resolves.toBeTruthy();
    await expect(findByText('Lunch: 11:00 AM - 2:00 PM')).resolves.toBeTruthy();
    await expect(findByText('Dinner: 5:00 PM - 8:00 PM')).resolves.toBeTruthy();
  });

  it('handles all closed meals correctly', async () => {
    const closedDayData = [{
      day: 'Sunday',
      meals: {
        breakfast: null,
        lunch: null,
        dinner: null
      }
    }];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => closedDayData
    });

    const { findByText } = render(<HoursScreen route={mockRoute} />);
    
    await expect(findByText('Sunday')).resolves.toBeTruthy();
    await expect(findByText('Breakfast: Closed')).resolves.toBeTruthy();
    await expect(findByText('Lunch: Closed')).resolves.toBeTruthy();
    await expect(findByText('Dinner: Closed')).resolves.toBeTruthy();
  });

  it('formats special time cases correctly', async () => {
    const specialTimesData = [{
      day: 'Monday',
      meals: {
        breakfast: { open: '12:00', close: '13:00' }, // Test noon
        lunch: { open: '00:00', close: '01:00' },    // Test midnight
        dinner: { open: '23:59', close: '23:59' }    // Test end of day
      }
    }];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => specialTimesData
    });

    const { findByText } = render(<HoursScreen route={mockRoute} />);
    
    await expect(findByText('Breakfast: 12:00 PM - 1:00 PM')).resolves.toBeTruthy();
    await expect(findByText('Lunch: 12:00 AM - 1:00 AM')).resolves.toBeTruthy();
    await expect(findByText('Dinner: 11:59 PM - 11:59 PM')).resolves.toBeTruthy();
  });

  it('applies correct styles to elements', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockHoursData
    });

    const { getByText, findByText } = render(<HoursScreen route={mockRoute} />);

    // Test title styles
    const title = getByText('Commons - Hours');
    expect(title.props.style).toMatchObject({
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    });

    // Test day text styles
    const dayText = await findByText('Monday');
    expect(dayText.props.style).toMatchObject({
      fontSize: 16,
      fontWeight: 'bold',
    });

    // Test meal time text styles
    const mealText = await findByText('Breakfast: 7:00 AM - 10:30 AM');
    expect(mealText.props.style).toMatchObject({
      fontSize: 16,
      color: '#555',
    });

    // Test container styles
    const dayContainer = dayText.parent.parent;
    expect(dayContainer.props.style).toMatchObject({
      marginBottom: 15,
      padding: 10,
      backgroundColor: '#ddd',
      borderRadius: 5,
    });
  });
});