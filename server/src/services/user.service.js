// services/user.service.js
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Room from '../models/room.model.js';

export const signInUserService = async (userData) => {
  try {
    // Validate input
    if (!userData.email || !userData.password || !userData.username) {
      throw {
        statusCode: 400,
        message: 'All fields are required'
      };
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw {
        statusCode: 409,
        message: 'User already exists'
      };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create new user
    const newUser = new User({
      username: userData.username,
      email: userData.email,
      password: hashedPassword
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      },
      token
    };

  } catch (error) {
    console.error('Signup service error:', error);
    throw error; // Re-throw for controller to handle
  }
};

export const loginService = async (credentials) => {
  try {
    // Validate input
    if (!credentials.email || !credentials.password) {
      throw {
        statusCode: 400,
        message: 'Email and password are required'
      };
    }

    // Find user
    const user = await User.findOne({ email: credentials.email });
    if (!user) {
      throw {
        statusCode: 401,
        message: 'Invalid credentials'
      };
    }

    // Verify password
    const isMatch = await bcrypt.compare(credentials.password, user.password);
    if (!isMatch) {
      throw {
        statusCode: 401,
        message: 'Invalid credentials'
      };
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      token
    };

  } catch (error) {
    console.error('Login service error:', error);
    throw error;
  }
};

// Implement other service methods similarly...