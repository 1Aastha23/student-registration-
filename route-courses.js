// Simple example: GET /api/courses
const express = require('express');
const router = express.Router();
const Course = require('./models/course'); // mongoose model

router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find({}, { name: 1 }).lean();
    // Ensure we return an array, even if empty
    return res.json(courses);
  } catch (err) {
    console.error('GET /api/courses error:', err);
    return res.status(500).json({ message: 'Failed to load courses' });
  }
});

module.exports = router;