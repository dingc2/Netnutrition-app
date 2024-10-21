const request = require('supertest');
const express = require('express');
const mysql = require('mysql2');
const app = require('./server');

// Mock MySQL
jest.mock('mysql2');

// Mock database connection and queries
const mockConnection = {
  query: jest.fn(),
  end: jest.fn()
};

mysql.createConnection.mockReturnValue(mockConnection);

describe('Server API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /dining-halls', () => {
    const mockDiningHalls = [
      { id: 1, name: 'Test Hall 1' },
      { id: 2, name: 'Test Hall 2' }
    ];

    it('should return all dining halls', async () => {
      mockConnection.query.mockImplementation((query, callback) => {
        callback(null, mockDiningHalls);
      });

      const response = await request(app).get('/dining-halls');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDiningHalls);
    });

    it('should handle database errors', async () => {
      mockConnection.query.mockImplementation((query, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app).get('/dining-halls');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /dining-halls/:id/menu/:mealTypeId/:day', () => {
    const mockMenuItems = [
      {
        id: 1,
        item_name: 'Test Item 1',
        dietary_info: 'vegetarian'
      }
    ];

    it('should return menu items for specific dining hall, meal type and day', async () => {
      mockConnection.query.mockImplementation((query, params, callback) => {
        callback(null, mockMenuItems);
      });

      const response = await request(app)
        .get('/dining-halls/1/menu/1/Monday');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMenuItems);
    });
  });

  describe('GET /menu-items/:id/nutrition', () => {
    const mockNutrition = {
      item_name: 'Test Item',
      calories: 300,
      protein_g: 10
    };

    it('should return nutritional information for a menu item', async () => {
      mockConnection.query.mockImplementation((query, params, callback) => {
        callback(null, [mockNutrition]);
      });

      const response = await request(app)
        .get('/menu-items/1/nutrition');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNutrition);
    });

    it('should return 404 when nutritional info is not found', async () => {
      mockConnection.query.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      const response = await request(app)
        .get('/menu-items/999/nutrition');

      expect(response.status).toBe(404);
    });
  });

  describe('Health Check', () => {
    it('should return healthy status when database is connected', async () => {
      mockConnection.query.mockImplementation((query, callback) => {
        callback(null, [{ '1': 1 }]);
      });

      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'healthy',
        message: 'Server is running and database is connected'
      });
    });

    it('should return error status when database connection fails', async () => {
      mockConnection.query.mockImplementation((query, callback) => {
        callback(new Error('Connection failed'), null);
      });

      const response = await request(app).get('/health');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
    });
  });
});