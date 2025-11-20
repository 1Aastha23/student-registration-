// seed.js - run once to create sample courses
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Please set MONGODB_URI in .env');
  process.exit(1);
}

const CourseSchema = new mongoose.Schema({ name: String });
const Course = mongoose.model('Course', CourseSchema);

async function run() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const sampleCourses = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Business Administration'
  ];
  for (const name of sampleCourses) {
    const exists = await Course.findOne({ name });
    if (!exists) {
      await new Course({ name }).save();
      console.log('Created course:', name);
    } else {
      console.log('Already exists:', name);
    }
  }
  mongoose.connection.close();
}
run().catch(err => {
  console.error(err);
  process.exit(1);
});