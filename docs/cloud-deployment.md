# Cloud Deployment Details

## Baseline Deployment Topology
- Frontend hosted as static site (CDN-backed).
- Backend services deployed as containers (Kubernetes/App Service/Container Apps).
- Managed PostgreSQL for transactional storage.
- Object storage for media/documents.
- Queue service for asynchronous workloads.

## Scalability Considerations
1. Stateless service instances allow horizontal autoscaling.
2. Queue-based processing prevents request latency spikes.
3. CDN and object storage reduce origin load for media-heavy traffic.
4. Read-heavy endpoints benefit from caching.

## Reliability Considerations
- Health probes and automatic restarts.
- Periodic DB backups and retention policy.
- Fault isolation by module/service boundaries.
- Centralized logging and alerting pipeline.

## Deployment Evidence Checklist
- Public API base URL
- DB instance details (sanitized)
- Media bucket/container details
- Screenshot set of running services
- CI/CD pipeline run URL
