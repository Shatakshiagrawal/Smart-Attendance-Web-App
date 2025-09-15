import asyncHandler from 'express-async-handler';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import jwt from 'jsonwebtoken';

// ... (registerUser function remains the same)
const registerUser = asyncHandler(async (req, res) => {
  try {
    const {
      role,
      email,
      password,
      name,
      enrollmentNo,
      currentSemester,
      deviceIdentifier,
    } = req.body;

    if (!role || !email || !password || !name) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }
    if (role === 'student' && !enrollmentNo) {
      return res.status(400).json({ message: 'Enrollment number is required for students.' });
    }
    if (role === 'student' && !deviceIdentifier) {
      return res.status(400).json({ message: 'Device identifier is required for students.' });
    }

    const userExists =
      role === 'teacher'
        ? await Teacher.findOne({ email })
        : await Student.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    let newUser;
    if (role === 'teacher') {
      newUser = await Teacher.create({ name, email, password });
    } else if (role === 'student') {
      newUser = await Student.create({
        name,
        email,
        password,
        enrollmentNo,
        currentSemester: currentSemester || 1,
        deviceIdentifier,
      });
    } else {
      return res.status(400).json({ message: 'Invalid user role specified.' });
    }

    if (newUser) {
      // CRITICAL CHECK: Ensure JWT_SECRET is available
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined. Please set it in your environment variables.');
        return res.status(500).json({ message: 'Server configuration error.' });
      }
      const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.enrollmentNo ? 'student' : 'teacher',
        token,
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'An internal server error occurred during registration.' });
  }
});


const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password, role, deviceIdentifier } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Please provide email, password, and role.' });
    }

    let UserCollection;
    if (role === 'teacher') {
      UserCollection = Teacher;
    } else if (role === 'student') {
      UserCollection = Student;
    } else {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }

    const user = await UserCollection.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (role === 'student' && user.deviceIdentifier !== deviceIdentifier) {
        return res.status(401).json({ message: 'Device not recognized. Please log in from your registered device.' });
      }
      
      // CRITICAL CHECK: Ensure JWT_SECRET is available
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined. Please set it in your environment variables.');
        return res.status(500).json({ message: 'Server configuration error.' });
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });

      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.enrollmentNo ? 'student' : 'teacher',
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'An internal server error occurred.' });
  }
});

// ... (getCurrentUser and logoutUser functions remain the same)
const getCurrentUser = asyncHandler(async (req, res) => {
    // The 'protect' middleware has already found the user and attached it to req.user.
    // So, we can just use it directly.
    const user = req.user;

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const isStudent = !!user.enrollmentNo;
    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: isStudent ? 'student' : 'teacher',
        ...(isStudent && {
            enrollmentNo: user.enrollmentNo,
            currentSemester: user.currentSemester,
        }),
    });
});

const logoutUser = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};


export { registerUser, loginUser, logoutUser, getCurrentUser };