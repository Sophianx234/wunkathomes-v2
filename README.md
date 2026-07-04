<div align="center">
  <h1 align="center">WunkatHomes v2 🏢</h1>
  <p align="center">
    <strong>A full-stack, enterprise-grade real estate and property management ecosystem.</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
    <img src="https://img.shields.io/badge/Paystack-09A5DB?style=for-the-badge&logo=paystack&logoColor=white" alt="Paystack" />
  </p>
</div>

<br />

<div align="center">
  <!-- Replace with your compressed Cloudinary screenshot URL -->
<img src="https://res.cloudinary.com/dtytb8qrc/image/upload/c_scale,w_1200,q_auto,f_auto/v1783201431/screencapture-wunkathomes-v2-t5wg-vercel-app-2026-07-04-13_49_59_c9diex.png" alt="WunkatHomes Platform Dashboard" width="100%" />
</div>

<br />

## 📖 Overview

**WunkatHomes v2** is a comprehensive prop-tech (property technology) platform designed to digitize and automate the entire real estate lifecycle. Moving beyond a simple property discovery tool, v2 introduces a robust architectural backend capable of handling secure financial transactions, identity verification, and physical hardware access control.

The platform is engineered around a strict Role-Based Access Control (RBAC) system, routing distinct user flows through four specialized portals: Public (discovery), Tenant (management), Manager (operations), and Admin (oversight).

## ✨ Enterprise System Capabilities

*   **Role-Based Portals:** Secure, isolated dashboard environments tailored for Public Users, Active Tenants, Property Managers, and System Administrators.
*   **Automated Subscriptions & Payments:** Deep integration with the Paystack API to handle tenant subscription billing, automated invoicing, and secure payment processing.
*   **IoT Smart Lock Access:** Hardware integration utilizing Tuya smart locks, allowing managers to provision, revoke, and monitor physical door access remotely from the dashboard.
*   **Asynchronous Job Processing:** Utilizing Redis and BullMQ to handle background tasks reliably, including automated email notifications (via Nodemailer) and payment state reconciliation.
*   **Identity Verification:** Secure user onboarding and KYC flows leveraging Dojah integrations.

## 🧰 Architecture & Tech Stack

**Frontend & Client Layer**
*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS

**Backend & Data Layer**
*   **Runtime:** Node.js environment
*   **Database:** MongoDB with Mongoose ODM
*   **Queue/Cache:** Redis + BullMQ

**Third-Party Integrations**
*   **Payments:** Paystack
*   **Hardware / IoT:** Tuya Smart API
*   **Verification:** Dojah
*   **Communication:** Nodemailer

## 🚀 Local Development Ecosystem

Due to the complex nature of the platform, ensure you have Node.js, MongoDB, and a local Redis server running before initialization.

**1. Clone the repository**
```bash
git clone [https://github.com/sophianx243/wunkathomes-v2.git](https://github.com/sophianx243/wunkathomes-v2.git)
cd wunkathomes-v2
