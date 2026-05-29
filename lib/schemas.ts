// lib/schemas.ts
import { DataSchema, OperatorMeta, OperatorType } from '@/types/query'

// ============================================
// OPERATOR METADATA REGISTRY
// ============================================

export const OPERATOR_META: Record<OperatorType, OperatorMeta> = {
  equals: {
    value: 'equals',
    label: 'Equals',
    requiresValue: true,
    requiresSecondValue: false,
    inputType: 'text',
  },
  not_equals: {
    value: 'not_equals',
    label: 'Not Equals',
    requiresValue: true,
    requiresSecondValue: false,
    inputType: 'text',
  },
  contains: {
    value: 'contains',
    label: 'Contains',
    requiresValue: true,
    requiresSecondValue: false,
    inputType: 'text',
  },
  not_contains: {
    value: 'not_contains',
    label: 'Does Not Contain',
    requiresValue: true,
    requiresSecondValue: false,
    inputType: 'text',
  },
  starts_with: {
    value: 'starts_with',
    label: 'Starts With',
    requiresValue: true,
    requiresSecondValue: false,
    inputType: 'text',
  },
  ends_with: {
    value: 'ends_with',
    label: 'Ends With',
    requiresValue: true,
    requiresSecondValue: false,
    inputType: 'text',
  },
  greater_than: {
    value: 'greater_than',
    label: 'Greater Than',
    requiresValue: true,
    requiresSecondValue: false,
    inputType: 'number',
  },
  less_than: {
    value: 'less_than',
    label: 'Less Than',
    requiresValue: true,
    requiresSecondValue: false,
    inputType: 'number',
  },
  greater_than_or_equal: {
    value: 'greater_than_or_equal',
    label: 'Greater Than or Equal',
    requiresValue: true,
    requiresSecondValue: false,
    inputType: 'number',
  },
  less_than_or_equal: {
    value: 'less_than_or_equal',
    label: 'Less Than or Equal',
    requiresValue: true,
    requiresSecondValue: false,
    inputType: 'number',
  },
  between: {
    value: 'between',
    label: 'Between',
    requiresValue: true,
    requiresSecondValue: true,
    inputType: 'number',
  },
  in_array: {
    value: 'in_array',
    label: 'In Array',
    requiresValue: true,
    requiresSecondValue: false,
    inputType: 'array',
  },
  not_in_array: {
    value: 'not_in_array',
    label: 'Not In Array',
    requiresValue: true,
    requiresSecondValue: false,
    inputType: 'array',
  },
  is_null: {
    value: 'is_null',
    label: 'Is Null',
    requiresValue: false,
    requiresSecondValue: false,
    inputType: 'none',
  },
  is_not_null: {
    value: 'is_not_null',
    label: 'Is Not Null',
    requiresValue: false,
    requiresSecondValue: false,
    inputType: 'none',
  },
  regex: {
    value: 'regex',
    label: 'Matches Regex',
    requiresValue: true,
    requiresSecondValue: false,
    inputType: 'text',
  },
  date_before: {
    value: 'date_before',
    label: 'Before',
    requiresValue: true,
    requiresSecondValue: false,
    inputType: 'date',
  },
  date_after: {
    value: 'date_after',
    label: 'After',
    requiresValue: true,
    requiresSecondValue: false,
    inputType: 'date',
  },
  date_between: {
    value: 'date_between',
    label: 'Date Between',
    requiresValue: true,
    requiresSecondValue: true,
    inputType: 'date',
  },
}

// ============================================
// OPERATORS ALLOWED PER FIELD TYPE
// ============================================

export const FIELD_TYPE_OPERATORS: Record<string, OperatorType[]> = {
  string: [
    'equals',
    'not_equals',
    'contains',
    'not_contains',
    'starts_with',
    'ends_with',
    'in_array',
    'not_in_array',
    'is_null',
    'is_not_null',
    'regex',
  ],
  number: [
    'equals',
    'not_equals',
    'greater_than',
    'less_than',
    'greater_than_or_equal',
    'less_than_or_equal',
    'between',
    'in_array',
    'not_in_array',
    'is_null',
    'is_not_null',
  ],
  boolean: ['equals', 'not_equals', 'is_null', 'is_not_null'],
  date: [
    'equals',
    'not_equals',
    'date_before',
    'date_after',
    'date_between',
    'is_null',
    'is_not_null',
  ],
  enum: [
    'equals',
    'not_equals',
    'in_array',
    'not_in_array',
    'is_null',
    'is_not_null',
  ],
  array: ['in_array', 'not_in_array', 'is_null', 'is_not_null'],
}

// ============================================
// MOCK SCHEMAS
// ============================================

