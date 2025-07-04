const Joi = require('joi');

const email = Joi.string().email().required().messages({
  'string.email': 'Please enter a valid email address',
  'string.empty': 'Email is required',
});

const username = Joi.string()
  .min(3)
  .max(30)
  .pattern(/^[a-zA-Z0-9_]+$/)
  .required()
  .messages({
    'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
    'string.min': 'Username must be at least 3 characters',
    'string.max': 'Username cannot be longer than 30 characters',
    'string.empty': 'Username is required',
  });

const password = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
  .required()
  .messages({
    'string.pattern.base':
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    'string.min': 'Password must be at least 8 characters',
    'string.empty': 'Password is required',
  });

const name = Joi.string().min(2).max(100).required().messages({
  'string.min': 'Name must be at least 2 characters',
  'string.max': 'Name cannot be longer than 100 characters',
  'string.empty': 'Name is required',
});

const bio = Joi.string().max(500).allow('').optional().messages({
  'string.max': 'Bio cannot be longer than 500 characters',
});

const token = Joi.string().required().messages({
  'string.empty': 'Token is required',
});

exports.registerSchema = Joi.object({
  email,
  username,
  name,
  bio,
  password,
});

exports.loginSchema = Joi.object({
  identifier: Joi.alternatives()
    .try(
      email.label('email'),
      username.label('username')
    )
    .required()
    .messages({
      'alternatives.match': 'Please provide a valid email or username',
    }),
  password,
});

exports.forgotSchema = Joi.object({
  identifier: Joi.alternatives()
    .try(
      email.label('email'),
      username.label('username')
    )
    .required()
    .messages({
      'alternatives.match': 'Please provide a valid email or username',
    }),
});

exports.confirmSchema = Joi.object({
  email,
  token,
});
