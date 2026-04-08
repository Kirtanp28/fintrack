const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fintrack_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// POST /api/auth/signup
const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    user = new User({
      name,
      email,
      password,
      currency: 'USD'
    });

    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, currency: user.currency }
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, currency: user.currency }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, currency: user.currency }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (req.body.name) user.name = req.body.name;
    if (req.body.currency) user.currency = req.body.currency;

    await user.save();

    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, currency: user.currency }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { signup, login, getMe, updateProfile };
