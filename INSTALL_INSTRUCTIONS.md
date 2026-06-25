# 🚀 Installation & Running Instructions

## ✅ FIXED: Dependency Conflict Resolved!

The nodemailer version has been updated in package.json to v7.0.13 to match next-auth requirements.

---

## 📦 Step 1: Install Dependencies

Run this command in CMD (Command Prompt):

```cmd
cd "c:\Users\tahar\OneDrive\Desktop\Retro Games"
npm install --legacy-peer-deps
```

**OR if that doesn't work:**

```cmd
npm install --force
```

---

## ⚙️ Step 2: Create Environment File

Create a file named `.env.local` in the project root with these variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/retrogaming?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-generate-random-string

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe (Get from Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# ImageKit (Get from ImageKit Dashboard)
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your-public-key
IMAGEKIT_PRIVATE_KEY=your-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id

# Email (Optional - for development you can skip this)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@retrogaming.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 🔑 How to Generate NEXTAUTH_SECRET:

Run this in CMD:
```cmd
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🏃 Step 3: Run Development Server

```cmd
npm run dev
```

You should see:
```
▲ Next.js 15.3.3
- Local:        http://localhost:3000
- Ready in 2.5s
```

---

## 🌐 Step 4: Open in Browser

Open your browser and go to:

**Homepage**: http://localhost:3000

---

## 🗄️ Step 5: Seed Database (Optional)

If you want sample data:

```cmd
npm run seed
```

---

## 📱 Access Points

### Customer Side:
- **Homepage**: http://localhost:3000
- **Products**: http://localhost:3000/categories
- **Login**: http://localhost:3000/login
- **Signup**: http://localhost:3000/signup
- **Cart**: http://localhost:3000/cart
- **Search**: http://localhost:3000/search

### Admin Side:
- **Admin Dashboard**: http://localhost:3000/admin
- **Products**: http://localhost:3000/admin/products
- **Orders**: http://localhost:3000/admin/orders
- **Categories**: http://localhost:3000/admin/categories
- **Customers**: http://localhost:3000/admin/customers
- **Coupons**: http://localhost:3000/admin/coupons
- **Banners**: http://localhost:3000/admin/banners

### Default Admin Login (after seeding):
- Email: admin@retrogaming.com
- Password: admin123

---

## 🐛 Troubleshooting

### Issue: Port 3000 already in use
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Issue: Module not found
```cmd
npm install
```

### Issue: Database connection error
- Check your MONGODB_URI in .env.local
- Make sure MongoDB is accessible
- For testing, you can use MongoDB Atlas (free tier)

### Issue: npm install fails
```cmd
# Clear cache
npm cache clean --force

# Install with legacy peer deps
npm install --legacy-peer-deps
```

### Issue: Can't run npm commands (PowerShell)
Run in **Command Prompt (CMD)** instead of PowerShell, OR:

In PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🎯 Quick Start Checklist

- [ ] Node.js v18+ installed
- [ ] MongoDB connection ready (local or Atlas)
- [ ] Created `.env.local` file
- [ ] Run `npm install --legacy-peer-deps`
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Enjoy! 🎮

---

## 🆘 Need Help?

If you encounter any issues:

1. **Check Node version**: `node --version` (should be 18+)
2. **Check npm version**: `npm --version` (should be 9+)
3. **Clear node_modules**: Delete node_modules folder and package-lock.json, then reinstall
4. **Check .env.local**: Make sure all required variables are set

---

## 🎊 You're All Set!

Once the server is running, your complete Retro Gaming e-commerce platform will be live!

**Happy Coding! 🚀🎮**
