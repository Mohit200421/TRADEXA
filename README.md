
# 📈 TRADEXA – Trading Journal & Analytics Platform
🚀 Live Demo: https://tradexa-lilac.vercel.app

TRADEXA is a **full-stack trading journal web application** designed for traders to **log, analyze, and improve their trading performance**.
It helps traders track trades, maintain detailed journals, upload screenshots, analyze P&L, and build discipline through structured reviews.

---

## 🚀 Features

### 🔐 Authentication

* User registration & login (JWT based)
* Secure protected routes
* Persistent sessions

### 📊 Trade Management

* Add, edit, delete trades
* Long / Short trade support
* Entry & exit price, lot size, dates
* Automatic **P&L & pip calculation**
* Open & closed trade handling

### 📝 Trading Journal

* Pre-trade & post-trade analysis
* Emotional & psychological notes
* Lessons learned
* Trade rating system (1–10)
* Custom checklist with toggle support

### 🖼️ Screenshots & Charts

* Upload trade screenshots
* Cloudinary integration for storage
* Multiple image support
* Remove or add images while editing trades

### 📈 Dashboard & Analytics

* Total trades overview
* Winning vs losing trades
* Performance tracking
* Trade filtering & sorting

### 👥 Community (Optional / Advanced)

* Community chat using **Socket.IO**
* Real-time messages
* Emoji reactions

### 🌙 UI & UX

* Mobile-friendly responsive UI
* Dark & light mode support
* Clean modern design (Tailwind CSS)
* Grid & table view for trades

---

## 🛠️ Tech Stack

### Frontend

* **React (TypeScript)**
* React Router
* Axios
* Tailwind CSS
* React DatePicker
* Lucide Icons
* React Hot Toast

### Backend

* **Node.js**
* Express.js
* MongoDB + Mongoose
* JWT Authentication
* Multer (file uploads)
* Cloudinary (image storage)
* Socket.IO (real-time features)

### Deployment

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** MongoDB Atlas

---

## 📂 Project Structure

```bash
TRADEXA/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   └── contexts/
│   └── vite.config.ts
│
└── README.md
```

---

## ⚙️ Environment Variables

### Backend `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

EMAIL_USER=your_email
EMAIL_PASS=your_email_password
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## ▶️ Getting Started

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Mohit200421/TRADEXA.git
cd TRADEXA
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔗 API Endpoints (Core)

### Trades

* `POST /api/trades` – Add trade
* `GET /api/trades` – Get all trades
* `GET /api/trades/:id` – Get single trade
* `PUT /api/trades/:id` – Update trade
* `PUT /api/trades/:id/journal` – Update journal
* `DELETE /api/trades/:id` – Delete trade

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`

---

## 🧠 Future Enhancements

* AI trade analysis & suggestions
* Day / Session tracker
* Risk-reward analytics
* Strategy performance reports
* CSV / PDF export
* Trade replay visualization

---

## 👨‍💻 Author

**Mohit Badgujar**
Final Year Computer Engineering Student
Full-Stack Developer | MERN Stack
📍 India

---

## ⭐ Support

If you like this project:

* ⭐ Star the repository
* 🐛 Report issues
* 💡 Suggest features

---

If you want, next I can:

* Improve README for **resume ranking**
* Add **screenshots section**
* Write **API documentation**
* Make **architecture diagram**
* Prepare **project explanation for interviews**

Just tell me 👌
