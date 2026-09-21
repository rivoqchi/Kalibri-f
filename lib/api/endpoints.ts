export const endpoints = {
  products: {
    list: "/api/products",
    admin: "/api/products/admin",
    priceRange: "/api/products/price-range",
    bySlug: (slug: string) => `/api/products/${slug}`,
    byId: (id: string) => `/api/products/${id}`,
  },
  categories: {
    list: "/api/categories",
    admin: "/api/categories/admin",
    bySlug: (slug: string) => `/api/categories/${slug}`,
    byId: (id: string) => `/api/categories/${id}`,
  },
  brands: {
    list: "/api/brands",
    admin: "/api/brands/admin",
    byId: (id: string) => `/api/brands/${id}`,
  },
  attributes: {
    list: "/api/attributes",
    admin: "/api/attributes/admin",
    byId: (id: string) => `/api/attributes/${id}`,
  },
  partners: {
    list: "/api/partners",
    admin: "/api/partners/admin",
    byId: (id: string) => `/api/partners/${id}`,
  },
  productServices: {
    list: "/api/product-services",
    admin: "/api/product-services/admin",
    byId: (id: string) => `/api/product-services/${id}`,
  },
  productDirections: {
    list: "/api/product-directions",
    admin: "/api/product-directions/admin",
    byId: (id: string) => `/api/product-directions/${id}`,
  },
  homeAds: {
    list: "/api/home-ads",
    admin: "/api/home-ads/admin",
    byId: (id: string) => `/api/home-ads/${id}`,
  },
  users: {
    admin: "/api/users/admin",
    byId: (id: string) => `/api/users/${id}`,
  },
  cart: {
    get: "/api/cart",
    addItem: "/api/cart/items",
    item: (productId: string) => `/api/cart/items/${productId}`,
  },
  favorites: {
    get: "/api/favorites",
    addItem: "/api/favorites/items",
    item: (productId: string) => `/api/favorites/items/${productId}`,
  },
  search: {
    products: "/api/search/products",
    suggest: "/api/search/suggest",
    history: "/api/search/history",
    recentProducts: "/api/search/recent-products",
  },
  checkout: {
    create: "/api/checkout",
  },
  orders: {
    list: "/api/orders",
    admin: "/api/orders/admin",
    byId: (id: string) => `/api/orders/${id}`,
    status: (id: string) => `/api/orders/${id}/status`,
  },
  notifications: {
    list: "/api/notifications",
    read: (id: string) => `/api/notifications/${id}/read`,
  },
  seo: {
    templates: "/api/seo/templates",
    search: (q: string) => `/api/seo/search?q=${encodeURIComponent(q)}`,
    product: (slug: string) => `/api/seo/product/${slug}`,
    sitemap: "/api/seo/sitemap",
  },
  media: {
    upload: "/api/media/upload",
    uploadUrl: "/api/media/upload-url",
  },
  auth: {
    bot: "/api/auth/telegram/bot",
    verify: "/api/auth/telegram/verify",
    webapp: "/api/auth/telegram/webapp",
    me: "/api/auth/me",
    mePhoto: "/api/auth/me/photo",
  },
  admin: {
    panel: "/api/admin",
  },
  health: "/api/health",
} as const;
