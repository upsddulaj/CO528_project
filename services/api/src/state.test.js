import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore, analyticsOverview, addNotification } from './state.js';

test('analytics overview summarizes values', () => {
  const store = createStore();
  store.users.push({ id: 'u1' }, { id: 'u2' });
  store.posts.push({ id: 'p1', authorId: 'u1', content: 'Hello', likes: ['u2'], comments: [] });
  store.jobs.push({ id: 'j1' });
  store.applications.push({ id: 'a1' });

  const overview = analyticsOverview(store);
  assert.equal(overview.totalUsers, 2);
  assert.equal(overview.activeUsers, 1);
  assert.equal(overview.totalApplications, 1);
  assert.equal(overview.popularPosts.length, 1);
});

test('addNotification appends notification', () => {
  const store = createStore();
  const note = addNotification(store, 'u1', 'test');
  assert.equal(store.notifications.length, 1);
  assert.equal(note.userId, 'u1');
});
