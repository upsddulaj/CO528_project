# Research Findings: Facebook, LinkedIn, and Similar Platforms

## Comparative Summary

| Platform | Architecture Cues | Strengths | Gaps for Department Context | DECP Improvement |
|---|---|---|---|---|
| Facebook | Highly distributed microservices, graph-oriented social interactions, event-driven notifications | Strong feed engagement, messaging ecosystem, high scale media handling | Lacks domain-specific academic/career workflows for a department | Add role-aware feeds, academic project spaces, verified alumni networking |
| LinkedIn | Service-oriented architecture, recommendation systems, professional identity graph | Jobs/internships pipeline, professional identity, strong notifications | Limited department-level event/research collaboration workflows | Add departmental event lifecycle, project collaboration, mentor matching |
| Community/University portals | Usually modular but less scalable and less personalized | Structured announcements and administration | Weaker social engagement and career intelligence | Combine social feed + jobs + events + analytics in one platform |

## Missing Features Identified for Academic Departments
1. Verified alumni mentoring channels tied to student skill profiles.
2. Research topic matchmaking between students, alumni, and staff.
3. Department-contextual notifications for opportunities and events.
4. Unified dashboard combining social engagement and employability indicators.

## Proposed Design Decisions
- Role-based identity model (`student`, `alumni`, `admin`) to keep governance and trust.
- Shared backend API for web and mobile to reduce duplication and increase consistency.
- Event-driven notifications to decouple core transactions from user communication.
- Analytics service for real-time departmental insights and strategic decision support.
