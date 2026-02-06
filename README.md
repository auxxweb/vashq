# Car Wash POS SaaS Platform

A production-ready, multi-tenant SaaS platform for managing car wash businesses built with the MERN stack.

## 🚀 Features

### Super Admin Panel
- **Dashboard**: Platform-wide metrics and analytics (businesses, active/expired subscriptions)
- **Business Management**: Create, edit, suspend/activate car wash businesses
- **Plans**: Subscription plans (validity, features); shops request upgrades from the Car Wash Admin panel
- **Upgrade Requests**: Approve or reject shop upgrade requests
- **Support & Communication**: Help center, tutorials, live chat, ticket system

### Car Wash Admin Panel
- **Dashboard**: Business-specific metrics and quick actions
- **Job Management**: Complete workflow from received to delivered; status update + WhatsApp status message buttons per job
- **Customer & Car Management**: CRUD operations with WhatsApp integration
- **Service Management**: Define services with pricing and time estimates
- **WhatsApp Settings**: Shop WhatsApp number, editable status message templates (Received / In Progress / Completed / Delivered), Google Review link
- **Settings**: Business profile and preferences

### Manual Subscription Plan Management
- **Subscription Plans** (Super Admin): Create and manage plans with name, description, validity (days), and features list. Activate or deactivate plans.
- **Upgrade Requests** (Super Admin): View all upgrade requests from shops. Approve or reject each request. On approval, the shop’s subscription is updated and expiry is recalculated from the new plan’s validity.
- **My Plan** (Shop Admin): View current plan (name, status, start/expiry, days remaining, features). See all available plans and submit an **upgrade request** with an optional message. Status shows “Pending approval” until Super Admin approves or rejects. No payment processing — all upgrades are manual and approval-based.

### Core Features
- ✅ Multi-tenant architecture with data isolation
- ✅ Role-based access control (RBAC)
- ✅ WhatsApp integration for customer communication
- ✅ Job workflow with capacity management
- ✅ Automatic ETA calculation
- ✅ Dark/Light theme support
- ✅ Mobile-first responsive design
- ✅ Email OTP for password reset

## 🛠️ Tech Stack

- **Frontend**: React.js, TypeScript, Tailwind CSS, Shadcn/UI, React Router, Redux Toolkit
- **Backend**: Node.js, Express.js, REST APIs
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT-based with secure cookies
- **Charts**: Recharts
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/washq_saas
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRE=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Run the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Creating Super Admin

To create the first Super Admin user, you can use MongoDB directly or create a script:

```javascript
// In MongoDB shell or via script
db.users.insertOne({
  email: "admin@washq.com",
  password: "$2a$12$hashedPasswordHere", // Use bcrypt to hash
  role: "SUPER_ADMIN",
  status: "ACTIVE",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use the register endpoint (only for initial setup):
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@washq.com",
    "password": "Admin123!",
    "role": "SUPER_ADMIN"
  }'
```

## 📋 Manual Subscription Workflow

This system has **no online payments**. All upgrades are requested by the shop admin and approved manually by the Super Admin.

### Subscription logic
- **SubscriptionPlan**: Created only by Super Admin. Fields: name, description, validity (days), features (list), status (Active/Inactive).
- **ShopSubscription**: Each shop has one current subscription: plan, start date, expiry date, status (Active / Expired / Pending Upgrade). Expiry is computed from start + plan validity days.
- **PlanUpgradeRequest**: Created by Shop Admin. Contains: shop, current plan, requested plan, message (optional), status (Pending / Approved / Rejected), actioned date. Only one Pending request per shop at a time.

### How to create plans (Super Admin)
1. Go to **Subscription Plans** in the side menu.
2. Click **Add Plan**.
3. Enter plan name, description, validity in days, and features (one per line). Set Active/Inactive.
4. Save. The plan appears in the list and is available for shops to request (if Active).

### How to approve upgrades (Super Admin)
1. Go to **Upgrade Requests** in the side menu.
2. You see all requests with shop name, current plan → requested plan, request date, and status.
3. Click **Approve** or **Reject** (or **View details** first).
4. On **Approve**: The shop’s subscription is updated to the requested plan, start date = today, expiry = start + plan validity days. Request is marked Approved and actioned date is set.
5. On **Reject**: Request is marked Rejected. No change to the shop’s subscription.

### Shop Admin flow
1. Go to **My Plan**.
2. Section 1 shows **Current plan** (name, status, start, expiry, days remaining, features).
3. Section 2 shows **Available plans** (read-only). Each has a **Request upgrade** button (disabled if that plan is current or if a request is already Pending).
4. Click **Request upgrade** → modal: optional message to admin → **Submit request**.
5. After submit, status shows “Pending approval” and duplicate requests are disabled until the request is approved or rejected.

---

## 📱 API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request OTP
- `POST /api/auth/reset-password` - Reset with OTP
- `GET /api/auth/me` - Get current user

### Super Admin
- `GET /api/super-admin/dashboard` - Dashboard stats
- `GET /api/super-admin/businesses` - List all businesses
- `POST /api/super-admin/businesses` - Create business
- `PUT /api/super-admin/businesses/:id` - Update business
- **Subscription plans:** `POST/GET /api/super-admin/subscription-plans`, `PUT /api/super-admin/subscription-plans/:id`, `PATCH /api/super-admin/subscription-plans/:id/status`
- **Upgrade requests:** `GET /api/super-admin/upgrade-requests`, `PATCH /api/super-admin/upgrade-requests/:id/approve`, `PATCH /api/super-admin/upgrade-requests/:id/reject`

