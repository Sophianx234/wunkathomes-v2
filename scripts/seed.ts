import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST before importing anything else
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in your environment variables.");
  process.exit(1);
}

// ---------------------------------------------------------
// MOCK DATA (25 Realistic Properties in Accra, Ghana)
// ---------------------------------------------------------
const mockData = [
  {
    property: {
      propertyType: 'Apartment_Building',
      location: { region: 'Greater Accra', area: 'Cantonments', city: 'Accra' },
      coordinates: { lat: 5.5841, lng: -0.1654 },
      landmarks: ['US Embassy', 'W.E.B. DuBois Centre'],
      generalAmenities: ['Air Conditioning', 'Swimming Pool', 'Backup Generator', '24/7 Security', 'Gym', 'Wi-Fi', 'Balcony', 'Elevator'],
    },
    listing: {
      listingType: 'For_Rent',
      status: 'Available',
      price: 2500,
      title: 'Ultra-Luxury 3-Bedroom Penthouse in Cantonments',
      description: 'Experience unparalleled luxury in this exquisite penthouse. Features breathtaking skyline views, top-of-the-line appliances, and a private rooftop terrace. Ideal for expatriates and executives seeking premium living in Accra.',
      features: { bedrooms: 3, bathrooms: 3.5, sizeSqm: 250 },
      terms: { leaseTerm: '1 Year Minimum' },
      smartLock: { hasSmartLock: true, accessInstructions: 'Use code 4920 at the main lobby.' },
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600607687931-cebf5cb76e27?q=80&w=2070&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'House',
      location: { region: 'Greater Accra', area: 'East Legon', city: 'Accra' },
      coordinates: { lat: 5.6353, lng: -0.1557 },
      landmarks: ['A&C Mall', 'Lancaster University Ghana'],
      generalAmenities: ['Air Conditioning', 'Swimming Pool', 'Backup Generator', '24/7 Security', 'Water Tank (Polytank)', 'Fitted Kitchen', 'Parking Space', 'CCTV Surveillance'],
    },
    listing: {
      listingType: 'For_Sale',
      status: 'Available',
      price: 450000,
      title: 'Modern 4-Bedroom Suburban Family Home',
      description: 'A stunning contemporary family home in the heart of East Legon. Comes with a beautifully manicured garden, a private pool, and a fully fitted kitchen. The neighborhood is serene and family-friendly.',
      features: { bedrooms: 4, bathrooms: 4.5, sizeSqm: 320 },
      terms: { leaseTerm: null },
      smartLock: { hasSmartLock: true, accessInstructions: 'Code will be provided upon closing.' },
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2070&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'Apartment_Building',
      location: { region: 'Greater Accra', area: 'Osu', city: 'Accra' },
      coordinates: { lat: 5.5560, lng: -0.1802 },
      landmarks: ['Oxford Street', 'Osu Castle'],
      generalAmenities: ['Air Conditioning', 'Backup Generator', '24/7 Security', 'Fitted Kitchen', 'Wi-Fi'],
    },
    listing: {
      listingType: 'For_Rent',
      status: 'Available',
      price: 1200,
      title: 'Chic 1-Bedroom Studio near Oxford Street',
      description: 'Perfect for the young professional or digital nomad. This chic studio is steps away from Osu Oxford Street, offering immediate access to the best restaurants, nightlife, and shopping in Accra.',
      features: { bedrooms: 1, bathrooms: 1, sizeSqm: 55 },
      terms: { leaseTerm: '6 Months Minimum' },
      smartLock: { hasSmartLock: false },
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1502672260266-1c1e52409848?q=80&w=1974&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'Commercial',
      location: { region: 'Greater Accra', area: 'Ridge', city: 'Accra' },
      coordinates: { lat: 5.5601, lng: -0.1913 },
      landmarks: ['National Theatre', 'Kempinski Hotel'],
      generalAmenities: ['Air Conditioning', 'Backup Generator', '24/7 Security', 'Parking Space', 'Elevator', 'CCTV Surveillance'],
    },
    listing: {
      listingType: 'For_Rent',
      status: 'Available',
      price: 3500,
      title: 'Premium Open-Plan Commercial Loft',
      description: 'A spacious and highly professional open-plan loft situated in Ridge. Ideal for tech startups, law firms, or creative agencies. Excellent natural light and high-speed fiber internet ready.',
      features: { bedrooms: 0, bathrooms: 2, sizeSqm: 180 },
      terms: { leaseTerm: '2 Years Minimum' },
      smartLock: { hasSmartLock: true, accessInstructions: 'Access card required. Smart lock pin: 1122.' },
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'House',
      location: { region: 'Greater Accra', area: 'Aburi', city: 'Accra' }, // Aburi is just outside but often grouped in Greater Accra real estate
      coordinates: { lat: 5.8491, lng: -0.1746 },
      landmarks: ['Aburi Botanical Gardens'],
      generalAmenities: ['Water Tank (Polytank)', 'Parking Space', 'Balcony', 'Backup Generator', '24/7 Security'],
    },
    listing: {
      listingType: 'For_Sale',
      status: 'Available',
      price: 320000,
      title: 'Eco-Friendly 3-Bedroom Villa',
      description: 'Escape the city heat in this stunning eco-friendly villa in Aburi. Features solar panels, rainwater harvesting, and panoramic views of the hills. A perfect retreat or retirement home.',
      features: { bedrooms: 3, bathrooms: 3, sizeSqm: 200 },
      terms: { leaseTerm: null },
      smartLock: { hasSmartLock: false },
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'Apartment_Building',
      location: { region: 'Greater Accra', area: 'Labone', city: 'Accra' },
      coordinates: { lat: 5.5684, lng: -0.1627 },
      landmarks: ['Labone Coffee Shop', 'South African High Commission'],
      generalAmenities: ['Air Conditioning', 'Backup Generator', '24/7 Security', 'Water Tank (Polytank)', 'Fitted Kitchen', 'Parking Space', 'Wi-Fi'],
    },
    listing: {
      listingType: 'For_Rent',
      status: 'Available',
      price: 1800,
      title: 'Cozy 2-Bedroom Micro-Apartment',
      description: 'Efficiently designed micro-apartment in Labone. Maximizes space without compromising on luxury. Fully furnished with modern smart home appliances and ultra-fast Wi-Fi.',
      features: { bedrooms: 2, bathrooms: 2, sizeSqm: 75 },
      terms: { leaseTerm: '1 Year Minimum' },
      smartLock: { hasSmartLock: true, accessInstructions: 'Digital key sent via app upon booking.' },
      images: [
        'https://images.unsplash.com/photo-1502672023488-70e25813eb80?q=80&w=1964&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2074&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'Apartment_Building',
      location: { region: 'Greater Accra', area: 'Airport Residential', city: 'Accra' },
      coordinates: { lat: 5.6037, lng: -0.1870 },
      landmarks: ['Kotoka International Airport', 'Accra Mall'],
      generalAmenities: ['Air Conditioning', 'Swimming Pool', 'Backup Generator', '24/7 Security', 'Gym', 'Balcony', 'Elevator', 'Fitted Kitchen'],
    },
    listing: {
      listingType: 'For_Rent',
      status: 'Rented',
      price: 3000,
      title: 'Executive 3-Bedroom Apartment near Airport',
      description: 'Prime location for frequent travelers. This executive apartment features high-end finishes, access to a world-class gym, and an infinity pool overlooking the city.',
      features: { bedrooms: 3, bathrooms: 3.5, sizeSqm: 185 },
      terms: { leaseTerm: '1 Year Minimum' },
      smartLock: { hasSmartLock: true, accessInstructions: 'Contact building manager for access.' },
      images: [
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'House',
      location: { region: 'Greater Accra', area: 'Dzorwulu', city: 'Accra' },
      coordinates: { lat: 5.6148, lng: -0.1989 },
      landmarks: ['Fiesta Royale Hotel', 'Perez Dome'],
      generalAmenities: ['Air Conditioning', 'Backup Generator', '24/7 Security', 'Water Tank (Polytank)', 'Fitted Kitchen', 'Parking Space', 'CCTV Surveillance'],
    },
    listing: {
      listingType: 'For_Sale',
      status: 'Available',
      price: 280000,
      title: 'Spacious 4-Bedroom Detached House',
      description: 'A solidly built detached house in Dzorwulu, perfect for a growing family. It boasts a large compound, an en-suite boys quarters, and a spacious fitted kitchen.',
      features: { bedrooms: 4, bathrooms: 4, sizeSqm: 250 },
      terms: { leaseTerm: null },
      smartLock: { hasSmartLock: false },
      images: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'Land',
      location: { region: 'Greater Accra', area: 'East Legon Hills', city: 'Accra' },
      coordinates: { lat: 5.6667, lng: -0.1264 },
      landmarks: ['British International School'],
      generalAmenities: ['24/7 Security'], // Gated community land
    },
    listing: {
      listingType: 'For_Sale',
      status: 'Available',
      price: 85000,
      title: 'Prime Serviced Plot in East Legon Hills',
      description: 'A 70x100ft titled and serviced plot located in a fast-developing gated community in East Legon Hills. Tarred roads, electricity, and water are already connected.',
      features: { bedrooms: 0, bathrooms: 0, sizeSqm: 650 },
      terms: { leaseTerm: null },
      smartLock: { hasSmartLock: false },
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2032&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'Apartment_Building',
      location: { region: 'Greater Accra', area: 'Cantonments', city: 'Accra' },
      coordinates: { lat: 5.5861, lng: -0.1658 },
      landmarks: ['Morning Star School'],
      generalAmenities: ['Air Conditioning', 'Swimming Pool', 'Backup Generator', '24/7 Security', 'Gym', 'Elevator', 'Parking Space'],
    },
    listing: {
      listingType: 'For_Sale',
      status: 'Pending',
      price: 320000,
      title: 'Luxury 2-Bedroom Apartment',
      description: 'An elegant two-bedroom apartment currently under offer. Features imported European tiles, smart lighting, and access to all premium communal amenities.',
      features: { bedrooms: 2, bathrooms: 2.5, sizeSqm: 110 },
      terms: { leaseTerm: null },
      smartLock: { hasSmartLock: true, accessInstructions: 'Contact agent for viewing.' },
      images: [
        'https://images.unsplash.com/photo-1512918580421-df174a742878?q=80&w=2070&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'Commercial',
      location: { region: 'Greater Accra', area: 'Airport City', city: 'Accra' },
      coordinates: { lat: 5.6057, lng: -0.1770 },
      landmarks: ['Marina Mall', 'Holiday Inn'],
      generalAmenities: ['Air Conditioning', 'Backup Generator', '24/7 Security', 'Parking Space', 'Elevator', 'CCTV Surveillance', 'Wi-Fi'],
    },
    listing: {
      listingType: 'For_Rent',
      status: 'Available',
      price: 5000,
      title: 'Grade A Office Space in Airport City',
      description: 'Top-tier 200sqm office space in the prestigious Airport City enclave. 24/7 security, backup power, and breathtaking views of the airport runway.',
      features: { bedrooms: 0, bathrooms: 4, sizeSqm: 200 },
      terms: { leaseTerm: '3 Years Minimum' },
      smartLock: { hasSmartLock: false },
      images: [
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2069&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'House',
      location: { region: 'Greater Accra', area: 'Spintex', city: 'Accra' },
      coordinates: { lat: 5.6322, lng: -0.0988 },
      landmarks: ['Junction Mall', 'KFC Spintex'],
      generalAmenities: ['Water Tank (Polytank)', 'Fitted Kitchen', 'Parking Space', 'Air Conditioning'],
    },
    listing: {
      listingType: 'For_Rent',
      status: 'Available',
      price: 800,
      title: 'Affordable 3-Bedroom Semi-Detached House',
      description: 'A budget-friendly yet highly comfortable 3-bedroom house located just off the main Spintex road. Easy access to public transport and shopping malls.',
      features: { bedrooms: 3, bathrooms: 2, sizeSqm: 140 },
      terms: { leaseTerm: '1 Year Minimum' },
      smartLock: { hasSmartLock: false },
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'Apartment_Building',
      location: { region: 'Greater Accra', area: 'Osu', city: 'Accra' },
      coordinates: { lat: 5.5560, lng: -0.1812 },
      landmarks: ['Papaye', 'Woodin'],
      generalAmenities: ['Air Conditioning', 'Wi-Fi', 'Balcony', 'Fitted Kitchen', 'Backup Generator'],
    },
    listing: {
      listingType: 'For_Rent',
      status: 'Available',
      price: 1500,
      title: 'Vibrant 2-Bedroom Flat in Osu',
      description: 'Live right in the center of the action. This 2-bedroom flat is perfectly positioned for those who love city life, complete with a balcony overlooking the vibrant streets of Osu.',
      features: { bedrooms: 2, bathrooms: 2, sizeSqm: 90 },
      terms: { leaseTerm: '6 Months Minimum' },
      smartLock: { hasSmartLock: true, accessInstructions: 'Gate code 8291, Door code 1123' },
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'House',
      location: { region: 'Greater Accra', area: 'Cantonments', city: 'Accra' },
      coordinates: { lat: 5.5801, lng: -0.1604 },
      landmarks: ['Ghana International School'],
      generalAmenities: ['Air Conditioning', 'Swimming Pool', 'Backup Generator', '24/7 Security', 'Water Tank (Polytank)', 'Fitted Kitchen', 'Parking Space', 'CCTV Surveillance'],
    },
    listing: {
      listingType: 'For_Sale',
      status: 'Available',
      price: 1200000,
      title: 'Ultra-Modern 5-Bedroom Mansion',
      description: 'An architectural masterpiece in Cantonments. This mansion features 5 en-suite bedrooms, a cinema room, a massive swimming pool, and smart home automation throughout.',
      features: { bedrooms: 5, bathrooms: 6, sizeSqm: 600 },
      terms: { leaseTerm: null },
      smartLock: { hasSmartLock: true, accessInstructions: 'Fingerprint and remote app access.' },
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600566753086-00f18efc2294?q=80&w=2070&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'Apartment_Building',
      location: { region: 'Greater Accra', area: 'East Legon', city: 'Accra' },
      coordinates: { lat: 5.6360, lng: -0.1550 },
      landmarks: ['Accra Mall'],
      generalAmenities: ['Air Conditioning', 'Gym', 'Wi-Fi', 'Elevator', 'Fitted Kitchen'],
    },
    listing: {
      listingType: 'For_Rent',
      status: 'Rented',
      price: 1000,
      title: 'Minimalist 1-Bedroom Apartment',
      description: 'A highly sought-after minimalist 1-bedroom apartment in East Legon. Currently rented out, but known for its sleek design and efficient use of space.',
      features: { bedrooms: 1, bathrooms: 1, sizeSqm: 60 },
      terms: { leaseTerm: '1 Year Minimum' },
      smartLock: { hasSmartLock: false },
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1e52409848?q=80&w=1974&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'Land',
      location: { region: 'Greater Accra', area: 'Prampram', city: 'Accra' },
      coordinates: { lat: 5.7145, lng: 0.1068 },
      landmarks: ['Prampram Beach', 'Sealane Hotel'],
      generalAmenities: [],
    },
    listing: {
      listingType: 'For_Sale',
      status: 'Available',
      price: 25000,
      title: 'Ocean-View Residential Plot',
      description: 'Build your dream beach house on this titled 70x100ft plot in Prampram. Just 5 minutes walk from the beach with clear ocean views.',
      features: { bedrooms: 0, bathrooms: 0, sizeSqm: 650 },
      terms: { leaseTerm: null },
      smartLock: { hasSmartLock: false },
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2032&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'Commercial',
      location: { region: 'Greater Accra', area: 'Osu', city: 'Accra' },
      coordinates: { lat: 5.5580, lng: -0.1822 },
      landmarks: ['Oxford Street Mall'],
      generalAmenities: ['Air Conditioning', 'Backup Generator', 'Parking Space'],
    },
    listing: {
      listingType: 'For_Rent',
      status: 'Available',
      price: 2000,
      title: 'Retail Shop Space on Oxford Street',
      description: 'High-visibility retail space located directly on Oxford Street. Guaranteed heavy foot traffic, perfect for a boutique, pharmacy, or café.',
      features: { bedrooms: 0, bathrooms: 1, sizeSqm: 80 },
      terms: { leaseTerm: '2 Years Minimum' },
      smartLock: { hasSmartLock: false },
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'House',
      location: { region: 'Greater Accra', area: 'Achimota', city: 'Accra' },
      coordinates: { lat: 5.6128, lng: -0.2238 },
      landmarks: ['Achimota Retail Centre', 'Achimota Golf Club'],
      generalAmenities: ['Water Tank (Polytank)', 'Fitted Kitchen', 'Parking Space'],
    },
    listing: {
      listingType: 'For_Sale',
      status: 'Sold',
      price: 150000,
      title: 'Cozy 3-Bedroom House near Golf Club',
      description: 'A highly desirable property that has recently been sold. It featured a quiet neighborhood, solid build quality, and easy access to the N1 highway.',
      features: { bedrooms: 3, bathrooms: 2, sizeSqm: 130 },
      terms: { leaseTerm: null },
      smartLock: { hasSmartLock: false },
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'Apartment_Building',
      location: { region: 'Greater Accra', area: 'Roman Ridge', city: 'Accra' },
      coordinates: { lat: 5.5971, lng: -0.1917 },
      landmarks: ['Roman Ridge School'],
      generalAmenities: ['Air Conditioning', 'Swimming Pool', 'Backup Generator', '24/7 Security', 'Elevator'],
    },
    listing: {
      listingType: 'For_Rent',
      status: 'Available',
      price: 2200,
      title: 'Sophisticated 2-Bedroom Apartment',
      description: 'A sophisticated and quiet apartment located in the serene residential neighborhood of Roman Ridge. Offers a huge pool and 24-hour security.',
      features: { bedrooms: 2, bathrooms: 2.5, sizeSqm: 115 },
      terms: { leaseTerm: '1 Year Minimum' },
      smartLock: { hasSmartLock: true, accessInstructions: 'NFC Card required.' },
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'House',
      location: { region: 'Greater Accra', area: 'Tse Addo', city: 'Accra' },
      coordinates: { lat: 5.5784, lng: -0.1415 },
      landmarks: ['Trade Fair Centre'],
      generalAmenities: ['Air Conditioning', 'Water Tank (Polytank)', 'Backup Generator', 'Fitted Kitchen', 'CCTV Surveillance'],
    },
    listing: {
      listingType: 'For_Sale',
      status: 'Available',
      price: 220000,
      title: 'Newly Built 4-Bedroom Townhouse',
      description: 'Be the first to live in this brand-new townhouse in the fast-growing Tse Addo area. Features modern POP ceilings, hidden lighting, and a fully equipped kitchen.',
      features: { bedrooms: 4, bathrooms: 4.5, sizeSqm: 210 },
      terms: { leaseTerm: null },
      smartLock: { hasSmartLock: true, accessInstructions: 'Agent will unlock remotely.' },
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'Apartment_Building',
      location: { region: 'Greater Accra', area: 'Airport Residential', city: 'Accra' },
      coordinates: { lat: 5.6030, lng: -0.1850 },
      landmarks: ['Koala Shopping Center'],
      generalAmenities: ['Air Conditioning', 'Swimming Pool', 'Backup Generator', '24/7 Security', 'Gym', 'Balcony', 'Elevator'],
    },
    listing: {
      listingType: 'For_Sale',
      status: 'Available',
      price: 450000,
      title: 'Premium 3-Bedroom Suite in Airport Residential',
      description: 'An elite suite offering the ultimate luxury lifestyle. Includes an indoor gym, rooftop pool, concierge service, and smart home capabilities.',
      features: { bedrooms: 3, bathrooms: 3.5, sizeSqm: 190 },
      terms: { leaseTerm: null },
      smartLock: { hasSmartLock: true, accessInstructions: 'Passcode: 9988' },
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'Commercial',
      location: { region: 'Greater Accra', area: 'East Legon', city: 'Accra' },
      coordinates: { lat: 5.6341, lng: -0.1551 },
      landmarks: ['Starbites', 'A&C Mall'],
      generalAmenities: ['Air Conditioning', 'Backup Generator', '24/7 Security', 'Parking Space', 'Wi-Fi'],
    },
    listing: {
      listingType: 'For_Rent',
      status: 'Available',
      price: 4000,
      title: 'Versatile Co-Working Office Space',
      description: 'Fully furnished co-working space capable of seating 20 employees. Includes private meeting rooms, a kitchenette, and 24/7 dedicated internet.',
      features: { bedrooms: 0, bathrooms: 2, sizeSqm: 150 },
      terms: { leaseTerm: '1 Year Minimum' },
      smartLock: { hasSmartLock: false },
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'House',
      location: { region: 'Greater Accra', area: 'Dansoman', city: 'Accra' },
      coordinates: { lat: 5.5486, lng: -0.2604 },
      landmarks: ['Dansoman Roundabout', 'Methodist University'],
      generalAmenities: ['Water Tank (Polytank)', 'Fitted Kitchen', 'Parking Space'],
    },
    listing: {
      listingType: 'For_Sale',
      status: 'Pending',
      price: 110000,
      title: 'Classic 3-Bedroom Family Home',
      description: 'A classic Dansoman home with a large compound. Currently pending sale. Known for its strong community vibe and accessibility.',
      features: { bedrooms: 3, bathrooms: 2, sizeSqm: 160 },
      terms: { leaseTerm: null },
      smartLock: { hasSmartLock: false },
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'Apartment_Building',
      location: { region: 'Greater Accra', area: 'Labadi', city: 'Accra' },
      coordinates: { lat: 5.5645, lng: -0.1507 },
      landmarks: ['Labadi Beach Hotel', 'La Palm Royal Beach Hotel'],
      generalAmenities: ['Air Conditioning', 'Balcony', 'Wi-Fi', 'Fitted Kitchen'],
    },
    listing: {
      listingType: 'For_Rent',
      status: 'Available',
      price: 1300,
      title: 'Breezy 2-Bedroom Beach-Side Apartment',
      description: 'Enjoy the ocean breeze in this lovely 2-bedroom apartment situated near Labadi Beach. Features a wide balcony and modern interior finish.',
      features: { bedrooms: 2, bathrooms: 2, sizeSqm: 85 },
      terms: { leaseTerm: '1 Year Minimum' },
      smartLock: { hasSmartLock: false },
      images: [
        'https://images.unsplash.com/photo-1502672023488-70e25813eb80?q=80&w=1964&auto=format&fit=crop'
      ]
    }
  },
  {
    property: {
      propertyType: 'Land',
      location: { region: 'Greater Accra', area: 'Cantonments', city: 'Accra' },
      coordinates: { lat: 5.5830, lng: -0.1650 },
      landmarks: ['W.E.B. DuBois Centre'],
      generalAmenities: [],
    },
    listing: {
      listingType: 'For_Sale',
      status: 'Available',
      price: 850000,
      title: 'Rare Half-Acre Prime Plot in Cantonments',
      description: 'An exceptionally rare find. A half-acre of prime, titled land in the heart of Cantonments. Perfect for a luxury residential development or embassy use.',
      features: { bedrooms: 0, bathrooms: 0, sizeSqm: 2023 },
      terms: { leaseTerm: null },
      smartLock: { hasSmartLock: false },
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2032&auto=format&fit=crop'
      ]
    }
  }
];

// ---------------------------------------------------------
// SEED SCRIPT RUNNER
// ---------------------------------------------------------
async function runSeed() {
  try {
    console.log("🌱 Starting Database Seed...");
    
    // Dynamically import models so process.env is ready for DbConnect
    const mongoose = (await import('mongoose')).default;
    const { connectToDatabase } = await import('../src/config/DbConnect');
    const Property = (await import('../src/models/property')).default;
    const Listing = (await import('../src/models/listing')).default;

    // 1. Connect to MongoDB
    await connectToDatabase();
    console.log("✅ Successfully connected to MongoDB.");

    // 2. Wipe existing data safely
    await Property.deleteMany({});
    await Listing.deleteMany({});
    console.log("🧹 Cleared existing Properties and Listings collections.");

    // 3. Iterate through mock data and populate
    let count = 0;
    for (const item of mockData) {
      // Create the Property document first
      const newProperty = new Property(item.property);
      const savedProperty = await newProperty.save();

      // Create the Listing, mapping propertyId to the newly created Property's _id
      const newListing = new Listing({
        ...item.listing,
        propertyId: savedProperty._id,
      });
      await newListing.save();
      
      count++;
    }

    console.log(`🎉 Successfully seeded ${count} highly realistic properties and their listings into the database!`);
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
    
  } catch (error) {
    console.error("❌ An error occurred during seeding:");
    console.error(error);
    process.exit(1);
  }
}

runSeed();
