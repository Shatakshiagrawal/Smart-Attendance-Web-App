import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Find the user by ID from either collection
            req.user = await Teacher.findById(decoded.userId).select('-password') || await Student.findById(decoded.userId).select('-password');
            
            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const teacherOnly = (req, res, next) => {
  // Check if the user is an instance of the Teacher model
  if (req.user && req.user instanceof Teacher) {
    next();
  } else {
    res.status(403);
    throw new Error("Access denied: This route is for teachers only.");
  }
};

const studentOnly = (req, res, next) => {
  // Check if the user is an instance of the Student model
  if (req.user && req.user instanceof Student) {
    next();
  } else {
    res.status(403);
    throw new Error("Access denied: This route is for students only.");
  }
};

export { protect, teacherOnly, studentOnly };