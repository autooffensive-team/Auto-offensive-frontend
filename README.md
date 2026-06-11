# 🚀 Auto-Offensive

<p align="center">
  <img src="./public/Auto_Offensive_Light-mode.png" alt="Auto-Offensive Light Logo" width="200" style="margin: 10px;" />
  <img src="./public/Auto_Offensive_Dark-mode.png" alt="Auto-Offensive Dark Logo" width="200" style="margin: 10px;" />
</p>

<p align="center">
  <strong>Automate the Attack. Secure the Stack.</strong><br/>
  A modern PaaS platform for automated penetration testing & security workflows
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/status-active-success" /></a>
  <a href="#"><img src="https://img.shields.io/badge/version-1.0.0-blue" /></a>
  <a href="#"><img src="https://img.shields.io/badge/license-MIT-black" /></a>
  <a href="#"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen" /></a>
</p>

---

## ✨ Overview

`Auto-Offensive` is a hybrid **Platform as a Service (PaaS) and Software as a Service (SaaS)** that enables **automated penetration testing** through:

- 🖥 Web Dashboard  
- 💻 CLI Interface  
- 🔗 API Integration  

No local setup. No tool configuration. Just scan.

> Designed for **security engineers, developers, and researchers** who want speed, automation, and scalability.

---

## 🖼 Preview

<p align="center">
  <img src="./public/desktop-preview.png" width="360"/>
  <img src="./public/tablet-preview.png" width="200"/>
  <img src="./public/mobile-preview.png" width="100"/>
</p>

---

## ✨ Key Features

**Auto-Offensive delivers security automation across 4 core capabilities:**

### 🖥 Automated Penetration Testing (Web UI)
- **🔍 One-Click Scanning** – Launch complex security scans directly from the dashboard with no manual configuration.
- **⚙️ Dynamic Tool Management** – Admins can add new security tools through the UI without touching backend code.
- **🔗 Tool Piping & Chaining** – Select multiple tools and pipe them together (e.g., use Nmap output as direct input for Nuclei).

### 📄 Advanced Reporting System
- **📦 Multi-Format Export** – Generate professional reports in JSON, DOCX, Excel, and PDF.
- **🔌 Portable Raw Data** – JSON output allows seamless integration into external platforms and custom dashboards.
- **🎨 Dynamic Customization** – Customize report templates and layouts directly from the UI (coming soon).

### 💻 Remote CLI Execution
- **🌐 Remote Execution** – Run scans from your local terminal without installing tools locally; the CLI calls our server-side API.
- **🔐 Cloud Synct** – Full login and authentication support to sync your sessions and history across devices.
- **⚡️ Instant Results** – After a scan, the CLI returns a direct URL to view the web report or download it immediately.

### 🔒 Source Code & CI/CD Security
- **🧬 Git Integration** – Scan GitHub and GitLab repositories directly for code quality issues and hardcoded secrets.
- **🚀 Pipeline Ready** – Dedicated API endpoints for CI/CD integration to receive automated security pass/fail results.


## 🚀 Live Platform

Access our production-ready platform:

