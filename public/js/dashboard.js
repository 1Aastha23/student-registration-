// dashboard.js - for dashboard.html
document.addEventListener('DOMContentLoaded', async () => {
  const qs = new URLSearchParams(location.search);
  const studentId = qs.get('studentId');
  const welcome = document.getElementById('welcome');
  const details = document.getElementById('student-details');
  const statsList = document.getElementById('stats-list');

  if (!studentId) {
    welcome.innerHTML = '<p class="small">No student selected. <a href="/">Go back to register</a></p>';
    return;
  }

  try {
    const [studentRes, statsRes] = await Promise.all([
      fetch(`/api/student/${studentId}`),
      fetch('/api/stats')
    ]);
    if (!studentRes.ok) {
      welcome.innerHTML = '<p class="small">Student not found. <a href="/">Register</a></p>';
      return;
    }
    const student = await studentRes.json();
    const stats = await statsRes.json();

    welcome.innerHTML = `<h2>Welcome, ${escapeHtml(student.name)}!</h2>
      <p class="small">You are registered for <strong>${escapeHtml(student.course.name)}</strong>.</p>`;

    details.innerHTML = `
      <h3>Your details</h3>
      <p><strong>Name:</strong> ${escapeHtml(student.name)}</p>
      <p><strong>Student ID:</strong> ${escapeHtml(student.studentId)}</p>
      <p><strong>Roll Number:</strong> ${escapeHtml(student.rollNumber)}</p>
      <p class="small">Registered on: ${new Date(student.createdAt).toLocaleString()}</p>
    `;

    // Build stats list
    const total = stats.totalStudents || 0;
    // Make sure we map by courseId
    const perCourse = stats.perCourse || [];
    // Sort by count desc
    perCourse.sort((a,b) => b.count - a.count);

    statsList.innerHTML = '';
    perCourse.forEach(pc => {
      const row = document.createElement('div');
      row.className = 'stat-row';
      const label = document.createElement('div');
      label.innerHTML = `<strong>${escapeHtml(pc.courseName)}</strong> <span class="small">(${pc.count} students)</span>`;
      const barWrap = document.createElement('div');
      barWrap.style.display = 'flex';
      barWrap.style.alignItems = 'center';

      const pct = total === 0 ? 0 : Math.round((pc.count / total) * 100);
      const progress = document.createElement('div');
      progress.className = 'progress';
      const inner = document.createElement('i');
      inner.style.width = pct + '%';
      progress.appendChild(inner);

      // highlight the logged-in user's course
      if (String(pc.courseId) === String(student.course._id)) {
        label.innerHTML += ' <span style="color:var(--accent); font-weight:600;">(Your course)</span>';
        inner.style.background = '#0a9d58'; // different color for user's course
      }

      barWrap.appendChild(progress);
      row.appendChild(label);
      row.appendChild(barWrap);
      statsList.appendChild(row);
    });

    // Also show a focused comparison for the student's course
    const myCourse = perCourse.find(p => String(p.courseId) === String(student.course._id));
    const myCount = myCourse ? myCourse.count : 0;
    const percent = total === 0 ? 0 : Math.round((myCount / total) * 100);
    const summary = document.createElement('div');
    summary.className = 'card';
    summary.style.marginTop = '12px';
    summary.innerHTML = `<h3>Summary</h3>
      <p class="small">Out of <strong>${total}</strong> registered students, <strong>${myCount}</strong> chose <strong>${escapeHtml(student.course.name)}</strong> (${percent}%).</p>`;
    statsList.appendChild(summary);

  } catch (err) {
    console.error(err);
    welcome.innerHTML = '<p class="small">Failed to load dashboard. Try again later.</p>';
  }
});

// small helper
function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}