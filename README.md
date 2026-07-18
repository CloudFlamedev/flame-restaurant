# 🔥 Flame Restaurant

A full-stack restaurant ordering application built with **FastAPI** and **Vanilla HTML/CSS/JavaScript**, designed to demonstrate modern software development, containerization, infrastructure automation, and CI/CD practices.

---

## 🌐 Live Demo

**Frontend:** https://cloudflamedev.github.io/flame-frontend/

---

## 📂 Source Code

- **Full Stack Project:** https://github.com/CloudFlamedev/flame-restaurant
- **Frontend Repository:** https://github.com/CloudFlamedev/flame-frontend

---

# 🚀 Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript (ES6)

### Backend
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- SQLite

### DevOps & Cloud
- Docker
- Docker Compose
- Jenkins
- Terraform
- AWS EC2
- GitHub Actions (Frontend Deployment)
- GitHub Pages
- Docker Hub
- Git & GitHub

---

# 📁 Project Structure

```text
flame-restaurant/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── database.py
│   │   └── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── nginx.conf
│   ├── docker-entrypoint.sh
│   └── Dockerfile
│
├── terraform/
│
├── docker-compose.yml
├── Jenkinsfile
└── README.md
```

---

# ✨ Features

- User Registration & Login (JWT Authentication)
- Restaurant Menu
- Food Categories
- Food Search
- Shopping Cart
- Order Checkout
- Mock Payment Gateway
- User Profile
- Order History
- REST API Documentation
- Dockerized Application

---

# ⚙️ Run Locally

## Clone Repository

```bash
git clone https://github.com/CloudFlamedev/flame-restaurant.git

cd flame-restaurant
```

---

## Backend

```bash
cd backend

python -m venv .venv

source .venv/bin/activate      # Linux / macOS

pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

---

## Frontend

Open another terminal.

```bash
cd frontend

python -m http.server 8080
```

Visit

```
Frontend
http://localhost:8080
```

API Docs

```
http://localhost:8000/docs
```

---

# 🐳 Run with Docker

```bash
cp .env.example .env

docker compose up --build
```

Services

| Service | URL |
|----------|------------------------------|
| Frontend | http://localhost:8080 |
| Backend | http://localhost:8000/docs |

---

# ☁️ DevOps Architecture

```
Developer
     │
     ▼
GitHub Repository
     │
     ▼
Jenkins Pipeline
     │
     ├── Pull Source Code
     ├── Build Docker Images
     ├── Push Images to Docker Hub
     └── Deploy to AWS EC2
                    │
                    ▼
             Docker Containers
```

---

# 🐳 Docker Hub Images

- Frontend Image
- Backend Image

Docker images are published to Docker Hub and can be deployed independently.

---

# ☁️ Infrastructure as Code

Terraform is used to provision AWS infrastructure including:

- VPC
- Public Subnet
- Security Groups
- EC2 Instance
- Internet Gateway
- Route Tables

---

# 🔄 CI/CD Pipeline

The Jenkins pipeline automates:

- Source Code Checkout
- Docker Image Build
- Docker Image Push
- Application Deployment
- Infrastructure Automation with Terraform

---

# 📖 API Reference

| Method | Endpoint | Description |
|---------|----------------------------|-----------------------------|
| POST | /api/auth/register | Register User |
| POST | /api/auth/login | Login User |
| GET | /api/profile/me | User Profile |
| PUT | /api/profile/me | Update Profile |
| GET | /api/profile/orders | Order History |
| GET | /api/categories | Food Categories |
| GET | /api/foods | Food Menu |
| GET | /api/cart | View Cart |
| POST | /api/cart | Add to Cart |
| PUT | /api/cart/{id} | Update Cart |
| DELETE | /api/cart/{id} | Remove Item |
| POST | /api/orders/checkout | Checkout |

----

# 👨‍💻 Author

**Utkrist Gupta**

- GitHub: https://github.com/CloudFlamedev
- LinkedIn: https://www.linkedin.com/in/utkrist-gupta/

---

# ⭐ If you found this project helpful, please consider giving it a Star.