**🌐 [Auto-OffensivePlatform](https://auto-offensive.org/)**

---

## ⚙️ Getting Started

### 📥 Installation

**Clone the repository:**
```bash
git clone https://github.com/ITProfessional-Gen01/auto-offensive-frontend.git
cd auto-offensive-frontend
```

**Install dependencies:**
```bash
npm install
```

**Run the development server:**
```bash
npm run dev
```

---

## 🛠 Technology Stack

Auto-Offensive leverages a modern, high-performance stack designed for security, scalability, and real-time execution.

### 🎨 Frontend Technologies

#### **🏗 Core Framework & Libraries**
- **⚡️ Next.js (App Router)** - React-based full-stack framework with SSR, SSG, and performance optimization
- **📘 TypeScript** - Strongly typed JavaScript for enhanced reliability and developer experience

#### **🎭 Styling & UI Components**
- **🌊 Tailwind CSS** - Utility-first CSS framework for rapid, responsive design
- **🎨 CSS3** - Modern styling with animations, transitions, and responsive layouts
- **📄 HTML5** - Semantic markup for accessibility and SEO optimization
- **🧩 Shadcn/ui Components** - Modern, accessible, and customizable component library

#### **🔄 State Management & Logic**
- **🗃 Redux** - Predictable state container for complex application state management
- **🚀 JavaScript (ES6+)** - Modern JavaScript features for enhanced functionality

### ⚙️ Backend & Security

#### **🏢 Core Framework**
- **🚀 Go (Golang):** -  High-concurrency engine used for heavy-duty scanning tasks and tool orchestration.
- **🐍 FastAPI:** - Modern, high-performance Python framework used for rapid API development and asynchronous task handling.
- **🔐 Keycloak** - Open-source identity and access management for secure authentication


### 💾 Database & Caching

#### **🗄 Primary Database**
- **🐘 PostgreSQL** - Our primary relational database, ensuring ACID compliance and robust data integrity for user and scan records.
- **🟥 Redis** -  (Remote Dictionary Server) is an open-source, in-memory NoSQL data structure store



### 🐳 DevOps & Deployment

#### **📦 Containerization**
- **🐋 Docker** - Containerization for:
  - 📦 Application packaging and deployment
  - 🔄 Environment consistency
  - 🏗 Microservices orchestration
  - 📈 Simplified scaling
- **🔒 gVisor** - is an open-source container runtime developed by Google that acts as a secure, sandboxed middleman between your containerized applications and the host operating system

#### **🌐 Web Server & Infrastructure**
- **🚀 NGINX** - High-performance reverse proxy for load balancing and SSL termination
- **☁️ Cloud Deployment** - Scalable cloud infrastructure
- **🔄 CI/CD Pipeline** - Automated testing, building, and deployment
-- **☸️ Jenkins** - is a free, open-source automation server that helps software teams build, test, and deploy their applications automatically
---

## 🗺 Navigation Structure

Clear and intuitive navigation across **public**, **user**, and **admin** areas ensures a seamless experience.

---

### 🌐 Public Navigation

- 🏠 **Home**  
  [https://auto-offensive.org/](https://auto-offensive.org/)  
  → Platform overview and introduction  

- 🛠 **Tools**  
  [https://auto-offensive.org/tools](https://auto-offensive.org/tools)  
  → Explore automated security tools  

- ✨ **Features**  
  [https://auto-offensive.org/feature](https://auto-offensive.org/feature)  
  → Discover orchestration & automation capabilities  

- 📚 **Resources**  
  [https://auto-offensive.org/resource](https://auto-offensive.org/resource)  
  → Knowledge base and security documentation  

- 🔑 **Login**  
  [https://auto-offensive.org/login](https://auto-offensive.org/login)  
  → Access your secure dashboard  

- 📝 **Register**  
  [https://auto-offensive.org/register](https://auto-offensive.org/register)  
  → Create an account for full access  

---

### 🔐 Authenticated User Pages

- 📊 **Dashboard**  
  https://auto-offensive.org/userdashboard 
  → View scan history, recent results, and quick actions  

- 🔍 **New Scan**  
  https://auto-offensive.org/userdashboard/scan 
  → Configure and launch automated security workflows  

- 🔍 **Code Scan**  
  https://auto-offensive.org/userdashboard/code-scanning
  → Scan code from your repository in github and gitlab when connect 

- 📄 **Reports**  
  https://auto-offensive.org/userdashboard/reports 
  → Manage, view, and export scan results  

- ⚙️ **Profile Settings**  
  https://auto-offensive.org/userdashboard/profile  
  → Update account details and manage API keys  

---

### 🛡 Admin Panel
- 📖 **Admin Dashboard Overview**  
  https://aof-admin.vercel.app/dashboard
  → Admin Overview 

- 👥 **User Management**  
  https://aof-admin.vercel.app/dashboard/users 
  → Monitor, manage, and control user accounts  

- 🛠 **Tool Management**  
  https://aof-admin.vercel.app/dashboard/tools 
  → Add, update, or remove security tools dynamically  

---


## 🙏 Acknowledgments

We would like to express our deepest gratitude to our mentors:

**👨‍🏫 Mr. Kim Chansokpheng and 👨‍🏫 Mr. Sreng Chipor**

Their technical expertise and strategic guidance were the cornerstones of **Auto-Offensive**. . Beyond providing solutions, they challenged us to think critically and architect with precision. We are profoundly grateful for their patience and for the professional standards they inspired us to uphold.


**🌟 Thank you for empowering us to build with excellence.!**

---

## 💡 Our Mission

### 🔐  **"Your recon stack, without the stack"**

*Empowering security professionals, developers, and researchers with accessible, automated penetration testing tools — without the infrastructure complexity.*


---

<p align="center">
<strong>🚀 Ready to automate your security workflow?</strong>


<a href="https://auto-offensive.org/">🌐 Visit Auto-Offensive Today!</a>
