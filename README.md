# Department Engagement & Career Platform (DECP)

A service-oriented platform for Department of Computer Engineering students, alumni, and admins to collaborate on careers, research, community events, and communication.

## Scope
This repository provides a **mini-project implementation blueprint** focused on:
- architecture and modularity,
- web/mobile API integration,
- cloud-ready deployment model,
- quality attribute rationale,
- deliverable-ready documentation.

## Core Modules
1. **User Management Service**
   - Register/login
   - Profile management
   - Role-based access (`student`, `alumni`, `admin`)
2. **Feed & Media Service**
   - Text/media posts
   - Like/comment/share
3. **Jobs & Internships Service**
   - Opportunity posting
   - Applications
4. **Events & Announcements Service**
   - Event/workshop publishing
   - RSVP tracking
5. **Research Collaboration Service**
   - Project creation
   - Collaboration invites
   - Document references
6. **Messaging Service**
   - Direct messaging
   - Group chat channels
7. **Notification Service**
   - Event-driven notifications
   - Push/in-app strategy
8. **Analytics Service**
   - Active users
   - Popular posts
   - Application trends

## Architecture Artifacts
All required architecture documentation is available under [`docs/`](docs):
- [SOA + enterprise + modularity + deployment diagrams](docs/architecture.md)
- [Research analysis and design improvements](docs/research.md)
- [Implementation details and module communication](docs/implementation.md)
- [Cloud deployment and scalability details](docs/cloud-deployment.md)
- [Role allocation and 4-week execution plan](docs/project-plan.md)

## Suggested Technology Stack
- **Backend services**: Node.js (NestJS/Express) or Spring Boot
- **Web client**: React
- **Mobile client**: Flutter or React Native
- **API style**: REST (common API for web + mobile)
- **Database**: PostgreSQL
- **Cache**: Redis
- **Message broker**: RabbitMQ/Kafka
- **Media/document storage**: AWS S3 / GCP Cloud Storage / Azure Blob
- **Observability**: OpenTelemetry + Prometheus + Grafana

## API Boundary (High Level)
- `POST /auth/register`, `POST /auth/login`, `GET /users/:id`
- `POST /posts`, `GET /posts`, `POST /posts/:id/like`, `POST /posts/:id/comment`
- `POST /jobs`, `GET /jobs`, `POST /jobs/:id/apply`
- `POST /events`, `GET /events`, `POST /events/:id/rsvp`
- `POST /research/projects`, `POST /research/projects/:id/invite`
- `POST /messages/direct`, `POST /messages/groups/:id/send`
- `GET /notifications`, `POST /notifications/subscribe`
- `GET /analytics/overview`

## Recommended Folder Structure (Implementation)
```text
.
├── web-client/
├── mobile-client/
├── services/
│   ├── api-gateway/
│   ├── auth-user-service/
│   ├── feed-service/
│   ├── jobs-service/
│   ├── events-service/
│   ├── research-service/
│   ├── messaging-service/
│   ├── notification-service/
│   └── analytics-service/
└── docs/
```

## Demonstration Strategy (3 minutes)
1. **Architecture overview** (30s)
2. **Web flow**: login → post → job apply → RSVP (60s)
3. **Mobile flow** via same APIs (45s)
4. **Cloud deployment proof**: live endpoint + DB (30s)
5. **Quality attributes & future work** (15s)

## Quality Attributes Justification
- **Scalability**: stateless services, queue-driven async processing
- **Security**: JWT auth, RBAC, input validation, transport security
- **Maintainability**: bounded contexts, explicit APIs, modular service ownership
- **Availability**: cloud-managed DB, health checks, restart policies
- **Performance**: cache layer, pagination, background jobs

## Status
Implementation documentation and architecture pack prepared for team execution and final presentation.


## Quick Start (Local MVP)
1. Start backend API:
   ```bash
   cd services/api
   npm start
   ```
2. Open `web-client/index.html` in a browser (or serve it with any static server).
3. Register a user in the web client and create/feed posts.

> Note: The backend is intentionally dependency-free (Node.js built-ins only) so it runs in restricted environments.
