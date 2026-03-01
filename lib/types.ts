export interface Product {
  id: string
  title: string
  price: number
  compare_price: number | null
  category: string
  collection: string
  colors: ProductColor[]
  sizes: string[]
  image_url: string
  description: string
  condition: string
  badge: string | null
  stock: number
  is_active: boolean
  created_at: string
}

export interface ProductColor {
  n: string
  h: string
}

export interface CartItem {
  key: string
  id: string
  title: string
  price: number
  color: string
  size: string
  qty: number
  img: string
}

export interface Customer {
  id: string
  email: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  auth_id: string | null
  created_at: string
}

export interface Order {
  id: string
  customer_id: string
  paypal_order_id: string | null
  paypal_capture_id: string | null
  status: 'paid' | 'processing' | 'shipped' | 'delivered'
  subtotal: number
  discount: number
  shipping: number
  total: number
  promo_code: string | null
  shipping_name: string
  shipping_email: string
  shipping_address: string | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_zip: string | null
  tracking_number: string | null
  carrier: string | null
  shipped_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
  // joined
  customer?: Customer
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  title: string
  price: number
  color: string
  size: string
  quantity: number
  image_url: string
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  order_id: string | null
  is_read: boolean
  created_at: string
}
