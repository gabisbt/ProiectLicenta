import {User} from '../models/userSchema.js';
import jwt from 'jsonwebtoken';
import ErrorHandler from './error.js';
import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    let token;
    
    if (req.cookies.token) {
      token = req.cookies.token;
    } 
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return next(new ErrorHandler("User not authenticated", 401));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = await User.findById(decoded.id);
      next();
    } catch (error) {
      return next(new ErrorHandler("Invalid token", 401));
    }
  });

export const isAuthorized = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)){
            return next(
                new ErrorHandler(`${req.user.role} not allowed to access this resource`, 
                403
                )
            );
        }
        next();
    };
}