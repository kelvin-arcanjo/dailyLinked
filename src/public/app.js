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

// Get JWT Token from OAuth and clean URL... 
const urlParams = new URLSearchParams(window.location.search);
const urlToken = urlParams.get('token');
if (urlToken) {
    localStorage.setItem('dailylinked_token', urlToken);
    window.history.replaceState({}, document.title, '/');
}

const getToken = () => localStorage.getItem('dailylinked_token');

const logout = () => {
    localStorage.removeItem('dailylinked_token');
    dashboardView.classList.add('hidden');
    loginView.classList.remove('hidden');
};

logoutBtn.addEventListener('click', logout);

// Load profile of atutenticated user...
const loadProfile = async () => {
    const token = getToken();
    if (!token) {
        loginView.classList.remove('hidden');
        return;
    }

    try {
        const res = await fetch('/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Sessão inválida ou expirada');

        const data = await res.json();
        const user = data.user || data;

        userName.textContent = user.name || 'Utilizador LinkedIn';
        userEmail.textContent = user.email || '';
        if (user.avatar_url) {
            userAvatar.src = user.avatar_url;
        } else {
            userAvatar.style.display = 'none';
        }

        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        loadPosts();
    } catch (err) {
        console.error(err);
        logout();
    }
};