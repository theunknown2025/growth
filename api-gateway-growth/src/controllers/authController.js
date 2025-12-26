const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { tokenOption } = require('../../conf');
const CompanyDetails = require('../models/CompanyDetails');

// User registration and login controller
const register = async (req, res) => {
  const { firstName, lastName, username, email, password, confirmpassword } = req.body;

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is taken' });
    }

    if (password !== confirmpassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password
    });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'error : ' + error.message });
  }
};


// User registration and login controller
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user._id,
      email: user.email,
    };
    const token = jwt.sign(payload, tokenOption.jwtSecret, { expiresIn: tokenOption.jwtExpirationDate });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'error : ' + error.message });
  }
};

// Get user information
const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'error : ' + error.message });
  }
};

// Update user information
const updateUser = async (req, res) => {
  const { firstName, lastName, username, email } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.username = username || user.username;
    user.email = email || user.email;

    await user.save();

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'error : ' + error.message });
  }
};

// Update user password
const updateUserPassword = async (req, res) => {
  const { password, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  }catch (error) {
    res.status(500).json({ message: 'error : ' + error.message });
  }
};

const createCompanyDetails = async (req, res) => {
  const { companyName, sectorOfActivity, size, yearsOfActivity, description } = req.body;

  try {
    const companyDetails = new CompanyDetails({
      companyName,
      sectorOfActivity,
      size,
      yearsOfActivity,
      description,
      user: req.user.id
    });

    await companyDetails.save();

    res.status(201).json({ message: 'Company details created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'error : ' + error.message });
  }
};

const getCompanyDetails = async (req, res) => {
  try {
    const companyDetails = await CompanyDetails.findOne({ user: req.user.id });
    if (!companyDetails) {
      return res.status(404).json({ message: 'Company details not found' });
    }
    res.json(companyDetails);
  } catch (error) {
    res.status(500).json({ message: 'error : ' + error.message });
  }
};

const updateCompanyDetails = async (req, res) => {
  const { companyName, sectorOfActivity, size, yearsOfActivity, description } = req.body;

  try {
    const companyDetails = await CompanyDetails.findOne({ user: req.user.id });
    if (!companyDetails) {
      return res.status(404).json({ message: 'Company details not found' });
    }

    companyDetails.companyName = companyName || companyDetails.companyName;
    companyDetails.sectorOfActivity = sectorOfActivity || companyDetails.sectorOfActivity;
    companyDetails.size = size || companyDetails.size;
    companyDetails.yearsOfActivity = yearsOfActivity || companyDetails.yearsOfActivity;
    companyDetails.description = description || companyDetails.description;

    await companyDetails.save();

    res.json({ message: 'Company details updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'error : ' + error.message });
  }
};


module.exports = { 
  register,
  login,
  me,
  updateUser,
  updateUserPassword,
  createCompanyDetails,
  getCompanyDetails,
  updateCompanyDetails
 };