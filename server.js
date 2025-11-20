// server.js - Express backend with Mongoose
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please set MONGODB_URI in .env');
  process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Mongoose models
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

const { Schema } = mongoose;

const CourseSchema = new Schema({
  name: { type: String, required: true, unique: true }
});
const Course = mongoose.model('Course', CourseSchema);

const StudentSchema = new Schema({
  name: { type: String, required: true },
  studentId: { type: String, required: true },
  rollNumber: { type: String, required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  createdAt: { type: Date, default: Date.now }
});
const Student = mongoose.model('Student', StudentSchema);

// --- API routes

// GET /api/courses - list courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ name: 1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/register - register a new student
app.post('/api/register', async (req, res) => {
  try {
    const { name, studentId, rollNumber, courseId } = req.body;
    if (!name || !studentId || !rollNumber || !courseId) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    // Optionally validate course exists
    const course = await Course.findById(courseId);
    if (!course) return res.status(400).json({ message: 'Invalid course' });

    const student = new Student({
      name,
      studentId,
      rollNumber,
      course: courseId
    });
    await student.save();
    res.json({ studentId: student._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/student/:id - get student details (populate course)
app.get('/api/student/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('course');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/stats - returns counts per course and total
app.get('/api/stats', async (req, res) => {
  try {
    const counts = await Student.aggregate([
      {
        $group: {
          _id: '$course',
          count: { $sum: 1 }
        }
      }
    ]);
    // join course names
    const results = [];
    for (const c of counts) {
      const course = await Course.findById(c._id);
      results.push({
        courseId: c._id,
        courseName: course ? course.name : 'Unknown',
        count: c.count
      });
    }
    const total = results.reduce((s, r) => s + r.count, 0);
    // Also include zero-count courses
    const allCourses = await Course.find();
    for (const ac of allCourses) {
      if (!results.find(r => String(r.courseId) === String(ac._id))) {
        results.push({ courseId: ac._id, courseName: ac.name, count: 0 });
      }
    }
    res.json({ totalStudents: total, perCourse: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fallback to index.html for any other routes (so front-end routing works)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));