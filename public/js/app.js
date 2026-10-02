// EduVerse Main Application Entry
document.addEventListener('DOMContentLoaded', function() {
  try {
    if (typeof loadData === 'function') loadData();
    if (typeof syncSession === 'function') syncSession();
  } catch(e) {
    console.warn('EduVerse app initialization warning:', e);
  }
});
