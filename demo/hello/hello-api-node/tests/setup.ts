// Jest setup file for all tests
import dotenv from 'dotenv';

// Load environment variables from .env.example for tests
dotenv.config({ path: '.env.example' });

// Suppress console output during tests (optional)
// jest.spyOn(console, 'log').mockImplementation(() => {});
// jest.spyOn(console, 'error').mockImplementation(() => {});
