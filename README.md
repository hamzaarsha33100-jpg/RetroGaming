# 🎮 Retro Gaming - Enterprise E-Commerce Platform

<div align="center">
  <h3>Premium Gaming Accessories E-Commerce Platform</h3>
  <p>Built with Next.js 15, TypeScript, MongoDB, and Modern Web Technologies</p>
</div>

---

## 🌟 Features

### 🛍️ **Customer Features**
- ✅ Advanced product browsing with filters
- ✅ Shopping cart with persistence
- ✅ Secure checkout with Stripe
- ✅ User authentication (Google OAuth + Email/Password)
- ✅ Order tracking and history
- ✅ Wishlist functionality
- ✅ Coupon system
- ✅ Global product search
- ✅ Responsive design (Mobile, Tablet, Desktop)

### 🛠️ **Admin Dashboard**
- ✅ Complete analytics dashboard
- ✅ Product management (CRUD)
- ✅ Order management with status updates
- ✅ Customer management
- ✅ Category management
- ✅ Coupon management
- ✅ Banner management
- ✅ Revenue tracking & charts

### 🔒 **Security**
- ✅ NextAuth.js authentication
- ✅ Role-based access control
- ✅ Secure payment processing
- ✅ Password hashing
- ✅ Protected API routes

---

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN UI + Radix UI
- **Animations**: Framer Motion + GSAP
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod

### Backend
- **Database**: MongoDB + Mongoose
- **Authentication**: NextAuth.js v5
- **OAuth**: Google Provider
- **Email**: Nodemailer
- **Payments**: Stripe
- **Image Management**: ImageKit

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Git

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/Bunnytaha/RetroGaming.git
cd RetroGaming
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Create environment file**

Create `.env.local` in root directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# ImageKit (Optional)
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_endpoint

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@retrogaming.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:3000
```

---

## 📁 Project Structure

```
Retro Gaming/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication pages
│   ├── (store)/             # Customer-facing pages
│   ├── admin/               # Admin dashboard
│   └── api/                 # API routes
├── components/              # React components
│   ├── admin/              # Admin components
│   ├── cart/               # Cart components
│   ├── home/               # Homepage components
│   ├── layout/             # Layout components
│   ├── products/           # Product components
│   └── ui/                 # Reusable UI components
├── lib/                     # Utilities and configs
├── models/                  # Database models
├── store/                   # Zustand stores
├── types/                   # TypeScript types
└── public/                  # Static assets
```

---

## 🎯 Key Pages

### Customer Pages
- `/` - Homepage
- `/categories` - Products listing
- `/products/[slug]` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout process
- `/account` - User account
- `/account/orders` - Order history
- `/account/wishlist` - Wishlist

### Admin Pages
- `/admin` - Dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/categories` - Category management
- `/admin/customers` - Customer management
- `/admin/coupons` - Coupon management
- `/admin/banners` - Banner management

---

## 🔑 Environment Variables

### Required
- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - Random secret for NextAuth
- `NEXTAUTH_URL` - App URL

### Optional (for full functionality)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `STRIPE_PUBLIC_KEY` - Stripe public key
- `STRIPE_SECRET_KEY` - Stripe secret key
- ImageKit credentials
- SMTP credentials

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Bunnytaha/RetroGaming)

---

## 📊 Database Models

- **User** - User accounts and authentication
- **Product** - Product catalog
- **Category** - Product categories
- **Order** - Customer orders
- **Coupon** - Discount coupons
- **Banner** - Homepage banners
- **Review** - Product reviews
- **Newsletter** - Email subscriptions
- **Page** - CMS pages

---

## 🎨 Design

- **Theme**: Dark futuristic gaming aesthetic
- **Colors**: Purple, Pink, Cyan gradients
- **Effects**: Glassmorphism, Neon accents
- **Typography**: Gaming-inspired fonts
- **Animations**: Smooth transitions and micro-interactions

---

## 📈 Performance

- Server-side rendering (SSR)
- Static generation where possible
- Image optimization
- Code splitting
- Lazy loading
- React Query caching

---

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Bunny Taha**
- GitHub: [@Bunnytaha](https://github.com/Bunnytaha)

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting platform
- Radix UI for accessible components
- All open-source contributors

---

## 📞 Support

For support, email support@retrogaming.com or open an issue on GitHub.

---

<div align="center">
  <p>Made with ❤️ for Gamers</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
