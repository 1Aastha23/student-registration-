// main.js - for index.html (registration)
document.addEventListener('DOMContentLoaded', () => {
  const courseSelect = document.getElementById('course');
  const form = document.getElementById('regForm');
  const message = document.getElementById('message');

  async function loadCourses() {
    try {
      const res = await fetch('/api/courses');
      const courses = await res.json();
      courseSelect.innerHTML = '<option value="">Select a course</option>';
      courses.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c._id;
        opt.textContent = c.name;
        courseSelect.appendChild(opt);
      });
    } catch (err) {
      courseSelect.innerHTML = '<option value="">Failed to load courses</option>';
      console.error(err);
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('name').value.trim(),
      studentId: document.getElementById('studentId').value.trim(),
      rollNumber: document.getElementById('rollNumber').value.trim(),
      courseId: document.getElementById('course').value
    };
    if (!payload.courseId) {
      alert('Please select a course.');
      return;
    }
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        message.textContent = data.message || 'Registration failed';
        message.classList.remove('hidden');
        return;
      }
      // Redirect to dashboard with the new student id
      window.location.href = `/dashboard.html?studentId=${data.studentId}`;
    } catch (err) {
      console.error(err);
      message.textContent = 'Server error';
      message.classList.remove('hidden');
    }
  });

  loadCourses();
});