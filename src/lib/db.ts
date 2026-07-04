import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;
const MOCK_DB_PATH = path.join(process.cwd(), '.mockdb.json');

// Initialize MongoDB Connection Cache
let cachedConnection: any = (global as any).mongoose;
if (!cachedConnection) {
  cachedConnection = (global as any).mongoose = { conn: null, promise: null };
}

// Interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'Super Admin' | 'Admin' | 'Manager' | 'Employee';
  permissions: string[]; // e.g. ["add_product", "edit_product"]
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string; // For nesting: Main -> Sub -> Child
  image?: string;
  banner?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: 'Active' | 'Inactive';
  position: number;
}

export interface ProductVariant {
  sku: string;
  barcode?: string;
  size?: string;
  color?: string;
  fabric?: string;
  stock: number;
  price: number; // Selling price for this variant
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string; // Category ID
  subcategory?: string;
  childcategory?: string;
  brand: string;
  tags: string[];
  images: string[];
  video?: string;
  regularPrice: number;
  sellingPrice: number;
  costPrice: number;
  taxRate: number; // GST percentage (e.g. 18)
  stock: number;
  lowStockAlert: number;
  featured: boolean;
  trending: boolean;
  bestSeller: boolean;
  status: 'Active' | 'Inactive';
  attributes: {
    sizes: string[];
    colors: string[];
    fabrics: string[];
  };
  variants: ProductVariant[];
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  imageAlt?: string;
  createdAt: string;
}

export interface OrderProduct {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  variantInfo?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    addressLine: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: 'Razorpay' | 'COD';
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  paymentDetails?: {
    transactionId?: string;
    paymentId?: string;
    refundId?: string;
  };
  shippingCharges: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: 'Placed' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out For Delivery' | 'Delivered' | 'Cancelled' | 'Returned';
  timeline: {
    status: string;
    description: string;
    timestamp: string;
  }[];
  products: OrderProduct[];
  tracking?: {
    courierCompany?: string;
    trackingId?: string;
    trackingUrl?: string;
  };
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addressList: {
    addressLine: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }[];
  totalSpent: number;
  ordersCount: number;
  wishlistCount: number;
  status: 'Active' | 'Blocked';
  notes?: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  type: 'Homepage Slider' | 'Offer Banner' | 'Festival Banner' | 'Category Banner' | 'Popup Banner';
  image: string;
  title: string;
  buttonText: string;
  redirectLink: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Inactive';
}

export interface Coupon {
  id: string;
  code: string;
  type: 'Percentage' | 'Fixed' | 'Free Shipping';
  value: number; // Percent value or fixed discount amount
  minAmount: number;
  maxDiscount?: number;
  specificCategory?: string;
  specificProduct?: string;
  specificCustomer?: string;
  usageLimit: number;
  usageCount: number;
  expiryDate: string;
  status: 'Active' | 'Inactive';
}

export interface ActivityLog {
  id: string;
  userEmail: string;
  userName: string;
  role: string;
  action: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface StoreSettings {
  storeName: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  currency: string;
  currencySymbol: string;
  taxRateDefault: number;
  shippingZones: {
    zoneName: string;
    regions: string[]; // e.g. ["Gujarat", "Maharashtra"]
    charge: number;
    freeShippingMin: number;
    deliveryDays: number;
  }[];
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  whatsappNumber?: string;
  gstDetails?: string;
  maintenanceMode?: boolean;
}

export interface Review {
  id: string;
  productName: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  status: 'Approved' | 'Pending' | 'Hidden';
  reply?: string;
  createdAt: string;
}

export interface WebsiteContent {
  id: string; // 'about-us' | 'contact-page' | 'faq' | 'privacy-policy' | 'terms-condition' | 'return-policy'
  title: string;
  content: string; // Markdown or HTML representation
  lastUpdated: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  reason: string;
  customerNotes?: string;
  images: string[];
  status: 'Requested' | 'Approved' | 'Pickup Scheduled' | 'Received' | 'Refund Processing' | 'Refund Done' | 'Rejected';
  refundAmount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationTemplate {
  id: string;
  type: 'Email' | 'SMS';
  event: 'Order Placed' | 'Order Shipped' | 'Order Delivered' | 'Return Approved' | 'Refund Processed' | 'Custom';
  subject?: string;
  body: string;
  isActive: boolean;
  createdAt: string;
}

// In-Memory/JSON database structure
interface MockDatabaseSchema {
  users: User[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
  banners: Banner[];
  coupons: Coupon[];
  activity_logs: ActivityLog[];
  settings: StoreSettings;
  reviews: Review[];
  website_content: WebsiteContent[];
  return_requests: ReturnRequest[];
  notification_templates: NotificationTemplate[];
}

// Connect to MongoDB
export async function connectMongoDB() {
  if (!MONGODB_URI) {
    return null;
  }
  if (cachedConnection.conn) {
    return cachedConnection.conn;
  }

  if (!cachedConnection.promise) {
    const opts = {
      bufferCommands: false,
    };
    cachedConnection.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cachedConnection.conn = await cachedConnection.promise;
  } catch (e) {
    cachedConnection.promise = null;
    throw e;
  }

  return cachedConnection.conn;
}

// File-based local DB operations
class JSONDatabase {
  private data: MockDatabaseSchema | null = null;

