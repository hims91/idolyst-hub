
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { getPool } = require('../db/connection');
const { ApiError } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/email');

// Helper to generate JWT tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }
  );
  
  const refreshToken = jwt.sign(
    { id: user.id }, 
    process.env.JWT_REFRESH_SECRET, 
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email and password are required');
    }
    
    const pool = getPool();
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      throw new ApiError(409, 'User with this email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Create new user
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, email_verified, reset_token, reset_token_expires) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, name, email, role, avatar_url, join_date`,
      [name, email, hashedPassword, 'member', false, verificationToken, verificationExpires]
    );
    
    const newUser = result.rows[0];
    
    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendEmail({
      to: email,
      subject: 'Verify your account',
      html: `<p>Please verify your account by clicking this link: <a href="${verificationUrl}">${verificationUrl}</a></p>`
    });
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser);
    
    // Store refresh token
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [newUser.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );
    
    res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar_url,
        joinDate: newUser.join_date
      },
      tokens: {
        accessToken,
        refreshToken
      },
      message: 'Registration successful. Please verify your email.'
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }
    
    const pool = getPool();
    
    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    const user = result.rows[0];
    
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Store refresh token
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );
    
    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar_url,
        joinDate: user.join_date,
        emailVerified: user.email_verified
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token is required');
    }
    
    const pool = getPool();
    
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new ApiError(403, 'Invalid refresh token');
    }
    
    // Check if token exists in database
    const tokenResult = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2 AND expires_at > NOW()',
      [refreshToken, decoded.id]
    );
    
    if (tokenResult.rows.length === 0) {
      throw new ApiError(403, 'Invalid or expired refresh token');
    }
    
    // Get user
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.id]
    );
    
    if (userResult.rows.length === 0) {
      throw new ApiError(404, 'User not found');
    }
    
    const user = userResult.rows[0];
    
    // Generate new access token
    const accessToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    res.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const pool = getPool();
    
    // Get user data
    const userResult = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.avatar_url, u.bio, u.company, 
       u.location, u.website, u.join_date, u.email_verified,
       (SELECT COUNT(*) FROM user_followers WHERE followed_id = u.id) as followers,
       (SELECT COUNT(*) FROM user_followers WHERE follower_id = u.id) as following,
       (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as posts
       FROM users u 
       WHERE u.id = $1`,
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      throw new ApiError(404, 'User not found');
    }
    
    const user = userResult.rows[0];
    
    // Get user social links
    const socialLinksResult = await pool.query(
      'SELECT platform, url FROM user_social_links WHERE user_id = $1',
      [req.user.id]
    );
    
    const socialLinks = {};
    
    socialLinksResult.rows.forEach(link => {
      socialLinks[link.platform] = link.url;
    });
    
    // Get user skills
    const skillsResult = await pool.query(
      'SELECT skill FROM user_skills WHERE user_id = $1',
      [req.user.id]
    );
    
    const skills = skillsResult.rows.map(row => row.skill);
    
    // Get user badges
    const badgesResult = await pool.query(
      `SELECT ub.id, r.title as name, r.icon 
       FROM user_rewards ub 
       JOIN rewards r ON ub.reward_id = r.id 
       WHERE ub.user_id = $1 AND r.category = 'badge'`,
      [req.user.id]
    );
    
    const badges = badgesResult.rows;
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar_url,
      bio: user.bio,
      company: user.company,
      location: user.location,
      website: user.website,
      joinDate: user.join_date,
      emailVerified: user.email_verified,
      followers: parseInt(user.followers),
      following: parseInt(user.following),
      posts: parseInt(user.posts),
      socialLinks,
      skills,
      badges
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    const pool = getPool();
    
    // Find user with this verification token
    const result = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );
    
    if (result.rows.length === 0) {
      throw new ApiError(400, 'Invalid or expired verification token');
    }
    
    // Update user
    await pool.query(
      'UPDATE users SET email_verified = true, reset_token = NULL, reset_token_expires = NULL WHERE id = $1',
      [result.rows[0].id]
    );
    
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new ApiError(400, 'Email is required');
    }
    
    const pool = getPool();
    
    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      // Don't reveal that the email doesn't exist
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent' });
    }
    
    const user = result.rows[0];
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    
    // Save reset token
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [resetToken, resetExpires, user.id]
    );
    
    // Send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: email,
      subject: 'Password Reset',
      html: `<p>You requested a password reset. Click this link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>
             <p>This link is valid for 1 hour.</p>`
    });
    
    res.json({ message: 'If an account with that email exists, a password reset link has been sent' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      throw new ApiError(400, 'Token and new password are required');
    }
    
    const pool = getPool();
    
    // Find user with this reset token
    const result = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );
    
    if (result.rows.length === 0) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }
    
    const user = result.rows[0];
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );
    
    // Invalidate all refresh tokens
    await pool.query(
      'DELETE FROM refresh_tokens WHERE user_id = $1',
      [user.id]
    );
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'Current password and new password are required');
    }
    
    const pool = getPool();
    
    // Get user
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      throw new ApiError(404, 'User not found');
    }
    
    const user = userResult.rows[0];
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!isPasswordValid) {
      throw new ApiError(401, 'Current password is incorrect');
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, user.id]
    );
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      const pool = getPool();
      
      // Delete refresh token
      await pool.query(
        'DELETE FROM refresh_tokens WHERE token = $1',
        [refreshToken]
      );
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
