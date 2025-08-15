# Gym Management System - Layered Architecture

This project has been restructured using layered architecture for modern React applications.

## 🏗️ Architecture Structure

### 1. **Constants Layer** (`src/constants/`)
Constants and configuration values used throughout the application.

- **`api.js`**: API endpoints, HTTP methods, status codes
- **`app.js`**: Application constants, page names, modal types

### 2. **Utils Layer** (`src/utils/`)
Helper functions and utility classes.

- **`api.js`**: HTTP client, API helpers, error handling
- **`helpers.js`**: Date formatting, validation, string operations

### 3. **Services Layer** (`src/services/`)
API communication and business logic.

- **`baseService.js`**: Base class for all services
- **`customerService.js`**: Customer operations
- **`paymentService.js`**: Payment operations
- **`statsService.js`**: Statistics operations

### 4. **Hooks Layer** (`src/hooks/`)
Custom React hooks.

- **`useApi.js`**: Hooks for API calls (useApi, useMutation, useInfiniteQuery)

### 5. **Components Layer** (`src/components/`)
UI components, organized in layers.

#### 5.1 **UI Components** (`src/components/ui/`)
Reusable basic components:
- **`Button.js`**: Multiple variant and size support
- **`Modal.js`**: Modal component and sub-components
- **`Input.js`**: Form input components

#### 5.2 **Layout Components** (`src/components/layout/`)
Page layout components:
- **`Layout.js`**: Main layout wrapper
- **`Sidebar.js`**: Navigation sidebar
- **`Header.js`**: Top header

#### 5.3 **Page Components** (`src/components/pages/`)
Page components:
- **`Dashboard.js`**: Main dashboard
- **`Customers.js`**: Customer management
- **`Payments.js`**: Payment management
- **`Programs.js`**: Program management
- **`Entries.js`**: Entry management
- **`Settings.js`**: Settings

#### 5.4 **Auth Components** (`src/components/auth/`)
Authentication components:
- **`LoginModal.js`**: Login modal

## 🔄 Data Flow

```
UI Components → Hooks → Services → API → Database
     ↑           ↑        ↑        ↑
     └───────────┴────────┴────────┘
        State Management & Data Flow
```

## 🚀 Features

### **API Layer**
- HTTP client wrapper
- Timeout handling
- Retry logic
- Error handling
- Request/response interceptors

### **State Management**
- API state management with custom hooks
- Loading, error, success states
- Optimistic updates
- Infinite scroll support

### **UI Components**
- Responsive design
- Accessibility support
- Dark/light theme ready
- Consistent design system

### **Error Handling**
- Global error boundary
- User-friendly error messages
- Retry mechanisms
- Fallback UIs

## 📁 Directory Structure

```
src/
├── constants/          # Constants and configuration
├── utils/             # Helper functions
├── services/          # API services
├── hooks/             # Custom React hooks
├── components/        # UI components
│   ├── ui/           # Basic UI components
│   ├── layout/       # Layout components
│   ├── pages/        # Page components
│   ├── forms/        # Form components
│   └── auth/         # Authentication
└── index.js          # Main application
```

## 🛠️ Usage Examples

### **Service Usage**
```javascript
import { customerService } from '../services/customerService';

// Get customer list
const customers = await customerService.getAll();

// Add new customer
const newCustomer = await customerService.create(customerData);
```

### **Hook Usage**
```javascript
import { useApi } from '../hooks/useApi';

const { data, loading, error, refetch } = useApi(
  customerService.getAll.bind(customerService)
);
```

### **Component Usage**
```javascript
import Button from '../ui/Button';
import Modal from '../ui/Modal';

<Button variant="primary" size="lg" loading={loading}>
  Save
</Button>
```

## 🔧 Development

### **Adding New Service**
1. Create new service file under `src/services/`
2. Extend from `BaseService`
3. Implement required methods

### **Adding New Hook**
1. Create new hook file under `src/hooks/`
2. Follow React hooks rules
3. Add TypeScript support (optional)

### **Adding New Component**
1. Create component under appropriate directory
2. Define props interface
3. Add Storybook story (optional)

## 📊 Performance Optimizations

- **Code Splitting**: Page-based lazy loading
- **Memoization**: React.memo and useMemo usage
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Image Optimization**: Lazy loading and responsive images

## 🔒 Security

- **Input Validation**: All user inputs are validated
- **XSS Protection**: HTML injection protection
- **CSRF Protection**: Cross-site request forgery protection
- **Authentication**: JWT token-based authentication

## 🧪 Testing Strategy

- **Unit Tests**: Jest tests for components and utilities
- **Integration Tests**: API service tests
- **E2E Tests**: End-to-end tests with Cypress
- **Visual Regression**: UI tests with Storybook

## 📈 Monitoring & Analytics

- **Error Tracking**: Sentry integration
- **Performance Monitoring**: Web Vitals tracking
- **User Analytics**: User behavior analysis
- **API Monitoring**: Endpoint performance tracking

## 🚀 Deployment

- **Build Optimization**: Production build optimization
- **Environment Configuration**: Environment-based configuration
- **CI/CD Pipeline**: Automated build and deploy
- **Health Checks**: Application health monitoring

---

This architecture significantly improves the project's scalability, maintainability, and developer experience. 