  private read(): MockDatabaseSchema {
    if (this.data) return this.data;

    if (fs.existsSync(MOCK_DB_PATH)) {
      try {
        const fileContent = fs.readFileSync(MOCK_DB_PATH, 'utf-8');
        this.data = JSON.parse(fileContent);
        return this.data!;
      } catch (e) {
        console.error('Failed to read mock db file, recreating default data', e);
      }
    }

    // Default Seed Data
    const salt = bcrypt.genSaltSync(10);
    const superAdminPasswordHash = bcrypt.hashSync('Rush@123', salt);
    const adminPasswordHash = bcrypt.hashSync('Admin123', salt);

    const defaultData: MockDatabaseSchema = {
      users: [
        {
          id: 'usr_1',
          email: 'admin@rushcloset.com',
          name: 'Super Admin',
          passwordHash: superAdminPasswordHash,
          role: 'Super Admin',
          permissions: ['all'],
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
        }
      ],
      categories: [],
      products: [],
      orders: [],
      customers: [],
      banners: [],
      coupons: [],
      activity_logs: [
        {
          id: 'log_1',
          userEmail: 'admin@rushcloset.com',
          userName: 'Rushali Jivrajani',
          role: 'Super Admin',
          action: 'DB Initialize',
          details: 'Initialized mockup database structures',
          ipAddress: '127.0.0.1',
          timestamp: new Date().toISOString()
        }
      ],
      settings: {
        storeName: 'Rush Closet',
        logo: 'https://placehold.co/150x50/slate/white?text=RUSH+CLOSET',
        favicon: 'https://placehold.co/32x32/slate/white?text=RF',
        contactEmail: 'rushcloset@gmail.com',
        contactPhone: '+91 79 4001 0203',
        address: '501-505, Titanium Square, Thaltej, Ahmedabad, Gujarat, India',
        socialLinks: {
          facebook: 'https://facebook.com/rushcloset',
          instagram: 'https://instagram.com/rushcloset'
        },
        currency: 'INR',
        currencySymbol: '₹',
        taxRateDefault: 18,
        shippingZones: [
          { zoneName: 'Gujarat Local', regions: ['Gujarat'], charge: 50, freeShippingMin: 999, deliveryDays: 2 },
          { zoneName: 'Domestic Standard', regions: ['All States Except Gujarat', 'Other States'], charge: 100, freeShippingMin: 1499, deliveryDays: 5 }
        ]
      },
      reviews: [],
      website_content: [
        {
          id: 'about-us',
          title: 'About VIARO',
          content: JSON.stringify({
            story: {
              title: "Fashion Born in Ahmedabad. Worn Across India.",
              subtitle: "Modern. Minimal. Made for the now.",
              description: "VIARO is more than a brand — it's a vision crafted to make premium streetwear and luxury fashion accessible to the modern individual. Own your style."
            },
            founders: [
              {
                name: "Alvish",
                role: "Co-Founder & CEO",
                bio: "Alvish leads VIARO's strategic expansion, establishing our presence in premium streetwear circles.",
                image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400"
              },
              {
                name: "Bhavin",
                role: "Co-Founder & COO",
                bio: "Bhavin oversees product sourcing and retail operations, ensuring premium fabrications and standard of fit.",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
              },
              {
                name: "Vishwajeet",
                role: "Co-Founder & Creative Lead",
                bio: "Vishwajeet drives the visual identity and campaign drops, staying true to our streetwear-meets-luxury theme.",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400"
              }
            ],
            designCredit: "Designed by Rushali Jivrajani",
            values: [
              {
                title: "Premium Quality",
                desc: "Every piece is handpicked for exceptional fabric quality, fine stitching, and lasting comfort."
              },
              {
                title: "All India Delivery",
                desc: "From Kashmir to Kanyakumari — we deliver to every corner of India with care and speed."
              },
              {
                title: "Designed with Passion",
                desc: "Each collection reflects Alvish, Bhavin, and Vishwajeet's eye for modern design."
              },
              {
                title: "Customer First",
                desc: "Easy returns, responsive support, and transparent policies — because you deserve the best experience."
              }
            ]
          }, null, 2),
          lastUpdated: new Date().toISOString()
        }
      ],
      return_requests: [],
      notification_templates: [
        {
          id: 'notif_1',
          type: 'Email',
          event: 'Order Placed',
          subject: 'Order Confirmation - Rush Closet',
          body: 'Hello {{customerName}}, thank you for placing your order {{orderId}} with us!',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ]
    };

    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
    this.data = defaultData;
    return this.data;
  }

  private write(data: MockDatabaseSchema) {
    this.data = data;
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  }

  public getCollection<K extends keyof MockDatabaseSchema>(collectionName: K): MockDatabaseSchema[K] {
    const data = this.read();
    return data[collectionName];
  }

  public saveCollection<K extends keyof MockDatabaseSchema>(collectionName: K, collectionData: MockDatabaseSchema[K]) {
    const data = this.read();
    (data as any)[collectionName] = collectionData;
    this.write(data);
  }
}

const localDB = new JSONDatabase();

const getModel = (collectionName: string) => {
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }
  const schema = new mongoose.Schema({ id: String }, { 
    strict: false, 
    collection: collectionName,
    id: false // Disable Mongoose virtual id to prevent conflicts
  });
  return mongoose.model(collectionName, schema);
};

// General Database CRUD Helper Interface
export const db = {
  isMock: !MONGODB_URI,

  async getCollection<K extends keyof MockDatabaseSchema>(collectionName: K): Promise<MockDatabaseSchema[K]> {
    if (this.isMock) {
      return localDB.getCollection(collectionName);
    }
    await connectMongoDB();
    const Model = getModel(collectionName);
    const data = await Model.find().lean();
    // remove _id and __v for clean mapping
    return data.map((doc: any) => {
      const { _id, __v, ...rest } = doc;
      return rest;
    }) as unknown as MockDatabaseSchema[K];
  },

  async saveCollection<K extends keyof MockDatabaseSchema>(collectionName: K, collectionData: MockDatabaseSchema[K]): Promise<void> {
    if (this.isMock) {
      localDB.saveCollection(collectionName, collectionData);
      return;
    }
    await connectMongoDB();
    const Model = getModel(collectionName);
    await Model.deleteMany({});
    if (Array.isArray(collectionData) && collectionData.length > 0) {
      await Model.insertMany(collectionData);
    }
  },

  // Simplified CRUD handlers
  async find<K extends keyof MockDatabaseSchema>(
    collectionName: K,
    filter?: ((item: any) => boolean) | object
  ): Promise<any[]> {
    if (this.isMock) {
      const items = await this.getCollection(collectionName) as any[];
      if (typeof filter === 'function') {
        return items.filter(filter as (item: any) => boolean);
      } else if (filter) {
        return items.filter(item => Object.keys(filter).every(k => item[k] === (filter as any)[k]));
      }
      return items;
    }

    await connectMongoDB();
    const Model = getModel(collectionName);
    
    if (typeof filter === 'function') {
       const data = await Model.find().lean();
       const mappedData = data.map((doc: any) => {
          const { _id, __v, ...rest } = doc;
          return { id: _id.toString(), ...rest };
       });
       return mappedData.filter(filter as (item: any) => boolean);
    } else if (typeof filter === 'object') {
       const data = await Model.find(filter as any).lean();
       return data.map((doc: any) => {
          const { _id, __v, ...rest } = doc;
          return { id: _id.toString(), ...rest };
       });
    } else {
       const data = await Model.find().lean();
       return data.map((doc: any) => {
          const { _id, __v, ...rest } = doc;
          return { id: _id.toString(), ...rest };
       });
    }
  },

  async findOne<K extends keyof MockDatabaseSchema>(
    collectionName: K,
    filter: ((item: any) => boolean) | object
  ): Promise<any | null> {
    const items = await this.find(collectionName, filter);
    return items.length > 0 ? items[0] : null;
  },

  async create<K extends keyof MockDatabaseSchema>(
    collectionName: K,
    document: any
  ): Promise<any> {
    const newDoc = {
      id: document.id || `${collectionName.slice(0, 4)}_${Math.random().toString(36).substring(2, 11)}`,
      ...document,
      createdAt: document.createdAt || new Date().toISOString()
    };
    
    if (this.isMock) {
      const items = await this.getCollection(collectionName) as any[];
      items.push(newDoc);
      localDB.saveCollection(collectionName, items as any);
      return newDoc;
    }

    await connectMongoDB();
    const Model = getModel(collectionName);
    await Model.create(newDoc);
    return newDoc;
  },

  async updateOne<K extends keyof MockDatabaseSchema>(
    collectionName: K,
    filter: ((item: any) => boolean) | object,
    updateData: any
  ): Promise<any | null> {
    if (this.isMock) {
      const items = await this.getCollection(collectionName) as any[];
      const match = typeof filter === 'function' ? items.find(filter as (item: any) => boolean) : items.find(item => Object.keys(filter).every(k => item[k] === (filter as any)[k]));
      if (!match) return null;
      const index = items.findIndex(i => i.id === match.id);
      const updatedDoc = { ...items[index], ...updateData };
      items[index] = updatedDoc;
      localDB.saveCollection(collectionName, items as any);
      return updatedDoc;
    }

    await connectMongoDB();
    const Model = getModel(collectionName);
    
    let targetId;
    if (typeof filter === 'function') {
      const items = await this.find(collectionName, filter);
      if (items.length === 0) return null;
      targetId = items[0].id;
    } else {
       const doc = await Model.findOne(filter as any).lean();
       if (!doc) return null;
       targetId = (doc as any).id;
    }

    await Model.updateOne({ id: targetId } as any, { $set: updateData } as any);
    const updated = await Model.findOne({ id: targetId } as any).lean();
    if (updated) {
       const { _id, __v, ...rest } = updated as any;
       return rest;
    }
    return null;
  },

  async deleteOne<K extends keyof MockDatabaseSchema>(
    collectionName: K,
    filter: ((item: any) => boolean) | object
  ): Promise<boolean> {
    if (this.isMock) {
      const items = await this.getCollection(collectionName) as any[];
      let matchId: string | null = null;
      if (typeof filter === 'function') {
         const match = items.find(filter as (item: any) => boolean);
         if (match) matchId = match.id;
      } else {
         const match = items.find(item => Object.keys(filter).every(k => item[k] === (filter as any)[k]));
         if (match) matchId = match.id;
      }
      if (!matchId) return false;
      const filteredItems = items.filter(item => item.id !== matchId);
      localDB.saveCollection(collectionName, filteredItems as any);
      return true;
    }

    await connectMongoDB();
    const Model = getModel(collectionName);
    
    let targetId;
    if (typeof filter === 'function') {
      const items = await this.find(collectionName, filter);
      if (items.length === 0) return false;
      targetId = items[0].id;
    } else {
      const doc = await Model.findOne(filter as any).lean();
      if (!doc) return false;
      targetId = (doc as any).id;
    }

    const res = await Model.deleteOne({ id: targetId } as any);
    return res.deletedCount > 0;
  }
};
