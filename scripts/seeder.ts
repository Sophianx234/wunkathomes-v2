import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '@/models/user';
import Property from '@/models/property';
import Listing from '@/models/listing';
import Lease from '@/models/lease';
import Transaction from '@/models/transaction';
import Review from '@/models/review';
import { connectToDatabase } from '@/config/DbConnect';

// Load environment variables from .env.local
dotenv.config();



const importData = async () => {
  try {
    await connectToDatabase();

    // 1. Clear database to prevent duplicates
    await User.deleteMany();
    await Property.deleteMany();
    await Listing.deleteMany();
    await Lease.deleteMany();
    await Transaction.deleteMany();
    await Review.deleteMany();


    // 2. Create Base Admin & Users
    const users = await User.insertMany([
      {
        name: 'Admin Owner',
        email: 'admin@wunkathomes.com',
        phone: '+233500000000',
        password: 'hashed_password_here', // Use bcrypt in real app
        role: 'Admin',
      },
      {
        name: 'Test Tenant',
        email: 'tenant@example.com',
        phone: '+233500000001',
        password: 'hashed_password_here',
        role: 'User',
      },
    ]);

    const adminId = users[0]._id;

    // 3. Create Physical Properties
    const properties = await Property.insertMany([
      {
        title: 'The Oxford Residences',
        description: 'A premium, modern apartment complex situated in the bustling heart of Osu, offering high-end security and backup utilities.',
        propertyType: 'Apartment_Building',
        location: {
          area: 'Osu',
          region: 'Greater Accra',
        },
        landmarks: ['Oxford Street', 'Osu Mall'],
        generalAmenities: ['Backup Generator', '24/7 Security', 'Water Reservoir'],
      },
      {
        title: 'East Legon Oasis',
        description: 'A spacious, private standalone house perfect for families, featuring a private pool and modern electric fencing.',
        propertyType: 'House',
        location: {
          area: 'East Legon',
          region: 'Greater Accra',
        },
        landmarks: ['A&C Mall'],
        generalAmenities: ['Swimming Pool', 'Electric Fence'],
      },
    ]);

    // 4. Create Listings (Using .create() so the Slug pre-save hook fires)
    const listingsToCreate = [
      {
        title: 'Luxury 2-Bedroom Suite',
        description: 'Fully fitted 2-bedroom suite with ensuite bathrooms and a modern kitchen. Perfect for professionals.',
        propertyId: properties[0]._id,
        listingType: 'For_Rent',
        status: 'Available',
        price: 4500, // GHS
        features: ['2 Bedrooms', 'Ensuite', 'Fitted Kitchen'],
        smartLock: true,
      },
      {
        title: 'Cozy 1-Bedroom Apartment',
        description: 'A minimalist 1-bedroom unit with a beautiful balcony view of the city skyline.',
        propertyId: properties[0]._id, 
        listingType: 'For_Rent',
        status: 'Available',
        price: 4000,
        features: ['1 Bedroom', 'Balcony'],
        smartLock: true,
      },
      {
        title: '4-Bedroom Smart Home',
        description: 'A massive 4-bedroom family home with integrated smart home features and detached boys quarters.',
        propertyId: properties[1]._id,
        listingType: 'For_Sale',
        status: 'Available',
        price: 1500000,
        features: ['4 Bedrooms', 'Boys Quarters', 'Smart Home Integrated'],
        smartLock: true,
      },
    ];

    for (const listingData of listingsToCreate) {
      await Listing.create(listingData);
    }

    

    console.log('Dummy Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectToDatabase();

    await User.deleteMany();
    await Property.deleteMany();
    await Listing.deleteMany();
    await Lease.deleteMany();
    await Transaction.deleteMany();
    await Review.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error}`);
    process.exit(1);
  }
};

// Check CLI arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}