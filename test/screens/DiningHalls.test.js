import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Linking } from 'react-native';
import DiningHalls from 'screens/DiningHalls';

// Mock the external dependencies
jest.mock('react-native/Libraries/Linking/Linking', () => ({
    openURL: jest.fn(),
}));

jest.mock('@env', () => ({
    DB_DOMAIN: 'test-domain',
}));

jest.mock('__mocks__/firebase.js', () => ({
    auth: {
        currentUser: null
    }
}));

jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');

describe('DiningHalls Screen', () => {
    const mockNavigation = {
        navigate: jest.fn(),
    };

    const mockDiningHalls = [
        {
            name: 'Commons',
            hours: [
                {
                    day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
                    meals: {
                        breakfast: { open: '07:00', close: '10:30' },
                        lunch: { open: '11:00', close: '14:00' },
                        dinner: { open: '17:00', close: '20:00' },
                    },
                },
            ],
        },
        {
            name: 'EBI',
            hours: [
                {
                    day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
                    meals: {
                        breakfast: null,
                        lunch: { open: '11:00', close: '14:00' },
                        dinner: { open: '17:00', close: '19:00' },
                    },
                },
            ],
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
        console.error = jest.fn();
    });

    it('renders loading state initially', () => {
        global.fetch.mockImplementation(() => new Promise(() => {}));

        const { getByTestId } = render(<DiningHalls navigation={mockNavigation} />);
        expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('fetches and displays dining halls correctly', async () => {
        global.fetch
            .mockImplementationOnce(() => Promise.resolve({
                json: () => Promise.resolve(mockDiningHalls.map(({ name }) => ({ name })))
            }))
            .mockImplementation(() => Promise.resolve({
                json: () => Promise.resolve(mockDiningHalls[0].hours)
            }));

        const { findByText, findAllByText } = render(
            <DiningHalls navigation={mockNavigation} />
        );

        await act(async () => {
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalled();
            });
        });

        const commons = await findByText('Commons');
        const ebi = await findByText('EBI');
        const viewHoursButtons = await findAllByText('View Hours');
        const viewMenuButtons = await findAllByText('View Menu');

        expect(commons).toBeTruthy();
        expect(ebi).toBeTruthy();
        expect(viewHoursButtons).toHaveLength(2);
        expect(viewMenuButtons).toHaveLength(2);
    });

    it('navigates to hours screen when View Hours is pressed', async () => {
        global.fetch
            .mockImplementationOnce(() => Promise.resolve({
                json: () => Promise.resolve([{ name: 'Commons' }])
            }))
            .mockImplementation(() => Promise.resolve({
                json: () => Promise.resolve(mockDiningHalls[0].hours)
            }));

        const { findByTestId } = render(
            <DiningHalls navigation={mockNavigation} />
        );

        await act(async () => {
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalled();
            });
        });

        const viewHoursButton = await findByTestId('view-hours-Commons');
        fireEvent.press(viewHoursButton);

        expect(mockNavigation.navigate).toHaveBeenCalledWith('HoursScreen', {
            hallName: 'Commons'
        });
    });

    it('navigates to menu screen when View Menu is pressed', async () => {
        global.fetch
            .mockImplementationOnce(() => Promise.resolve({
                json: () => Promise.resolve([{ name: 'Commons' }])
            }))
            .mockImplementation(() => Promise.resolve({
                json: () => Promise.resolve(mockDiningHalls[0].hours)
            }));

        const { findByTestId } = render(
            <DiningHalls navigation={mockNavigation} />
        );

        await act(async () => {
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalled();
            });
        });

        const viewMenuButton = await findByTestId('view-menu-Commons');
        fireEvent.press(viewMenuButton);

        expect(mockNavigation.navigate).toHaveBeenCalledWith('MenuScreen', {
            hallName: 'Commons'
        });
    });

    it('opens wait times link when pressed', async () => {
        global.fetch
            .mockImplementationOnce(() => Promise.resolve({
                json: () => Promise.resolve(mockDiningHalls.map(({ name }) => ({ name })))
            }))
            .mockImplementation(() => Promise.resolve({
                json: () => Promise.resolve(mockDiningHalls[0].hours)
            }));

        const { findByTestId } = render(
            <DiningHalls navigation={mockNavigation} />
        );

        await act(async () => {
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalled();
            });
        });

        const waitTimesButton = await findByTestId('wait-times-button');
        fireEvent.press(waitTimesButton);

        expect(Linking.openURL).toHaveBeenCalledWith(
            'https://campusdining.vanderbilt.edu/wait-times/'
        );
    });

    it('handles API error gracefully', async () => {
        const error = new Error('Failed to fetch');
        global.fetch.mockRejectedValueOnce(error);

        const { findByText } = render(<DiningHalls navigation={mockNavigation} />);

        await act(async () => {
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalled();
            });
        });

        const errorMessage = await findByText('Failed to fetch dining halls');
        expect(errorMessage).toBeTruthy();
        expect(console.error).toHaveBeenCalledWith(
            'Error fetching dining halls:',
            error
        );
    });

    it('displays empty state message when no dining halls', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve([])
            })
        );

        const { findByText } = render(
            <DiningHalls navigation={mockNavigation} />
        );

        await act(async () => {
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalled();
            });
        });

        const emptyMessage = await findByText('No dining halls available');
        expect(emptyMessage).toBeTruthy();
    });

    it('navigates to ProfileDetails when user is logged in', async () => {
        const mockUser = {
            displayName: 'Test User',
            email: 'test@test.com'
        };

        jest.resetModules();
        jest.mock('..firebase/', () => ({
            auth: {
                currentUser: mockUser
            }
        }));

        global.fetch
            .mockImplementationOnce(() => Promise.resolve({
                json: () => Promise.resolve(mockDiningHalls.map(({ name }) => ({ name })))
            }))
            .mockImplementation(() => Promise.resolve({
                json: () => Promise.resolve(mockDiningHalls[0].hours)
            }));

        const { findByTestId } = render(
            <DiningHalls navigation={mockNavigation} />
        );

        await act(async () => {
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalled();
            });
        });

        const profileButton = await findByTestId('profile-button');
        fireEvent.press(profileButton);

        expect(mockNavigation.navigate).toHaveBeenCalledWith('ProfileDetails', {
            name: mockUser.displayName,
            email: mockUser.email
        });
    });

    it('navigates to ProfileScreen when user is not logged in', async () => {
        global.fetch
            .mockImplementationOnce(() => Promise.resolve({
                json: () => Promise.resolve(mockDiningHalls.map(({ name }) => ({ name })))
            }))
            .mockImplementation(() => Promise.resolve({
                json: () => Promise.resolve(mockDiningHalls[0].hours)
            }));

        const { findByTestId } = render(
            <DiningHalls navigation={mockNavigation} />
        );

        await act(async () => {
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalled();
            });
        });

        const profileButton = await findByTestId('profile-button');
        fireEvent.press(profileButton);

        expect(mockNavigation.navigate).toHaveBeenCalledWith('ProfileScreen');
    });
});