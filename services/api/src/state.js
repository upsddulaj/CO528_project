import { randomUUID } from 'node:crypto';

export const roles = ['student', 'alumni', 'admin'];

export function createStore() {
  return {
    users: [],
    posts: [],
    jobs: [],
    applications: [],
    events: [],
    rsvps: [],
    researchProjects: [],
    messages: [],
    notifications: []
  };
}

export function addNotification(store, userId, text, type = 'info') {
  const notification = {
    id: randomUUID(),
    userId,
    text,
    type,
    createdAt: new Date().toISOString(),
    read: false
  };
  store.notifications.push(notification);
  return notification;
}

export function analyticsOverview(store) {
  const activeUsers = new Set(store.posts.map((post) => post.authorId));
  const popularPosts = [...store.posts]
    .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    .slice(0, 5)
    .map((post) => ({
      id: post.id,
      content: post.content,
      likes: post.likes?.length || 0,
      comments: post.comments?.length || 0
    }));

  return {
    totalUsers: store.users.length,
    activeUsers: activeUsers.size,
    totalPosts: store.posts.length,
    totalJobs: store.jobs.length,
    totalApplications: store.applications.length,
    totalEvents: store.events.length,
    totalMessages: store.messages.length,
    popularPosts
  };
}
