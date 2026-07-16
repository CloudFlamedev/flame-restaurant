# 🔥 Flame Restaurant

Full-stack food ordering app: vanilla HTML/CSS/JS frontend + FastAPI backend, built to be containerized and deployed cleanly.

```
flame-restaurant/
├── backend/            FastAPI app (SQLAlchemy, JWT auth, mock payments)
│   ├── app/
│   │   ├── routers/    auth, profile, categories, foods, cart, orders
│   │   ├── models.py   SQLAlchemy models
│   │   ├── schemas.py  Pydantic schemas
│   │   └── main.py     App entrypoint + seed data + /api/health
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/           Static HTML/CSS/JS, served by nginx in prod
│   ├── index.html / css/style.css / js/app.js
│   ├── nginx.conf
│   ├── docker-entrypoint.sh   # injects BACKEND_URL at container start
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Features

- **Menu**: categories + food items, search, seeded sample data
- **Cart**: add/update/remove items, per-user, persisted server-side
- **Auth**: JWT-based register/login, `/api/profile/me` for profile CRUD
- **Checkout**: mock payment gateway (card / UPI / COD) — swap the block in
  `backend/app/routers/orders.py` for a real Stripe/Razorpay integration later
- **Orders**: order history per user

## Run locally (no Docker)

```bash
# backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# frontend (separate terminal) — any static server works
cd frontend
python -m http.server 8080
```

Visit `http://localhost:8080`. API docs live at `http://localhost:8000/docs`.

## Run with Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend: http://localhost:8000/docs
- Both containers have `HEALTHCHECK`s wired in (used by Compose, Swarm, and K8s probes alike).

## Deployment / DevOps roadmap

This project is deliberately split into two independently deployable containers
so it maps cleanly onto a real pipeline:

1. **Containerize** ✅ done — multi-stage-ready Dockerfiles, non-root backend user,
   health endpoints (`/api/health`, `/health`) for liveness/readiness probes.
2. **CI**: GitHub Actions workflow to lint, run `pytest` (add tests under `backend/tests/`),
   build both images, and push to a registry (Docker Hub / GHCR / ECR) tagged by git SHA.
3. **IaC**: Terraform modules for the target infra (e.g. EC2 + ALB, or ECS/EKS) —
   reuse the VPC/SG/EC2 module pattern from your IaC generator project.
4. **CD**: GitHub Actions + ArgoCD for GitOps-based Kubernetes rollout — this is the
   natural next portfolio piece: package `backend/` and `frontend/` as Helm charts or
   plain K8s manifests (Deployment + Service + Ingress + ConfigMap for `BACKEND_URL`),
   commit manifest changes, let ArgoCD sync.
5. **Config/secrets**: `SECRET_KEY` and `DATABASE_URL` are read from environment
   variables — map these to a K8s Secret / ConfigMap, or SSM Parameter Store if on AWS.
6. **Database**: swap SQLite for Postgres in production by just changing `DATABASE_URL`
   (SQLAlchemy handles the rest) — good opportunity to add an RDS/Postgres Terraform module.
7. **Observability**: `/api/health` is ready to wire into Prometheus blackbox exporter
   or a Grafana uptime panel, consistent with your FinOps dashboard's Grafana setup.

## API quick reference

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | – | Create account, returns JWT |
| POST | `/api/auth/login` | – | Login (form: `username`, `password`), returns JWT |
| GET | `/api/profile/me` | ✅ | Get profile |
| PUT | `/api/profile/me` | ✅ | Update profile |
| GET | `/api/profile/orders` | ✅ | Order history |
| GET | `/api/categories/` | – | List categories |
| GET | `/api/foods/?category_id=&search=` | – | List/filter foods |
| GET | `/api/cart/` | ✅ | View cart |
| POST | `/api/cart/` | ✅ | Add item `{food_id, quantity}` |
| PUT | `/api/cart/{item_id}` | ✅ | Update quantity |
| DELETE | `/api/cart/{item_id}` | ✅ | Remove item |
| POST | `/api/orders/checkout` | ✅ | Place order `{payment_method}` |

## Notes

- Default DB is SQLite for zero-setup local dev; the code path to Postgres is a
  one-line `DATABASE_URL` change (see `backend/app/database.py`).
- CORS is wide open (`allow_origins=["*"]`) for local development — restrict this
  to your real frontend origin before going to production.
- `SECRET_KEY` has an insecure default — **always** override it via environment
  variable outside of local dev.
