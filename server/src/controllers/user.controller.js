// controllers/user.controller.js
import {
  loginService,
  logoutService,
  createRoomService,
  joinRoomService,
  signInUserService
} from '../services/user.service.js';

export const signInUser = async (req, res) => {
  try {
    console.log('Signup request received:', req.body);
    
    const response = await signInUserService(req.body);
    
    res.status(201).json({
      message: "User registered successfully",
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    const statusCode = error.statusCode || 500;
    const errorMessage = error.message || 'Registration failed';
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: error.details || null
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const response = await loginService(req.body);
    
    // Set HTTP-only cookie for authentication
    res.cookie('authToken', response.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({
      message: "Login successful",
      success: true,
      data: {
        user: response.user,
        // Don't send token in response body when using cookies
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    const statusCode = error.statusCode || 401; // Default to 401 for auth failures
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Authentication failed'
    });
  }
};

// Similar improvements for other controller methods...