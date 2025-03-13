const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { errorHandler, ApiError } = require('../middleware/errorHandler');

// Get all campaigns with optional filtering
router.get('/campaigns', async (req, res, next) => {
  try {
    const { category, status, page = 1, limit = 10 } = req.query;
    
    // This is a placeholder until proper DB integration
    const campaigns = [];
    for (let i = 0; i < limit; i++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      campaigns.push({
        id: `campaign-${i}`,
        title: `Sample Campaign ${i}`,
        description: `This is a sample campaign description for campaign ${i}`,
        goalAmount: 50000,
        currentAmount: Math.floor(Math.random() * 50000),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        category: ['Tech', 'Health', 'Education', 'Environment'][i % 4],
        status: ['active', 'completed', 'pending'][i % 3],
        creator: {
          id: 'user-1',
          name: 'Sample Creator'
        },
        backerCount: Math.floor(Math.random() * 100)
      });
    }
    
    res.json({
      campaigns,
      currentPage: parseInt(page),
      totalPages: 5,
      hasMore: parseInt(page) < 5
    });
  } catch (error) {
    next(error);
  }
});

// Get a single campaign by ID
router.get('/campaigns/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // This is a placeholder
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    
    const campaign = {
      id,
      title: 'Sample Campaign',
      description: 'This is a sample campaign description',
      goalAmount: 50000,
      currentAmount: 25000,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      category: 'Tech',
      status: 'active',
      creator: {
        id: 'user-1',
        name: 'Sample Creator'
      },
      backerCount: 50,
      updates: [
        {
          id: 'update-1',
          title: 'Progress Update',
          content: 'We are making great progress!',
          createdAt: new Date().toISOString()
        }
      ],
      backers: [
        { id: 'user-2', name: 'Backer 1', amount: 1000 },
        { id: 'user-3', name: 'Backer 2', amount: 500 }
      ]
    };
    
    res.json(campaign);
  } catch (error) {
    next(error);
  }
});

// Create a new campaign
router.post('/campaigns', auth, async (req, res, next) => {
  try {
    const { 
      title, description, goalAmount, startDate, 
      endDate, category 
    } = req.body;
    
    if (!title || !description || !goalAmount || !startDate || !endDate) {
      throw new ApiError(400, 'Required fields missing');
    }
    
    // This is a placeholder until DB integration
    const newCampaign = {
      id: `campaign-${Date.now()}`,
      title,
      description,
      goalAmount,
      currentAmount: 0,
      startDate,
      endDate,
      category: category || 'Other',
      status: 'pending', // Campaigns might need approval before going live
      creator: {
        id: req.user.id,
        name: req.user.name
      },
      backerCount: 0
    };
    
    res.status(201).json(newCampaign);
  } catch (error) {
    next(error);
  }
});

// Update a campaign
router.put('/campaigns/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      title, description, goalAmount, endDate, category 
    } = req.body;
    
    // This is a placeholder until DB integration
    // In real app, check if campaign exists, user has permission,
    // and campaign is in a state that allows updates
    
    const updatedCampaign = {
      id,
      title,
      description,
      goalAmount,
      endDate,
      category,
      // Other fields would remain the same
    };
    
    res.json(updatedCampaign);
  } catch (error) {
    next(error);
  }
});

// Delete a campaign
router.delete('/campaigns/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // This is a placeholder until DB integration
    // In real app, check if campaign exists, user has permission,
    // and campaign is in a state that allows deletion
    
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Back a campaign
router.post('/campaigns/:id/back', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, isAnonymous } = req.body;
    
    if (!amount || amount <= 0) {
      throw new ApiError(400, 'Valid amount is required');
    }
    
    // This is a placeholder
    // In real app, process payment and update campaign
    
    const newBacking = {
      id: `backing-${Date.now()}`,
      campaignId: id,
      backer: {
        id: req.user.id,
        name: isAnonymous ? 'Anonymous' : req.user.name
      },
      amount,
      createdAt: new Date().toISOString(),
      isAnonymous: isAnonymous || false
    };
    
    res.status(201).json(newBacking);
  } catch (error) {
    next(error);
  }
});

// Add an update to a campaign
router.post('/campaigns/:id/updates', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    
    if (!title || !content) {
      throw new ApiError(400, 'Title and content are required');
    }
    
    // This is a placeholder
    // In real app, check if campaign exists and user has permission
    
    const newUpdate = {
      id: `update-${Date.now()}`,
      campaignId: id,
      title,
      content,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json(newUpdate);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
