const request = require('supertest');
const express = require('express');
const Actionitem = require('../../models/Actionitem');

// Mock the Actionitem model
jest.mock('../../models/Actionitem');

// Import controllers
const {
  getActionitems,
  getActionitem,
  createActionitem,
  updateActionitem,
  deleteActionitem,
} = require('../../controllers/actionitems');

// Create express app for testing
const app = express();
app.use(express.json());

// Set up routes for testing
app.get('/api/v1/actionitems', getActionitems);
app.get('/api/v1/actionitems/:id', getActionitem);
app.post('/api/v1/actionitems', createActionitem);
app.put('/api/v1/actionitems/:id', updateActionitem);
app.delete('/api/v1/actionitems/:id', deleteActionitem);

describe('Action Item Controllers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Existing GET tests
  describe('GET /api/v1/actionitems', () => {
    it('should return all action items', async () => {
      // Mock data
      const mockActionitems = [
        {
          _id: '1',
          summary: 'Task 1',
          description: 'This is a description for Task 1',
          criticality: 'high',
          importance: 'important',
          dueDate: '2025-05-10T00:00:00.000Z',
        },
        {
          _id: '2',
          summary: 'Task 2',
          description: 'This is a description for Task 2',
          criticality: 'medium',
          importance: 'unimportant',
          dueDate: '2025-05-15T00:00:00.000Z',
        },
      ];

      // Set up mock
      Actionitem.find.mockResolvedValue(mockActionitems);

      // Execute test
      const response = await request(app).get('/api/v1/actionitems');

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockActionitems);
      expect(Actionitem.find).toHaveBeenCalled();
    });

    it('should handle errors and return 400', async () => {
      // Set up mock to throw error
      Actionitem.find.mockRejectedValue(new Error('Database error'));

      // Execute test
      const response = await request(app).get('/api/v1/actionitems');

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/actionitems/:id', () => {
    it('should return a single action item by ID', async () => {
      // Mock data
      const mockActionitem = { _id: '1', summary: 'Task 1' };

      // Set up mock
      Actionitem.findById.mockResolvedValue(mockActionitem);

      // Execute test
      const response = await request(app).get('/api/v1/actionitems/1');

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockActionitem);
      expect(Actionitem.findById).toHaveBeenCalledWith('1');
    });

    it('should return 400 if action item not found', async () => {
      // Set up mock to return null (not found)
      Actionitem.findById.mockResolvedValue(null);

      // Execute test
      const response = await request(app).get('/api/v1/actionitems/999');

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle errors and return 400', async () => {
      // Set up mock to throw error
      Actionitem.findById.mockRejectedValue(new Error('Invalid ID format'));

      // Execute test
      const response = await request(app).get('/api/v1/actionitems/invalid');

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // New tests for POST, PUT, DELETE
  describe('POST /api/v1/actionitems', () => {
    it('should create a new action item', async () => {
      // Test data
      const newItem = {
        summary: 'New Task',
        description: 'This is a new task',
        criticality: ['high'],
        importance: ['urgent'],
        status: ['pending'],
      };

      // Mock response data
      const createdItem = {
        _id: '3',
        ...newItem,
        createdAt: new Date().toISOString(),
      };

      // Set up mock
      Actionitem.create.mockResolvedValue(createdItem);

      // Execute test
      const response = await request(app)
        .post('/api/v1/actionitems')
        .send(newItem);

      // Assertions
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(createdItem);
      expect(Actionitem.create).toHaveBeenCalledWith(newItem);
    });

    it('should handle validation errors when creating', async () => {
      // Set up mock to throw error
      const validationError = new Error('Validation failed');
      Actionitem.create.mockRejectedValue(validationError);

      // Execute test
      const response = await request(app)
        .post('/api/v1/actionitems')
        .send({ summary: '' }); // Invalid data

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/actionitems/:id', () => {
    it('should update an existing action item', async () => {
      // Test data
      const itemId = '1';
      const updateData = {
        summary: 'Updated Task',
        status: ['completed'],
      };

      // Mock response data
      const updatedItem = {
        _id: itemId,
        summary: 'Updated Task',
        description: 'Original description',
        status: ['completed'],
        criticality: ['medium'],
        importance: ['normal'],
      };

      // Set up mock
      Actionitem.findByIdAndUpdate.mockResolvedValue(updatedItem);

      // Execute test
      const response = await request(app)
        .put(`/api/v1/actionitems/${itemId}`)
        .send(updateData);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedItem);
      expect(Actionitem.findByIdAndUpdate).toHaveBeenCalledWith(
        itemId,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );
    });

    it('should return 400 if item to update not found', async () => {
      // Set up mock to return null (not found)
      Actionitem.findByIdAndUpdate.mockResolvedValue(null);

      // Execute test
      const response = await request(app)
        .put('/api/v1/actionitems/999')
        .send({ summary: 'Updated Task' });

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle errors during update', async () => {
      // Set up mock to throw error
      Actionitem.findByIdAndUpdate.mockRejectedValue(
        new Error('Update failed')
      );

      // Execute test
      const response = await request(app)
        .put('/api/v1/actionitems/1')
        .send({ status: 'invalid-status' });

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/actionitems/:id', () => {
    it('should delete an action item', async () => {
      // Test data
      const itemId = '1';

      // Mock response data (typically a deleted item or success indicator)
      const deletedItem = { _id: itemId, summary: 'Task 1' };

      // Set up mock
      Actionitem.findByIdAndDelete.mockResolvedValue(deletedItem);

      // Execute test
      const response = await request(app).delete(
        `/api/v1/actionitems/${itemId}`
      );

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({});
      expect(Actionitem.findByIdAndDelete).toHaveBeenCalledWith(itemId);
    });

    it('should return 400 if item to delete not found', async () => {
      // Set up mock to return null (not found)
      Actionitem.findByIdAndDelete.mockResolvedValue(null);

      // Execute test
      const response = await request(app).delete('/api/v1/actionitems/999');

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle errors during deletion', async () => {
      // Set up mock to throw error
      Actionitem.findByIdAndDelete.mockRejectedValue(
        new Error('Delete failed')
      );

      // Execute test
      const response = await request(app).delete('/api/v1/actionitems/1');

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
