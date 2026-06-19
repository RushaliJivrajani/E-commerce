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
    const superAdminPasswordHash = bcrypt.hashSync('Password123', salt);
    const adminPasswordHash = bcrypt.hashSync('Admin123', salt);

    const defaultData: MockDatabaseSchema = {
      users: [
        {
          id: 'usr_1',
          email: 'admin@rushfashion.com',
          name: 'Rushali Jivrajani',
          passwordHash: superAdminPasswordHash,
          role: 'Super Admin',
          permissions: ['all'],
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'usr_2',
          email: 'manager@rushfashion.com',
          name: 'John Doe',
          passwordHash: adminPasswordHash,
          role: 'Manager',
          permissions: ['add_product', 'edit_product', 'view_orders', 'edit_orders'],
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
        }
      ],
      categories: [
        { id: 'cat_1', name: 'Women', slug: 'women', status: 'Active', position: 1 },
        { id: 'cat_2', name: 'Men', slug: 'men', status: 'Active', position: 2 },
        { id: 'cat_3', name: 'Kids', slug: 'kids', status: 'Active', position: 3 },
        { id: 'cat_1_sub1', name: 'Dresses', slug: 'dresses', parentId: 'cat_1', status: 'Active', position: 1 },
        { id: 'cat_1_sub2', name: 'Tops', slug: 'tops', parentId: 'cat_1', status: 'Active', position: 2 },
        { id: 'cat_1_sub1_child1', name: 'Party Dress', slug: 'party-dress', parentId: 'cat_1_sub1', status: 'Active', position: 1 }
      ],
      products: [
        {
          id: 'prod_1',
          name: 'Elegant Velvet Night Dress',
          slug: 'elegant-velvet-night-dress',
          description: 'A luxurious velvet dress perfect for parties and formal evening gatherings. Features a sweetheart neckline and rich premium drape.',
          shortDescription: 'Luxurious evening dress in deep midnight black velvet.',
          category: 'cat_1',
          subcategory: 'cat_1_sub1',
          childcategory: 'cat_1_sub1_child1',
          brand: 'Velvet Queen',
          tags: ['velvet', 'night', 'dress', 'partywear'],
          images: [
            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop&q=60'
          ],
          regularPrice: 2499,
          sellingPrice: 1999,
          costPrice: 950,
          taxRate: 18,
          stock: 45,
          lowStockAlert: 10,
          featured: true,
          trending: true,
          bestSeller: true,
          status: 'Active',
          attributes: {
            sizes: ['S', 'M', 'L'],
            colors: ['Midnight Black', 'Emerald Green'],
            fabrics: ['Velvet']
          },
          variants: [
            { sku: 'RF-EVD-S-BLK', size: 'S', color: 'Midnight Black', fabric: 'Velvet', stock: 15, price: 1999 },
            { sku: 'RF-EVD-M-BLK', size: 'M', color: 'Midnight Black', fabric: 'Velvet', stock: 10, price: 1999 },
            { sku: 'RF-EVD-L-BLK', size: 'L', color: 'Midnight Black', fabric: 'Velvet', stock: 5, price: 2199 },
            { sku: 'RF-EVD-S-GRN', size: 'S', color: 'Emerald Green', fabric: 'Velvet', stock: 8, price: 1999 },
            { sku: 'RF-EVD-M-GRN', size: 'M', color: 'Emerald Green', fabric: 'Velvet', stock: 7, price: 1999 }
          ],
          createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
        }
      ],
      orders: [],
      customers: [],
      banners: [
        {
          id: 'ban_1',
          type: 'Homepage Slider',
          image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80',
          title: 'Summer Solstice Elegance',
          buttonText: 'Shop New Arrivals',
          redirectLink: '/shop',
          startDate: '2026-06-01',
          endDate: '2026-08-31',
          status: 'Active'
        }
      ],
      coupons: [
        {
          id: 'coup_1',
          code: 'RUSH20',
          type: 'Percentage',
          value: 20,
          minAmount: 1499,
          maxDiscount: 500,
          usageLimit: 100,
          usageCount: 0,
          expiryDate: '2026-12-31',
          status: 'Active'
        }
      ],
      activity_logs: [
        {
          id: 'log_1',
          userEmail: 'admin@rushfashion.com',
          userName: 'Rushali Jivrajani',
          role: 'Super Admin',
          action: 'DB Initialize',
          details: 'Initialized mockup database structures',
          ipAddress: '127.0.0.1',
          timestamp: new Date().toISOString()
        }
      ],
      settings: {
        storeName: 'Rush Fashion',
        logo: 'https://placehold.co/150x50/slate/white?text=RUSH+FASHION',
        favicon: 'https://placehold.co/32x32/slate/white?text=RF',
        contactEmail: 'rushfashion@gmail.com',
        contactPhone: '+91 79 4001 0203',
        address: '501-505, Titanium Square, Thaltej, Ahmedabad, Gujarat, India',
        socialLinks: {
          facebook: 'https://facebook.com/rushfashion',
          instagram: 'https://instagram.com/rushfashion'
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
          title: 'About Rush Fashion',
          content: '<h1>About Us</h1><p>Rush Fashion is a premium fashion destination offering contemporary apparel for men, women, and children. Founded in 2024, we aim to merge luxury textures with streetwear styles.</p>',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'return-policy',
          title: 'Return Policy',
          content: '<h1>Return Policy</h1><p>We offer a hassle-free 7-day return and exchange policy on all unused garments containing tags intact.</p>',
          lastUpdated: new Date().toISOString()
        }
      ],
      return_requests: [],
      notification_templates: [
        {
          id: 'notif_1',
          type: 'Email',
          event: 'Order Placed',
          subject: 'Order Confirmation - Rush Fashion',
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
  const schema = new mongoose.Schema({}, { strict: false, collection: collectionName });
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
    const data = await Model.find({}).lean();
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
        return items.filter(filter);
      } else if (filter) {
        return items.filter(item => Object.keys(filter).every(k => item[k] === (filter as any)[k]));
      }
      return items;
    }

    await connectMongoDB();
    const Model = getModel(collectionName);
    
    if (typeof filter === 'function') {
       const data = await Model.find({}).lean();
       const mappedData = data.map((doc: any) => {
          const { _id, __v, ...rest } = doc;
          return rest;
       });
       return mappedData.filter(filter);
    } else if (typeof filter === 'object') {
       const data = await Model.find(filter).lean();
       return data.map((doc: any) => {
          const { _id, __v, ...rest } = doc;
          return rest;
       });
    } else {
       const data = await Model.find({}).lean();
       return data.map((doc: any) => {
          const { _id, __v, ...rest } = doc;
          return rest;
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
      const match = typeof filter === 'function' ? items.find(filter) : items.find(item => Object.keys(filter).every(k => item[k] === (filter as any)[k]));
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
       const doc = await Model.findOne(filter).lean();
       if (!doc) return null;
       targetId = (doc as any).id;
    }

    await Model.updateOne({ id: targetId }, { $set: updateData });
    const updated = await Model.findOne({ id: targetId }).lean();
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
         const match = items.find(filter);
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
      const doc = await Model.findOne(filter).lean();
      if (!doc) return false;
      targetId = (doc as any).id;
    }

    const res = await Model.deleteOne({ id: targetId });
    return res.deletedCount > 0;
  }
};
