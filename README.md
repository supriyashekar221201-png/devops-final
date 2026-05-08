# DevOps Final Project — Containerized Books CRUD Service

## Project Overview

This report documents the final DevOps project for the ITSM and DevOps course. The goal was to take a small web application and walk it through the full DevOps loop: package it with Docker, 
run it on Kubernetes, push it under load with k6, and prove it can survive failures.

---

## Main Features

- RESTful Books CRUD API
- Docker multi-container deployment
- Kubernetes deployment with:
  - Deployments
  - Services
  - readiness and liveness probes
  - resource limits
- Load testing with 500 concurrent virtual users
- Fault tolerance demonstrations:
  - pod deletion recovery
  - container crash recovery
- Horizontal Pod Autoscaler (HPA) configuration

---

## Repository Structure

```text
app/            Node.js application source
k8s/            Kubernetes manifests
load-tests/     k6 load testing scripts
docker-compose.yaml
init.sql
Devops_Final_Report.pdf
```

---

## Authors

- Supriya Raman Shekar
- Mingyang Du

Course:
IT Security Management (ITSM) and DevOps  
SRH University Leipzig — 2025/26 2Semester

---

## Documentation

The complete technical report, implementation details, testing results, screenshots, and analysis are available in:

`Devops_Final_Report.pdf`
