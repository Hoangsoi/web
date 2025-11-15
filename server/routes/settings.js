import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { getAllSettings, updateMultipleSettings } from '../models/Settings.js';

const router = express.Router();

// @route   GET /api/settings
// @desc    Get all settings (public for some, admin for others)
// @access  Public (for frontend to get banners, announcements, referral code)
router.get('/', async (req, res) => {
  try {
    const settings = await getAllSettings();
    
    // Parse JSON values
    const parsedSettings = {};
    for (const [key, value] of Object.entries(settings)) {
      try {
        parsedSettings[key] = JSON.parse(value);
      } catch {
        parsedSettings[key] = value;
      }
    }
    
    res.json(parsedSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/settings
// @desc    Update settings
// @access  Private/Admin
router.put('/', protect, admin, async (req, res) => {
  try {
    const { referral_code, banner_images, announcement_texts } = req.body;
    
    const settingsToUpdate = {};
    
    if (referral_code !== undefined) {
      settingsToUpdate.referral_code = referral_code;
    }
    
    if (banner_images !== undefined) {
      settingsToUpdate.banner_images = Array.isArray(banner_images) ? banner_images : [];
    }
    
    if (announcement_texts !== undefined) {
      settingsToUpdate.announcement_texts = Array.isArray(announcement_texts) ? announcement_texts : [];
    }
    
    if (Object.keys(settingsToUpdate).length === 0) {
      return res.status(400).json({ message: 'No settings to update' });
    }
    
    const updatedSettings = await updateMultipleSettings(settingsToUpdate);
    
    // Parse JSON values for response
    const parsedSettings = {};
    for (const [key, value] of Object.entries(updatedSettings)) {
      try {
        parsedSettings[key] = JSON.parse(value);
      } catch {
        parsedSettings[key] = value;
      }
    }
    
    res.json(parsedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

