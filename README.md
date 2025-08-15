# Gym Management Application

This application is a web application developed to manage gym customers, payments, and memberships.

## 🚀 Installation and Running

### Requirements
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the project:
```bash
git clone <repository-url>
cd gym
```

2. Install dependencies:
```bash
npm install
```

### Running
To run the application in development mode:

```bash
npm run dev
```

This command will start both backend (port 3001) and frontend (port 3000) servers.

Alternatively, to run only the backend:
```bash
npm run server
```

To run only the frontend:
```bash
npm start
```

## 🎯 Features

### ✅ Completed Features
- **Customer Management**: Add, edit, delete new customers
- **Database Integration**: Full integration with SQLite database
- **Modern UI**: Responsive design with Tailwind CSS
- **Form Validation**: Comprehensive form validation and error handling

### 🔄 Features Under Development
- Payment management
- Membership management
- Check-in/check-out tracking
- Reporting and statistics

## 🧪 Testing

### Customer Addition Function Test

1. Start the application: `npm run dev`
2. Go to `http://localhost:3000` in your browser
3. Click on "Customers" from the left menu
4. Click on "New Customer" button
5. A modal will open and the form will appear
6. Fill in the required fields:
   - **Ad** (required)
   - **Soyad** (required)
   - **Telefon** (required)
   - **Email** (optional)
   - **TC Kimlik No** (optional, 11 digits)
   - **Doğum Tarihi** (optional)
   - **Cinsiyet** (optional)
   - **Adres** (optional)
   - **Acil Durum Kişisi** (optional)
   - **Acil Durum Telefonu** (optional)
   - **Notlar** (optional)
7. Click on "Add Customer" button
8. If successful, the modal will close and the new customer will appear in the customer list

### API Testing

To test the backend API:

```bash
# Get customer list
curl http://localhost:3001/api/customers

# Add new customer
curl -X POST http://localhost:3001/api/customers \
  -H "Content-Type: application/json" \
  -d '{"ad":"Test","soyad":"Customer","telefon":"05551234567"}'

# Server health check
curl http://localhost:3001/health
```

## 🏗️ Project Structure

```
gym/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   ├── ui/            # UI components (Button, Input, Modal)
│   │   ├── pages/         # Page components
│   │   └── layout/        # Layout components
│   ├── services/          # API services
│   ├── hooks/             # Custom React hooks
│   └── constants/         # Constants
├── server/                 # Backend source code
│   ├── models/            # Database models
│   ├── controllers/       # Business logic controllers
│   ├── routes/            # API routes
│   ├── utils/             # Helper functions
│   └── index.js           # Main server file
├── database.sqlite         # SQLite database
└── package.json           # Project dependencies
```

## 🔧 Technical Details

### Frontend
- **React 18** - Modern React hooks and functional components
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **Custom Hooks** - Custom hooks for API integration

### Backend
- **Express.js** - Node.js web framework
- **SQLite3** - Lightweight, file-based database
- **RESTful API** - Standard HTTP methods
- **Middleware** - CORS, body parsing, error handling

### Database
- **SQLite** - Single file database
- **Normalized Schema** - Relational data structure
- **Foreign Keys** - Referential integrity
- **Indexes** - Performance optimization

## 🐛 Known Issues

- PowerShell may have issues with curl commands containing Turkish characters
- Node.js v14 doesn't have fetch API (built-in http module is used)

## 📝 Development Notes

### Customer Addition Function
- Form validation is done client-side
- Additional validation exists on the backend
- List automatically refreshes after successful addition
- Modal form state is cleared

### Database
- SQLite database is created automatically
- Tables and sample data are added automatically
- Soft delete is used (aktif = 0)

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Contact

You can open an issue for questions or send a pull request. 