### Car Wash Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/jobs` - List jobs
- `POST /api/admin/jobs` - Create job
- `PATCH /api/admin/jobs/:id/status` - Update job status
- `GET /api/admin/customers` - List customers
- `POST /api/admin/customers` - Create customer
- `GET /api/admin/cars` - List cars
- `POST /api/admin/cars` - Create car
- `GET /api/admin/services` - List services
- `POST /api/admin/services` - Create service
- **Subscription (manual):** `GET /api/admin/my-subscription`, `GET /api/admin/available-plans`, `GET /api/admin/upgrade-requests`, `POST /api/admin/upgrade-request`

## 🎨 UI/UX Philosophy

- **Soft cards** with rounded corners
- **Pastel/warm color palette**
- **Glassmorphism** effects
- **Large tap targets** for mobile
- **Floating CTAs**
- **Skeleton loaders** for better UX
- **Smooth animations** and transitions

## 🔔 WhatsApp Status Alerts (Click-to-Chat)

The app includes a **manual WhatsApp status alert** system. There is **no WhatsApp API** and **no automation**: the shop admin clicks a button and WhatsApp opens with a pre-filled message to the customer (wa.me link). The admin sends the message manually from their device.

### How it works
- **Shop WhatsApp number**: Configured in **Admin → WhatsApp Settings**. Used as the “from” context (your shop); the actual chat is opened on the device where the admin clicks (wa.me opens chat to the **customer** with the message pre-filled).
- **Templates**: In **WhatsApp Settings** you can edit message templates for each job status: **Received**, **In Progress**, **Completed**, **Delivered**. Placeholders are replaced when the link is built:
  - `{{name}}` – customer name  
  - `{{vehicleNumber}}` – vehicle number  
  - `{{token}}` – job token  
- **Job Details page**: For each job you get:
  - **Status update button** (primary): e.g. “Mark In Progress”, “Mark Completed”, “Mark Delivered”.
  - **Send [Status] WhatsApp** button (green): opens WhatsApp to the customer with the template for the **current** status filled in. Disabled if the shop WhatsApp number is missing, the template is empty, or the customer has no phone.
- **After delivery**: When status is **Delivered**, an **Ask for Google Review** button appears. It opens WhatsApp with a thank-you message and your **Google Review URL** (set in WhatsApp Settings). Disabled if the review link or customer phone is missing.

### Editing templates
1. Go to **Admin → WhatsApp Settings**.
2. Under **WhatsApp Message Templates**, edit the text for Received, In Progress, Completed, and Delivered.
3. Use only the allowed placeholders: `{{name}}`, `{{vehicleNumber}}`, `{{token}}`.
4. Click **Save Templates**. Use **Reset to Default** to restore the default texts.

### Placeholder usage
- `{{name}}` – Replaced with the customer’s name.  
- `{{vehicleNumber}}` – Replaced with the car’s number/plate.  
- `{{token}}` – Replaced with the job token number.  

All replacement is done in the frontend when building the wa.me link; the backend does not send any WhatsApp message.

### API and settings
- **GET /api/admin/settings** – Returns `shopWhatsappNumber`, `googleReviewLink`, `whatsappTemplates` (received, inProgress, completed, delivered).
- **PUT /api/admin/settings** – Accepts the same fields to update.
- **PATCH /api/admin/jobs/:id/status** – Updates job status (no WhatsApp sending from backend).

### Edge cases
- **Missing WhatsApp number**: WhatsApp buttons are disabled until a shop WhatsApp number is set in WhatsApp Settings.
- **Missing Google Review link**: “Ask for Google Review” is disabled until a Google Review URL is set.
- **Job already delivered**: Only “Send Delivered WhatsApp” and “Ask for Google Review” are shown.
- **Duplicate clicks**: Each click opens a new tab; a short success toast is shown. No server-side rate limit for opening links.

---

## 🔔 WhatsApp API (Optional)

The platform may also include WhatsApp API integration placeholders for automated messages. To enable automated sending:

1. Set up WhatsApp Business API (Twilio, Meta, etc.)
2. Update `backend/utils/whatsapp.utils.js` with your API credentials
3. Configure templates in the admin panel

The **status alert** feature above does **not** use the API; it is purely click-to-chat (wa.me) from the Job Details page.

## 📧 Email Integration

Email service is configured for OTP delivery. To enable:

1. Set up email service (Gmail, SendGrid, etc.)
2. Update `backend/utils/email.utils.js` with your SMTP credentials
3. Configure email settings in `.env`

## 🚀 Deployment

### Build for production

**Backend:**
```bash
cd backend
npm install --production
NODE_ENV=production npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the dist folder with a static server
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure production `MONGODB_URI`
- Set up email and WhatsApp API keys

## 📝 Development Notes

- All API routes are protected by middleware
- Business data is isolated by `businessId`
- Job capacity is enforced based on business settings
- Status transitions are validated to prevent skipping
- WhatsApp messages are logged for audit

## 🤝 Contributing

This is a production-ready SaaS platform. When contributing:
- Follow JavaScript/React best practices
- Maintain data isolation (multi-tenant)
- Add proper error handling
- Write clean, maintainable code
- Test thoroughly before submitting

## 📄 License

[Your License Here]

## 🆘 Support

For issues or questions, please open an issue in the repository.

---

Built with ❤️ for car wash businesses
