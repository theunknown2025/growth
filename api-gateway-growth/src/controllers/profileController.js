const User = require('../models/User');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -__v -createdAt -updatedAt'); // Exclude sensitive fields

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || ''
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile: ' + error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, username, email, bio } = req.body;

    // Check if username or email is being changed to a value that already exists
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        firstName,
        lastName,
        username,
        email,
        bio
      },
      { new: true, select: '-password -__v -createdAt -updatedAt' }
    );

    res.json({
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      username: updatedUser.username,
      email: updatedUser.email,
      bio: updatedUser.bio || '',
      avatarUrl: updatedUser.avatarUrl || ''
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile: ' + error.message });
  }
};

// Update password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating password: ' + error.message });
  }
};

module.exports = { getProfile, updateProfile, updatePassword };