import { createServer } from 'node:http';
import { createHash, randomUUID } from 'node:crypto';
import { URL } from 'node:url';
import { addNotification, analyticsOverview, createStore, roles } from './state.js';

const store = createStore();
const port = process.env.PORT || 4000;

function send(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS'
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch { resolve({}); }
    });
  });
}

function tokenFor(user) {
  const payload = JSON.stringify({ userId: user.id, role: user.role, name: user.name, email: user.email });
  return Buffer.from(payload).toString('base64url');
}

function userFromToken(req) {
  const auth = req.headers.authorization || '';
  const [, token] = auth.split(' ');
  if (!token) return null;
  try {
    return JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

function requireAuth(req, res) {
  const user = userFromToken(req);
  if (!user) {
    send(res, 401, { error: 'Missing or invalid token' });
    return null;
  }
  return user;
}

function requireRole(res, user, ...allowed) {
  if (!allowed.includes(user.role)) {
    send(res, 403, { error: 'Forbidden' });
    return false;
  }
  return true;
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 200, { ok: true });
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  if (req.method === 'GET' && path === '/health') return send(res, 200, { status: 'ok' });

  if (req.method === 'POST' && path === '/auth/register') {
    const { name, email, password, role = 'student' } = await parseBody(req);
    if (!name || !email || !password) return send(res, 400, { error: 'name, email, password required' });
    if (!roles.includes(role)) return send(res, 400, { error: `role must be one of ${roles.join(', ')}` });
    if (store.users.some((u) => u.email === email)) return send(res, 409, { error: 'email exists' });
    const user = { id: randomUUID(), name, email, role, bio: '', createdAt: new Date().toISOString(), passwordHash: createHash('sha256').update(password).digest('hex') };
    store.users.push(user);
    return send(res, 201, { token: tokenFor(user), user: sanitizeUser(user) });
  }

  if (req.method === 'POST' && path === '/auth/login') {
    const { email, password } = await parseBody(req);
    const user = store.users.find((u) => u.email === email);
    if (!user) return send(res, 401, { error: 'Invalid credentials' });
    const hash = createHash('sha256').update(password || '').digest('hex');
    if (hash !== user.passwordHash) return send(res, 401, { error: 'Invalid credentials' });
    return send(res, 200, { token: tokenFor(user), user: sanitizeUser(user) });
  }

  if (req.method === 'GET' && path === '/users/me') {
    const user = requireAuth(req, res); if (!user) return;
    const me = store.users.find((u) => u.id === user.userId);
    if (!me) return send(res, 404, { error: 'User not found' });
    return send(res, 200, sanitizeUser(me));
  }

  if (req.method === 'PUT' && path === '/users/me') {
    const auth = requireAuth(req, res); if (!auth) return;
    const body = await parseBody(req);
    const me = store.users.find((u) => u.id === auth.userId);
    if (!me) return send(res, 404, { error: 'User not found' });
    me.name = body.name ?? me.name;
    me.bio = body.bio ?? me.bio;
    return send(res, 200, sanitizeUser(me));
  }

  if (req.method === 'GET' && path === '/posts') {
    const user = requireAuth(req, res); if (!user) return;
    return send(res, 200, store.posts);
  }

  if (req.method === 'POST' && path === '/posts') {
    const user = requireAuth(req, res); if (!user) return;
    const { content, mediaUrl = null } = await parseBody(req);
    if (!content) return send(res, 400, { error: 'content required' });
    const post = { id: randomUUID(), content, mediaUrl, authorId: user.userId, authorName: user.name, likes: [], comments: [], shares: 0, createdAt: new Date().toISOString() };
    store.posts.unshift(post);
    return send(res, 201, post);
  }

  if (req.method === 'POST' && path.match(/^\/posts\/[^/]+\/like$/)) {
    const user = requireAuth(req, res); if (!user) return;
    const id = path.split('/')[2];
    const post = store.posts.find((p) => p.id === id);
    if (!post) return send(res, 404, { error: 'Post not found' });
    if (!post.likes.includes(user.userId)) post.likes.push(user.userId);
    return send(res, 200, { likes: post.likes.length });
  }

  if (req.method === 'POST' && path.match(/^\/posts\/[^/]+\/comment$/)) {
    const user = requireAuth(req, res); if (!user) return;
    const id = path.split('/')[2];
    const post = store.posts.find((p) => p.id === id);
    if (!post) return send(res, 404, { error: 'Post not found' });
    const body = await parseBody(req);
    if (!body.text) return send(res, 400, { error: 'text required' });
    const comment = { id: randomUUID(), text: body.text, userId: user.userId, userName: user.name, createdAt: new Date().toISOString() };
    post.comments.push(comment);
    return send(res, 201, comment);
  }

  if (req.method === 'GET' && path === '/jobs') {
    const user = requireAuth(req, res); if (!user) return;
    return send(res, 200, store.jobs);
  }

  if (req.method === 'POST' && path === '/jobs') {
    const user = requireAuth(req, res); if (!user) return;
    if (!requireRole(res, user, 'alumni', 'admin')) return;
    const body = await parseBody(req);
    if (!body.title || !body.company || !body.description) return send(res, 400, { error: 'title, company, description required' });
    const job = { id: randomUUID(), title: body.title, company: body.company, description: body.description, postedBy: user.userId, createdAt: new Date().toISOString() };
    store.jobs.push(job);
    return send(res, 201, job);
  }

  if (req.method === 'POST' && path.match(/^\/jobs\/[^/]+\/apply$/)) {
    const user = requireAuth(req, res); if (!user) return;
    if (!requireRole(res, user, 'student', 'alumni')) return;
    const id = path.split('/')[2];
    const job = store.jobs.find((j) => j.id === id);
    if (!job) return send(res, 404, { error: 'Job not found' });
    if (store.applications.some((a) => a.jobId === job.id && a.userId === user.userId)) return send(res, 409, { error: 'Already applied' });
    const body = await parseBody(req);
    const appn = { id: randomUUID(), jobId: job.id, userId: user.userId, statement: body.statement || '', createdAt: new Date().toISOString() };
    store.applications.push(appn);
    addNotification(store, job.postedBy, `${user.name} applied for ${job.title}`, 'job_application');
    return send(res, 201, appn);
  }

  if (req.method === 'GET' && path === '/events') {
    const user = requireAuth(req, res); if (!user) return;
    return send(res, 200, store.events);
  }

  if (req.method === 'POST' && path === '/events') {
    const user = requireAuth(req, res); if (!user) return;
    if (!requireRole(res, user, 'admin')) return;
    const body = await parseBody(req);
    if (!body.title || !body.date || !body.location) return send(res, 400, { error: 'title, date, location required' });
    const event = { id: randomUUID(), title: body.title, date: body.date, location: body.location, createdBy: user.userId, attendees: [] };
    store.events.push(event);
    return send(res, 201, event);
  }

  if (req.method === 'POST' && path.match(/^\/events\/[^/]+\/rsvp$/)) {
    const user = requireAuth(req, res); if (!user) return;
    const id = path.split('/')[2];
    const event = store.events.find((e) => e.id === id);
    if (!event) return send(res, 404, { error: 'Event not found' });
    if (!event.attendees.includes(user.userId)) event.attendees.push(user.userId);
    addNotification(store, event.createdBy, `${user.name} RSVP'd for ${event.title}`, 'event_rsvp');
    return send(res, 200, { attendees: event.attendees.length });
  }

  if (req.method === 'GET' && path === '/research/projects') {
    const user = requireAuth(req, res); if (!user) return;
    return send(res, 200, store.researchProjects);
  }

  if (req.method === 'POST' && path === '/research/projects') {
    const user = requireAuth(req, res); if (!user) return;
    const body = await parseBody(req);
    if (!body.title || !body.summary) return send(res, 400, { error: 'title, summary required' });
    const project = { id: randomUUID(), title: body.title, summary: body.summary, ownerId: user.userId, collaboratorIds: [] };
    store.researchProjects.push(project);
    return send(res, 201, project);
  }

  if (req.method === 'POST' && path.match(/^\/research\/projects\/[^/]+\/invite$/)) {
    const user = requireAuth(req, res); if (!user) return;
    const id = path.split('/')[3];
    const body = await parseBody(req);
    const project = store.researchProjects.find((r) => r.id === id);
    if (!project) return send(res, 404, { error: 'Project not found' });
    if (project.ownerId !== user.userId) return send(res, 403, { error: 'Only owner can invite' });
    if (!store.users.some((u) => u.id === body.userId)) return send(res, 404, { error: 'Invitee not found' });
    if (!project.collaboratorIds.includes(body.userId)) project.collaboratorIds.push(body.userId);
    addNotification(store, body.userId, `You were invited to research project: ${project.title}`, 'research_invite');
    return send(res, 200, project);
  }

  if (req.method === 'POST' && path === '/messages/direct') {
    const user = requireAuth(req, res); if (!user) return;
    const body = await parseBody(req);
    if (!body.toUserId || !body.text) return send(res, 400, { error: 'toUserId, text required' });
    const msg = { id: randomUUID(), fromUserId: user.userId, toUserId: body.toUserId, text: body.text, createdAt: new Date().toISOString() };
    store.messages.push(msg);
    addNotification(store, body.toUserId, `New message from ${user.name}`, 'message');
    return send(res, 201, msg);
  }

  if (req.method === 'GET' && path === '/messages') {
    const user = requireAuth(req, res); if (!user) return;
    return send(res, 200, store.messages.filter((m) => m.fromUserId === user.userId || m.toUserId === user.userId));
  }

  if (req.method === 'GET' && path === '/notifications') {
    const user = requireAuth(req, res); if (!user) return;
    return send(res, 200, store.notifications.filter((n) => n.userId === user.userId));
  }

  if (req.method === 'GET' && path === '/analytics/overview') {
    const user = requireAuth(req, res); if (!user) return;
    if (!requireRole(res, user, 'admin')) return;
    return send(res, 200, analyticsOverview(store));
  }

  if (req.method === 'GET' && path === '/debug/store') return send(res, 200, store);

  return send(res, 404, { error: 'Not found' });
});

server.listen(port, () => {
  console.log(`DECP API listening on http://localhost:${port}`);
});
