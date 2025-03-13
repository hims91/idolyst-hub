
const { getPool } = require('../db/connection');
const { ApiError } = require('../middleware/errorHandler');
const { s3 } = require('../utils/s3');

exports.getAllUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const pool = getPool();
    
    // Build query
    let query = `
      SELECT id, name, email, role, status, avatar_url as avatar, join_date as createdAt
      FROM users
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCounter = 1;
    
    if (search) {
      query += ` AND (name ILIKE $${paramCounter} OR email ILIKE $${paramCounter})`;
      queryParams.push(`%${search}%`);
      paramCounter++;
    }
    
    if (role) {
      query += ` AND role = $${paramCounter}`;
      queryParams.push(role);
      paramCounter++;
    }
    
    if (status) {
      query += ` AND status = $${paramCounter}`;
      queryParams.push(status);
      paramCounter++;
    }
    
    // Add pagination
    query += ` ORDER BY join_date DESC LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    queryParams.push(limit, offset);
    
    // Get users
    const result = await pool.query(query, queryParams);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) FROM users
      WHERE 1=1
      ${search ? ` AND (name ILIKE $1 OR email ILIKE $1)` : ''}
      ${role ? ` AND role = $${search ? 2 : 1}` : ''}
      ${status ? ` AND status = $${search ? (role ? 3 : 2) : (role ? 2 : 1)}` : ''}
    `;
    
    const countParams = [];
    if (search) countParams.push(`%${search}%`);
    if (role) countParams.push(role);
    if (status) countParams.push(status);
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      items: result.rows,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const pool = getPool();
    
    // Get basic user data
    const userResult = await pool.query(
      `SELECT u.id, u.name, u.role, u.avatar_url, u.bio, u.company, 
       u.location, u.website, u.join_date,
       (SELECT COUNT(*) FROM user_followers WHERE followed_id = u.id) as followers,
       (SELECT COUNT(*) FROM user_followers WHERE follower_id = u.id) as following,
       (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as posts
       FROM users u 
       WHERE u.id = $1`,
      [id]
    );
    
    if (userResult.rows.length === 0) {
      throw new ApiError(404, 'User not found');
    }
    
    const user = userResult.rows[0];
    
    // Get social links
    const socialLinksResult = await pool.query(
      'SELECT platform, url FROM user_social_links WHERE user_id = $1',
      [id]
    );
    
    const socialLinks = {};
    
    socialLinksResult.rows.forEach(link => {
      socialLinks[link.platform] = link.url;
    });
    
    // Get skills
    const skillsResult = await pool.query(
      'SELECT skill FROM user_skills WHERE user_id = $1',
      [id]
    );
    
    const skills = skillsResult.rows.map(row => row.skill);
    
    // Get badges
    const badgesResult = await pool.query(
      `SELECT ub.id, r.title as name, r.icon 
       FROM user_rewards ub 
       JOIN rewards r ON ub.reward_id = r.id 
       WHERE ub.user_id = $1 AND r.category = 'badge'`,
      [id]
    );
    
    // Check if authenticated user is following this user
    let isFollowing = false;
    if (req.user) {
      const followingResult = await pool.query(
        'SELECT * FROM user_followers WHERE follower_id = $1 AND followed_id = $2',
        [req.user.id, id]
      );
      isFollowing = followingResult.rows.length > 0;
    }
    
    res.json({
      id: user.id,
      name: user.name,
      role: user.role,
      avatar: user.avatar_url,
      bio: user.bio,
      company: user.company,
      location: user.location,
      website: user.website,
      joinDate: user.join_date,
      followers: parseInt(user.followers),
      following: parseInt(user.following),
      posts: parseInt(user.posts),
      socialLinks,
      skills,
      badges: badgesResult.rows,
      isFollowing
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, company, location, website, skills, socialLinks } = req.body;
    
    const pool = getPool();
    
    await pool.query('BEGIN');
    
    try {
      // Update user table
      await pool.query(
        `UPDATE users 
         SET name = COALESCE($1, name),
             bio = COALESCE($2, bio),
             company = COALESCE($3, company),
             location = COALESCE($4, location),
             website = COALESCE($5, website)
         WHERE id = $6`,
        [name, bio, company, location, website, req.user.id]
      );
      
      // Update skills if provided
      if (skills && Array.isArray(skills)) {
        // Delete existing skills
        await pool.query(
          'DELETE FROM user_skills WHERE user_id = $1',
          [req.user.id]
        );
        
        // Add new skills
        for (const skill of skills) {
          await pool.query(
            'INSERT INTO user_skills (user_id, skill) VALUES ($1, $2)',
            [req.user.id, skill]
          );
        }
      }
      
      // Update social links if provided
      if (socialLinks && typeof socialLinks === 'object') {
        // Delete existing links
        await pool.query(
          'DELETE FROM user_social_links WHERE user_id = $1',
          [req.user.id]
        );
        
        // Add new links
        for (const [platform, url] of Object.entries(socialLinks)) {
          if (url) {
            await pool.query(
              'INSERT INTO user_social_links (user_id, platform, url) VALUES ($1, $2, $3)',
              [req.user.id, platform, url]
            );
          }
        }
      }
      
      await pool.query('COMMIT');
      
      // Get updated user profile
      const userResult = await pool.query(
        'SELECT id, name, role, avatar_url, bio, company, location, website, join_date FROM users WHERE id = $1',
        [req.user.id]
      );
      
      const updatedUser = userResult.rows[0];
      
      // Get updated social links
      const socialLinksResult = await pool.query(
        'SELECT platform, url FROM user_social_links WHERE user_id = $1',
        [req.user.id]
      );
      
      const updatedSocialLinks = {};
      
      socialLinksResult.rows.forEach(link => {
        updatedSocialLinks[link.platform] = link.url;
      });
      
      // Get updated skills
      const skillsResult = await pool.query(
        'SELECT skill FROM user_skills WHERE user_id = $1',
        [req.user.id]
      );
      
      const updatedSkills = skillsResult.rows.map(row => row.skill);
      
      res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        role: updatedUser.role,
        avatar: updatedUser.avatar_url,
        bio: updatedUser.bio,
        company: updatedUser.company,
        location: updatedUser.location,
        website: updatedUser.website,
        joinDate: updatedUser.join_date,
        socialLinks: updatedSocialLinks,
        skills: updatedSkills
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

exports.updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No image file uploaded');
    }
    
    const pool = getPool();
    
    // Update user with new avatar URL
    await pool.query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2',
      [req.file.location, req.user.id]
    );
    
    res.json({
      avatar: req.file.location,
      message: 'Avatar updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.followUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (req.user.id === id) {
      throw new ApiError(400, 'You cannot follow yourself');
    }
    
    const pool = getPool();
    
    // Check if user exists
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    if (userResult.rows.length === 0) {
      throw new ApiError(404, 'User not found');
    }
    
    // Check if already following
    const followingResult = await pool.query(
      'SELECT * FROM user_followers WHERE follower_id = $1 AND followed_id = $2',
      [req.user.id, id]
    );
    
    if (followingResult.rows.length > 0) {
      return res.json({ message: 'Already following this user' });
    }
    
    // Create follow relationship
    await pool.query(
      'INSERT INTO user_followers (follower_id, followed_id) VALUES ($1, $2)',
      [req.user.id, id]
    );
    
    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    next(error);
  }
};

exports.unfollowUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const pool = getPool();
    
    // Delete follow relationship
    await pool.query(
      'DELETE FROM user_followers WHERE follower_id = $1 AND followed_id = $2',
      [req.user.id, id]
    );
    
    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    next(error);
  }
};

exports.getFollowers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const pool = getPool();
    
    // Get followers
    const result = await pool.query(
      `SELECT u.id, u.name, u.role, u.avatar_url as avatar
       FROM user_followers f
       JOIN users u ON f.follower_id = u.id
       WHERE f.followed_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );
    
    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM user_followers WHERE followed_id = $1',
      [req.user.id]
    );
    
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      items: result.rows,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
};

exports.getFollowing = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const pool = getPool();
    
    // Get users being followed
    const result = await pool.query(
      `SELECT u.id, u.name, u.role, u.avatar_url as avatar
       FROM user_followers f
       JOIN users u ON f.followed_id = u.id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );
    
    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM user_followers WHERE follower_id = $1',
      [req.user.id]
    );
    
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      items: result.rows,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
};