export const MOCK_SCHEMAS: DataSchema[] = [
  {
    id: 'users',
    name: 'Users',
    description: 'User accounts and profile data',
    fields: [
      { name: 'id', label: 'ID', type: 'number' },
      { name: 'name', label: 'Full Name', type: 'string' },
      { name: 'email', label: 'Email', type: 'string' },
      { name: 'age', label: 'Age', type: 'number' },
      {
        name: 'status',
        label: 'Status',
        type: 'enum',
        enumOptions: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Banned', value: 'banned' },
          { label: 'Pending', value: 'pending' },
        ],
      },
      {
        name: 'country',
        label: 'Country',
        type: 'enum',
        enumOptions: [
          { label: 'Nigeria', value: 'NG' },
          { label: 'Ghana', value: 'GH' },
          { label: 'Kenya', value: 'KE' },
          { label: 'South Africa', value: 'ZA' },
          { label: 'United States', value: 'US' },
          { label: 'United Kingdom', value: 'UK' },
        ],
      },
      { name: 'createdAt', label: 'Created At', type: 'date' },
      { name: 'purchases', label: 'Total Purchases', type: 'number' },
      { name: 'isVerified', label: 'Is Verified', type: 'boolean' },
      { name: 'tags', label: 'Tags', type: 'array' },
    ],
  },
  {
    id: 'products',
    name: 'Products',
    description: 'Product catalog and inventory',
    fields: [
      { name: 'id', label: 'ID', type: 'number' },
      { name: 'name', label: 'Product Name', type: 'string' },
      { name: 'sku', label: 'SKU', type: 'string' },
      { name: 'price', label: 'Price ($)', type: 'number' },
      { name: 'stock', label: 'Stock Count', type: 'number' },
      {
        name: 'category',
        label: 'Category',
        type: 'enum',
        enumOptions: [
          { label: 'Electronics', value: 'electronics' },
          { label: 'Clothing', value: 'clothing' },
          { label: 'Food', value: 'food' },
          { label: 'Books', value: 'books' },
          { label: 'Sports', value: 'sports' },
        ],
      },
      {
        name: 'status',
        label: 'Status',
        type: 'enum',
        enumOptions: [
          { label: 'In Stock', value: 'in_stock' },
          { label: 'Out of Stock', value: 'out_of_stock' },
          { label: 'Discontinued', value: 'discontinued' },
        ],
      },
      { name: 'createdAt', label: 'Created At', type: 'date' },
      { name: 'isActive', label: 'Is Active', type: 'boolean' },
      { name: 'rating', label: 'Rating', type: 'number' },
    ],
  },
  {
    id: 'orders',
    name: 'Orders',
    description: 'Customer orders and transactions',
    fields: [
      { name: 'id', label: 'Order ID', type: 'number' },
      { name: 'customerId', label: 'Customer ID', type: 'number' },
      { name: 'total', label: 'Total Amount ($)', type: 'number' },
      {
        name: 'status',
        label: 'Order Status',
        type: 'enum',
        enumOptions: [
          { label: 'Pending', value: 'pending' },
          { label: 'Processing', value: 'processing' },
          { label: 'Shipped', value: 'shipped' },
          { label: 'Delivered', value: 'delivered' },
          { label: 'Cancelled', value: 'cancelled' },
          { label: 'Refunded', value: 'refunded' },
        ],
      },
      {
        name: 'paymentMethod',
        label: 'Payment Method',
        type: 'enum',
        enumOptions: [
          { label: 'Credit Card', value: 'credit_card' },
          { label: 'Debit Card', value: 'debit_card' },
          { label: 'PayPal', value: 'paypal' },
          { label: 'Crypto', value: 'crypto' },
          { label: 'Bank Transfer', value: 'bank_transfer' },
        ],
      },
      { name: 'createdAt', label: 'Order Date', type: 'date' },
      { name: 'deliveredAt', label: 'Delivery Date', type: 'date' },
      { name: 'itemCount', label: 'Item Count', type: 'number' },
      { name: 'isPriority', label: 'Is Priority', type: 'boolean' },
    ],
  },
]

// ============================================
// MOCK DATASETS
// ============================================

