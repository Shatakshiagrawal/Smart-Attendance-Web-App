import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  console.log('Attempting to generate token for userId:', userId);

  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    // --- FINAL FIX FOR LOCAL COOKIE STORAGE ---
    // We are now explicitly setting 'secure' to false for local development.
    // This will prevent the browser from blocking the cookie on an HTTP connection.
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false, // Explicitly set to false to allow on localhost
      sameSite: 'Lax', // Allows cross-origin cookies on localhost
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    console.log('Cookie has been set successfully with SameSite=Lax.');

  } catch (error) {
    console.error('!!! ERROR during token generation or cookie setting:', error);
  }
};

export default generateToken;
