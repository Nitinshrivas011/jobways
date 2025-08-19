# JobWays

JobWays is a professional platform designed to help users connect with job opportunities, manage applications, and grow their careers.

---

## 🚀 Project Setup Guide (For Developers)

Follow these steps to set up the **JobWays** project locally.

### 📦 Prerequisites

- **Node.js** (v18 or later recommended)
- **npm** (comes with Node.js)
- **MongoDB** instance (local or cloud)
- *(Optional)* Cloudinary account for document storage

---

### 🔧 Installation Steps

#### 1. Clone the repository
```bash
git clone https://github.com/your-username/jobways.git
cd jobways
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Configure environment variables
Create a `.env` file in the root directory and add the following variables:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_SERVICE_PROVIDER=smtp_provider
EMAIL_USERNAME=your_email@example.com
EMAIL_PASSWORD=your_email_password
```

#### 4. Seed database (optional)
To add initial users or data:
```bash
npm run seed
```

#### 5. Run the project
```bash
npm start
```
Your backend server should now be running on: [http://localhost:3000](http://localhost:3000)

#### 6. Frontend setup
- Navigate to the `client` folder (if applicable)
- Install frontend dependencies
- Run the frontend server (see frontend README for details)

---

## 🌱 Database Seeding

To populate the database with initial user data (e.g., admin and default users), you can run the seeder script included in this project.

### How to Run Seeder

1. Make sure your MongoDB server is running and your `.env` file has the correct `MONGO_URI` configured.
2. Run the seeder script using the following command:
```bash
npm run seed
```

---

## 🤝 Support

For assistance, feedback, or inquiries, please contact us at: [support@jobways.com](mailto:support@jobways.com)

---

✨ Join **JobWays** today and take the next step toward your professional aspirations!
