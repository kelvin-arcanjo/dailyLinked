const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const scheduleForm = document.getElementById('schedule-form');
const contentInput = document.getElementById('content');
const scheduledAtInput = document.getElementById('scheduled-at');
const feedbackEl = document.getElementById('feedback');
const postsListEl = document.getElementById('posts-list');

const showFeedback = (message, type = 'success') => {
    feedbackEl.textContent = message;
    feedbackEl.className = `alert alert-${type}`;
    feedbackEl.classList.remove('hidden');
    setTimeout(() => feedbackEl.classList.add('hidden'), 5000);
};