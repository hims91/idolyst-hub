const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { errorHandler, ApiError } = require('../middleware/errorHandler');

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(new ApiError(403, 'Access denied. Admin privileges required.'));
  }
};

// Get admin dashboard stats
router.get('/stats', auth, isAdmin, async (req, res, next) => {
  try {
    // This is a placeholder until proper DB integration
    const stats = {
      users: 1250,
      posts: 3845,
      comments: 12670,
      events: 87,
      summaryCards: [
        {
          title: 'New Users',
          value: 128,
          change: 14.5,
          trend: 'up'
        },
        {
          title: 'Active Users',
          value: 842,
          change: 5.3,
          trend: 'up'
        },
        {
          title: 'Revenue',
          value: 8470,
          change: -2.5,
          trend: 'down'
        },
        {
          title: 'Conversion Rate',
          value: 3.2,
          change: 1.2,
          trend: 'up'
        }
      ],
      userActivity: [
        { date: '2023-01', active: 600, new: 120 },
        { date: '2023-02', active: 650, new: 105 },
        { date: '2023-03', active: 680, new: 132 },
        { date: '2023-04', active: 720, new: 146 },
        { date: '2023-05', active: 750, new: 152 },
        { date: '2023-06', active: 790, new: 162 }
      ],
      contentDistribution: [
        { type: 'Posts', value: 45 },
        { type: 'Events', value: 15 },
        { type: 'Comments', value: 30 },
        { type: 'Projects', value: 10 }
      ],
      monthlyRevenue: [
        { month: 'Jan', revenue: 4200 },
        { month: 'Feb', revenue: 4500 },
        { month: 'Mar', revenue: 5100 },
        { month: 'Apr', revenue: 5400 },
        { month: 'May', revenue: 6200 },
        { month: 'Jun', revenue: 8470 }
      ]
    };
    
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Get admin users list
router.get('/users', auth, isAdmin, async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 10 } = req.query;
    
    // This is a placeholder until proper DB integration
    const users = [];
    for (let i = 0; i < limit; i++) {
      users.push({
        id: `user-${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        role: ['member', 'admin', 'moderator'][i % 3],
        status: ['active', 'pending', 'suspended'][i % 3],
        createdAt: new Date().toISOString()
      });
    }
    
    res.json({
      items: users,
      currentPage: parseInt(page),
      totalPages: 5,
      total: 50
    });
  } catch (error) {
    next(error);
  }
});

// Update user status or role
router.put('/users/:id', auth, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, role } = req.body;
    
    // This is a placeholder until DB integration
    const updatedUser = {
      id,
      status,
      role,
      // Other user fields would remain the same
    };
    
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// Get admin content (posts, events, campaigns)
router.get('/content', auth, isAdmin, async (req, res, next) => {
  try {
    const { type, status, search, page = 1, limit = 10 } = req.query;
    
    // This is a placeholder until proper DB integration
    const content = [];
    for (let i = 0; i < limit; i++) {
      content.push({
        id: `content-${i}`,
        title: `Content ${i}`,
        type: type || ['post', 'event', 'campaign'][i % 3],
        status: status || ['active', 'pending', 'rejected'][i % 3],
        author: {
          id: `user-${i % 5}`,
          name: `Author ${i % 5}`
        },
        createdAt: new Date().toISOString()
      });
    }
    
    res.json({
      items: content,
      currentPage: parseInt(page),
      totalPages: 5,
      total: 50
    });
  } catch (error) {
    next(error);
  }
});

// Moderate content
router.put('/content/:id', auth, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, moderationNote } = req.body;
    
    // This is a placeholder until DB integration
    const updatedContent = {
      id,
      status,
      moderationNote,
      // Other content fields would remain the same
    };
    
    res.json(updatedContent);
  } catch (error) {
    next(error);
  }
});

// Get system settings
router.get('/settings', auth, isAdmin, async (req, res, next) => {
  try {
    // This is a placeholder
    const settings = {
      system: {
        maintenanceMode: false,
        registrationEnabled: true,
        defaultUserRole: 'member'
      },
      email: {
        fromEmail: 'noreply@example.com',
        templates: {
          welcome: true,
          passwordReset: true,
          notification: true
        }
      },
      security: {
        mfaRequired: false,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireNumber: true,
          requireSpecial: true
        }
      }
    };
    
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// Update system settings
router.put('/settings', auth, isAdmin, async (req, res, next) => {
  try {
    const { system, email, security } = req.body;
    
    // This is a placeholder until DB integration
    const updatedSettings = {
      system,
      email,
      security
    };
    
    res.json(updatedSettings);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
