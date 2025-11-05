// Import the User model
const User = require('../models/userModel'); // Adjust the path as needed
const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    
    if (!username || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide username, email, and password.',
      });
    }

    const newUser = await User.create({
      username,
      email,
      password,
    });

    res.status(201).json({
      status: 'success',
      message: 'User created successfully.',
      data: {
        user: {
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          createdAt: newUser.createdAt,
        },
      },
    });
  } catch (error) {
    let message = 'An error occurred while creating the user.';
    let statusCode = 500; // Internal Server Error by default

   
    if (error.code === 11000) {
      statusCode = 409; // 409 Conflict
      const field = Object.keys(error.keyValue)[0];
      message = `An account with that ${field} already exists.`;
    }


    if (error.name === 'ValidationError') {
      statusCode = 400; // Bad Request
      message = Object.values(error.errors)
        .map((val) => val.message)
        .join('. ');
    }

    console.error('CREATE USER ERROR:', error); 

    res.status(statusCode).json({
      status: 'fail',
      message,
    });
  }
};

module.exports = {
  createUser,
};