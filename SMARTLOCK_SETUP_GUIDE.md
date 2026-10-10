# Wunkat Homes - Smart Lock Integration Guide

This guide outlines the end-to-end process for installing physical Zigbee smart locks and integrating them with the Wunkat Homes Next.js application via the Tuya Cloud.

## 1. Physical Hub & Lock Setup

The Zigbee smart lock requires a Zigbee Gateway (Hub) to connect to the internet and communicate with the Tuya Cloud.

1. **Power the Zigbee Hub:** 
   Plug the Zigbee Hub into a power outlet near the door. Ideally, it should be within 10-15 meters of where the lock will be installed to ensure a stable Zigbee connection.
2. **Connect Hub to Tuya App:** 
   Open the **Tuya Smart** (or Smart Life) app on your phone. Click **Add Device** and connect the Zigbee Hub to the property's Wi-Fi network. 
   *(Tip: If the property doesn't have active Wi-Fi yet, you will need to set up a mobile hotspot for testing).*
3. **Install the Lock:** 
   Physically install the smart lock on the door and insert the batteries.
4. **Pair Lock to Hub:** 
   Put the smart lock into pairing mode (usually done by entering an admin code on the keypad or pressing a physical reset button—refer to the specific lock's manual). 
   In the Tuya app, select your Zigbee Hub, click **Add Sub-device**, and pair the smart lock. 

*Verification:* At this point, you should be able to lock and unlock the door using the Tuya app on your phone.

## 2. Tuya Cloud Synchronization

Because your Tuya app account is already linked to your Tuya Cloud IoT project, **the new lock will automatically appear in your Tuya Cloud Platform** the moment it connects to your app. 

You do not need to do any manual configuration on the Tuya Cloud website. The device ID and telemetry will be immediately accessible via the API.

## 3. Wunkat Homes App Integration

Now you need to pull the physical lock into your Next.js database and assign it to a property:

1. **Sync to Database:** 
   Open your Wunkat Homes Admin Dashboard and navigate to **Smart Locks Management** (`/admin/smartlocks`). Click the **Sync** button. 
   This triggers the `syncLocksFromCloud` backend function, which fetches the new physical lock from Tuya and saves it into your database with an **unassigned** status.
2. **Rename the Lock:** 
   Once synced, use the options in the Admin Dashboard to rename the lock to something recognizable (e.g., "East Legon Master Bedroom Lock").
3. **Assign to a Property:** 
   Navigate to **Properties** (`/admin/properties`). Edit the specific property/listing where the lock is installed, turn on the **Smart Lock Toggle**, and select your newly synced lock from the dropdown menu to assign it.

## 4. On-Site Testing Checklist

Before leaving the property, ensure you test the following via the Wunkat Homes platform:

- [ ] **Remote Unlock:** Test a remote unlock from the Wunkat Homes admin dashboard.
- [ ] **Vendor PIN Generation:** Generate a temporary Vendor PIN from the dashboard and verify it works on the physical keypad.
- [ ] **Telemetry Update:** Ensure the battery level and door state (if supported by your hardware) update correctly in your dashboard.
