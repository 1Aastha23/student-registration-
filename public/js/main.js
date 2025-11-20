// main.js - improved for index.html (registration)
document.addEventListener('DOMContentLoaded', () => {
  const courseSelect = document.getElementById('course');
  const form = document.getElementById('regForm');
  const message = document.getElementById('message');

  if (!courseSelect) {
    console.error('Missing element: #course');
    return;
  }

  async function loadCourses() {
    courseSelect.innerHTML = '<option value="">Loading courses...</option>';
    courseSelect.disabled = true;

    try {
      console.info('Fetching /api/courses (no-cache)');
      // disable cache to avoid 304 responses with empty body
      const res = await fetch('/api/courses', { cache: 'no-store' });

      // helpful logging for debugging
      console.info('Courses response status:', res.status, res.statusText);

      if (!res.ok) {
        // read text so we can log any error payload
        let bodyText = '';
        try { bodyText = await res.text(); } catch (e) { bodyText = `<no body: ${e.message}>`; }
        console.error('Failed to load courses. status=', res.status, 'body=', bodyText);
        courseSelect.innerHTML = '<option value="">Failed to load courses</option>';
        courseSelect.disabled = false;
        return;
      }

      // Parse JSON only for OK responses
      const courses = await res.json();
      if (!Array.isArray(courses)) {
        console.error('Expected array for courses but got:', courses);
        courseSelect.innerHTML = '<option value="">No courses available</option>';
        courseSelect.disabled = false;
        return;
      }

      courseSelect.innerHTML = '<option value="">Select a course</option>';
      courses.forEach(c => {
        const id = c._id || c.id || '';
        const name = c.name || c.title || 'Unnamed course';
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = name;
        courseSelect.appendChild(opt);
      });
      courseSelect.disabled = false;
      console.info('Loaded', courses.length, 'courses');
    } catch (err) {
      console.error('Error loading courses:', err);
      courseSelect.innerHTML = '<option value="">Failed to load courses</option>';
      courseSelect.disabled = false;
    }
  }

  form && form.addEventListener('submit', async (e) => {
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
        message && (message.textContent = data.message || 'Registration failed');
        message && message.classList.remove('hidden');
        return;
      }
      window.location.href = `/dashboard.html?studentId=${encodeURIComponent(data.studentId)}`;
    } catch (err) {
      console.error(err);
      message && (message.textContent = 'Server error');
      message && message.classList.remove('hidden');
    }
  });

  loadCourses();
});