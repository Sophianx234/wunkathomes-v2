# Wunkat Homes v2 - Scripts Guide

This folder contains utility scripts for database management and application demonstrations. You can run these scripts using the predefined NPM commands in the `package.json`.

---

## 🛠️ Database Seeding

These scripts are used to populate your database with realistic mock properties and listings, or to wipe them clean.

* **`npm run seed`**  
  Connects to your MongoDB database and populates it with realistic mock data (Properties and Listings). Useful for local development and fresh environments.

* **`npm run seed:destroy`**  
  Wipes the existing mock data from your database (Properties and Listings). Use with caution!

---

## 🚀 Lifecycle & Expiration Demo Triggers

When presenting or testing the application, you often need to simulate the passage of time to demonstrate background tasks like **subscription checks**, **email reminders**, and **smart lock revocations**. 

The `trigger-demo.ts` script allows you to instantly fast-forward a tenant's lease state and automatically trigger the `api/cron/check-subscriptions` Next.js endpoint.

### Prerequisites for Demo Scripts:
1. Ensure your `.env` or `.env.local` is configured with your database credentials and `CRON_SECRET`.
2. Ensure you have at least one **Active** lease in your database.
3. Your Next.js development server **must be running** (`npm run dev`) on `localhost:3000` because the script makes a live API call to it.

### Available Commands:

* **`npm run demo:50`**  
  Simulates a lease reaching its halfway mark (50%). It rewinds the trigger date, pings the cron route, and sends the **"Mid-Lease Check-in"** email.

* **`npm run demo:75`**  
  Simulates a lease reaching 75% completion. Pings the cron route and sends the **"Upcoming Lease Expiry"** reminder email.

* **`npm run demo:90`**  
  Simulates a lease reaching 90% completion. Pings the cron route and sends the **"Urgent: Lease Renewals"** email.

* **`npm run demo:expire`**  
  Simulates full lease expiration. It sets the lease end date to yesterday, pings the cron route, changes the lease status to **"Expired"**, and **automatically wipes active temporary Tuya Smart Lock PINs** associated with the lease.

### Targeting a Specific User
By default, running the commands above will auto-select the **first active lease** it finds in the database. If you are demoing with a specific user account and want to target them, you can pass their email address as an argument by inserting `--` before the email:

```bash
npm run demo:expire -- tenant@example.com
```

### What happens under the hood?
1. The script connects to the DB and finds the target Lease.
2. It manipulates `endDate` and `reminders.*.triggerDate` to be in the past, and ensures `sent = false`.
3. It makes an authorized `GET` request to `http://localhost:3000/api/cron/check-subscriptions` using your `CRON_SECRET`.
4. The Next.js API processes the modified database records and sends out the Resend emails and/or calls the Tuya API to revoke locks.

---

## 👑 User Role Management

This script allows you to easily grant or revoke `Admin` privileges for a specific user without needing to edit the database directly.

### Commands:

* **Grant Admin Privileges:**
  ```bash
  npm run admin grant user@example.com
  ```
  This changes the user's role to `Admin`, giving them access to administrative dashboards and functions.

* **Revoke Admin Privileges:**
  ```bash
  npm run admin revoke user@example.com
  ```
  This demotes the user back to a standard `User` role.