export const MOCK_DATASETS: Record<string, Record<string, unknown>[]> = {
  users: [
    { id: 1, name: 'Chidi Okeke', email: 'chidi@example.com', age: 28, status: 'active', country: 'NG', purchases: 15, isVerified: true, createdAt: '2024-01-15', tags: ['premium', 'early-adopter'] },
    { id: 2, name: 'Amina Bello', email: 'amina@example.com', age: 34, status: 'active', country: 'NG', purchases: 42, isVerified: true, createdAt: '2023-06-20', tags: ['vip'] },
    { id: 3, name: 'Kwame Asante', email: 'kwame@example.com', age: 22, status: 'pending', country: 'GH', purchases: 3, isVerified: false, createdAt: '2024-03-10', tags: [] },
    { id: 4, name: 'Fatima Al-Hassan', email: 'fatima@example.com', age: 29, status: 'active', country: 'KE', purchases: 27, isVerified: true, createdAt: '2023-11-05', tags: ['premium'] },
    { id: 5, name: 'Sipho Dlamini', email: 'sipho@example.com', age: 45, status: 'inactive', country: 'ZA', purchases: 8, isVerified: true, createdAt: '2022-08-18', tags: [] },
    { id: 6, name: 'Ngozi Adeyemi', email: 'ngozi@example.com', age: 31, status: 'active', country: 'NG', purchases: 56, isVerified: true, createdAt: '2023-02-14', tags: ['vip', 'premium'] },
    { id: 7, name: 'James Thornton', email: 'james@example.com', age: 19, status: 'banned', country: 'US', purchases: 0, isVerified: false, createdAt: '2024-05-01', tags: [] },
    { id: 8, name: 'Aisha Mohammed', email: 'aisha@example.com', age: 26, status: 'active', country: 'NG', purchases: 19, isVerified: true, createdAt: '2023-09-22', tags: ['early-adopter'] },
    { id: 9, name: 'David Osei', email: 'david@example.com', age: 38, status: 'active', country: 'GH', purchases: 33, isVerified: true, createdAt: '2022-12-30', tags: ['premium'] },
    { id: 10, name: 'Sarah Kimani', email: 'sarah@example.com', age: 24, status: 'pending', country: 'KE', purchases: 1, isVerified: false, createdAt: '2024-04-17', tags: [] },
    { id: 11, name: 'Emeka Obi', email: 'emeka@example.com', age: 52, status: 'active', country: 'NG', purchases: 78, isVerified: true, createdAt: '2021-07-09', tags: ['vip', 'premium', 'early-adopter'] },
    { id: 12, name: 'Lena Müller', email: 'lena@example.com', age: 27, status: 'active', country: 'UK', purchases: 11, isVerified: true, createdAt: '2023-10-03', tags: [] },
  ],
  products: [
    { id: 1, name: 'MacBook Pro 16"', sku: 'MBP-16-001', price: 2499, stock: 45, category: 'electronics', status: 'in_stock', isActive: true, rating: 4.8, createdAt: '2023-01-10' },
    { id: 2, name: 'Nike Air Max 270', sku: 'NAM-270-BLK', price: 150, stock: 200, category: 'clothing', status: 'in_stock', isActive: true, rating: 4.5, createdAt: '2023-03-15' },
    { id: 3, name: 'Atomic Habits', sku: 'BK-AH-001', price: 18, stock: 500, category: 'books', status: 'in_stock', isActive: true, rating: 4.9, createdAt: '2022-11-20' },
    { id: 4, name: 'Sony WH-1000XM5', sku: 'SNY-WH-XM5', price: 349, stock: 0, category: 'electronics', status: 'out_of_stock', isActive: true, rating: 4.7, createdAt: '2023-05-08' },
    { id: 5, name: 'Yoga Mat Pro', sku: 'YMP-001-BLU', price: 65, stock: 120, category: 'sports', status: 'in_stock', isActive: true, rating: 4.3, createdAt: '2023-07-22' },
    { id: 6, name: 'iPhone 15 Pro', sku: 'APL-IP15P-256', price: 999, stock: 88, category: 'electronics', status: 'in_stock', isActive: true, rating: 4.6, createdAt: '2023-09-12' },
    { id: 7, name: 'Levi\'s 501 Jeans', sku: 'LV-501-32', price: 89, stock: 0, category: 'clothing', status: 'discontinued', isActive: false, rating: 4.1, createdAt: '2021-06-30' },
    { id: 8, name: 'Whey Protein 5lb', sku: 'WP-5LB-VNL', price: 55, stock: 300, category: 'food', status: 'in_stock', isActive: true, rating: 4.4, createdAt: '2023-08-14' },
  ],
  orders: [
    { id: 1001, customerId: 1, total: 2499, status: 'delivered', paymentMethod: 'credit_card', createdAt: '2024-01-20', deliveredAt: '2024-01-25', itemCount: 1, isPriority: false },
    { id: 1002, customerId: 2, total: 498, status: 'shipped', paymentMethod: 'paypal', createdAt: '2024-02-14', deliveredAt: null, itemCount: 3, isPriority: true },
    { id: 1003, customerId: 6, total: 1047, status: 'processing', paymentMethod: 'bank_transfer', createdAt: '2024-03-01', deliveredAt: null, itemCount: 2, isPriority: false },
    { id: 1004, customerId: 3, total: 18, status: 'delivered', paymentMethod: 'credit_card', createdAt: '2024-03-10', deliveredAt: '2024-03-13', itemCount: 1, isPriority: false },
    { id: 1005, customerId: 11, total: 3498, status: 'pending', paymentMethod: 'crypto', createdAt: '2024-04-05', deliveredAt: null, itemCount: 4, isPriority: true },
    { id: 1006, customerId: 4, total: 215, status: 'cancelled', paymentMethod: 'debit_card', createdAt: '2024-04-18', deliveredAt: null, itemCount: 2, isPriority: false },
    { id: 1007, customerId: 8, total: 764, status: 'delivered', paymentMethod: 'credit_card', createdAt: '2024-05-02', deliveredAt: '2024-05-07', itemCount: 5, isPriority: true },
    { id: 1008, customerId: 9, total: 349, status: 'refunded', paymentMethod: 'paypal', createdAt: '2024-05-10', deliveredAt: null, itemCount: 1, isPriority: false },
  ],
}