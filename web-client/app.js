const API = 'http://localhost:4000';
let token = '';

const logEl = document.getElementById('log');
const feedList = document.getElementById('feedList');

function log(msg) {
  logEl.textContent = `${new Date().toLocaleTimeString()} ${msg}\n` + logEl.textContent;
}

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const payload = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      role: document.getElementById('role').value
    };
    const result = await api('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    token = result.token;
    log(`Logged in as ${result.user.name} (${result.user.role})`);
  } catch (err) {
    log(err.message);
  }
});

document.getElementById('postForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const content = document.getElementById('content').value;
    await api('/posts', { method: 'POST', body: JSON.stringify({ content }) });
    log('Post published');
    document.getElementById('content').value = '';
    refreshFeed();
  } catch (err) {
    log(err.message);
  }
});

async function refreshFeed() {
  try {
    const posts = await api('/posts');
    feedList.innerHTML = posts
      .map((p) => `<li><strong>${p.authorName}:</strong> ${p.content}<br><small>👍 ${p.likes.length} | 💬 ${p.comments.length}</small></li>`)
      .join('');
  } catch (err) {
    log(err.message);
  }
}

document.getElementById('refreshFeed').addEventListener('click', refreshFeed);
