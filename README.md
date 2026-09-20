# FactoryFlow

### Manufacturing Management System

FactoryFlow is a full-stack web-based manufacturing management platform designed to help factories manage and monitor their daily operations from a single centralized system.

It connects **production, inventory, machines, maintenance, quality control, procurement, employees, suppliers, and sales** into one platform, giving managers and staff better visibility and control over factory operations.

> **Don't just track production. Build the system that runs the factory floor.**

---

## About FactoryFlow

FactoryFlow replaces fragmented spreadsheets and paper-based records with a centralized digital platform for managing manufacturing operations.

The system enables different departments to work together while maintaining accurate and up-to-date information about production, materials, machines, quality, procurement, and sales.

### FactoryFlow helps organizations:

- Plan and manage production
- Create and track work orders
- Assign machines and operators
- Monitor production progress
- Manage raw materials and finished goods
- Track inventory movements
- Manage Bills of Materials (BOM)
- Monitor machine maintenance
- Perform quality inspections
- Track defects and rework
- Manage suppliers
- Create and manage purchase orders
- Manage customers and sales orders
- Monitor production KPIs
- Control access using user roles

---

## Project Name

**FactoryFlow**

**Project Type:** Full-Stack Web Application

**Category:** Manufacturing Management System

**Architecture:** Client–Server / REST API

**Frontend:** React + Vite

**Backend:** Node.js + Express.js

**Database:** MySQL

**Authentication:** JWT + bcrypt

---

## Vision

FactoryFlow aims to provide a single source of truth for factory operations.

Instead of managing different processes using separate spreadsheets, paper records, or disconnected systems, FactoryFlow connects the major areas of manufacturing into one platform.

```text
                    FACTORYFLOW
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   Production       Inventory        Machines
        │                │                │
        ▼                ▼                ▼
    Work Orders      Materials       Maintenance
        │                │                │
        └────────────────┼────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
      Quality        Procurement        Sales
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
                  Factory Dashboard
```

---

## Core Modules

### Authentication & Access Control

- Secure login
- JWT authentication
- Password hashing
- Protected routes
- Role-based access control
- Password reset

### User Management

- Users
- Employees
- Departments
- Shifts
- Roles

### Production Management

- Production dashboard
- Work orders
- Work-order scheduling
- Machine assignment
- Operator assignment
- Production progress
- Downtime tracking
- Scrap tracking

### Inventory Management

- Raw materials
- Finished goods
- Stock quantities
- Stock movements
- Warehouse locations
- Material receipts
- Stock adjustments
- Low-stock monitoring

### Bill of Materials

FactoryFlow allows products to have a **Bill of Materials (BOM)** defining the raw materials required to manufacture them.

```text
Product
   │
   └── Bill of Materials
          ├── Material A
          ├── Material B
          └── Material C
```

### Machine & Maintenance

- Machine registry
- Machine status
- Machine location
- Maintenance records
- Preventive maintenance
- Corrective maintenance
- Maintenance scheduling

### Quality Control

- Quality inspections
- Pass/fail results
- Defect recording
- Rework tracking
- Defect-rate monitoring

### Procurement

- Supplier management
- Purchase orders
- Purchase order items
- Expected delivery dates
- Material replenishment

### Sales

- Customer management
- Sales orders
- Sales order items
- Order status
- Finished-goods stock deduction

---

## User Roles

FactoryFlow supports role-based access for different factory employees.

| Role                    | Main Responsibilities                                              |
| ----------------------- | ------------------------------------------------------------------ |
| **Admin**               | Manage users, employees, departments, shifts, and system settings  |
| **Production Manager**  | Plan production, create work orders, assign machines and operators |
| **Operator**            | Execute work orders and record production progress                 |
| **Warehouse Staff**     | Manage raw materials, finished goods, and stock movements          |
| **Quality Inspector**   | Perform inspections and record defects                             |
| **Procurement Officer** | Manage suppliers and purchase orders                               |

---

## Technology Stack

### Frontend

- React.js
- Vite
- JavaScript
- React Router
- Context API
- CSS / Tailwind CSS

### Backend

- Node.js
- Express.js
- REST API
- JWT
- bcrypt

### Database

- MySQL
- mysql2

### Development

- Git
- GitHub
- VS Code
- npm
- Nodemon

---

## Application Architecture

```text
┌─────────────────────────────┐
│          Frontend           │
│       React + Vite          │
└──────────────┬──────────────┘
               │
               │ REST API
               ▼
┌─────────────────────────────┐
│          Backend            │
│     Node.js + Express       │
├─────────────────────────────┤
│ Routes                      │
│ Middleware                  │
│ Controllers                 │
│ Services                    │
└──────────────┬──────────────┘
               │
               │ SQL
               ▼
┌─────────────────────────────┐
│           MySQL             │
│          Database           │
└─────────────────────────────┘
```

---

## Project Structure

```text
FactoryFlow/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── icons/
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── dashboard/
│   │   │   ├── production/
│   │   │   ├── inventory/
│   │   │   ├── machines/
│   │   │   ├── quality/
│   │   │   ├── procurement/
│   │   │   └── users/
│   │   │
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── admin/
│   │   │   ├── production/
│   │   │   ├── warehouse/
│   │   │   ├── machines/
│   │   │   ├── quality/
│   │   │   └── procurement/
│   │   │
│   │   ├── services/
│   │   ├── context/
│   │   ├── routes/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── database/
│   │   ├── schema.sql
│   │   ├── seed.sql
│   │   └── migrations/
│   │
│   ├── tests/
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── docs/
│   ├── SRS/
│   ├── SDS/
│   ├── ERD/
│   └── API/
│
├── .gitignore
└── README.md
```

---

## Database

FactoryFlow uses MySQL to store and manage manufacturing data.

The main entities include:

```text
Users
Employees
Departments
Shifts

Products
Bill of Materials
Raw Materials
Inventory

Machines
Maintenance Logs

Work Orders
Quality Inspections

Suppliers
Purchase Orders
Purchase Order Items

Customers
Sales Orders
Sales Order Items
```

The database design connects employees, machines, work orders, products, materials, suppliers, quality inspections, procurement, and sales into a unified manufacturing data model.

---

## Security

FactoryFlow implements several security mechanisms:

- JWT authentication
- bcrypt password hashing
- Role-based authorization
- Protected API routes
- Input validation
- Parameterized SQL queries
- Transaction-safe inventory operations
- Environment variables for sensitive configuration

Passwords are never stored in plain text.

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/FactoryFlow.git
cd FactoryFlow
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=factoryflow
DB_PORT=3306

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d

CLIENT_URL=http://localhost:5173
```

### 4. Create the Database

```sql
CREATE DATABASE factoryflow;
```

Import the schema:

```bash
mysql -u root -p factoryflow < database/schema.sql
```

Import sample data:

```bash
mysql -u root -p factoryflow < database/seed.sql
```

### 5. Start the Backend

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

### 6. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### 7. Start the Frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Production Workflow

```text
Create Product
      │
      ▼
Define BOM
      │
      ▼
Check Inventory
      │
      ▼
Create Work Order
      │
      ▼
Assign Machine & Operator
      │
      ▼
Start Production
      │
      ▼
Record Production Progress
      │
      ▼
Complete Work Order
      │
      ▼
Quality Inspection
      │
      ├───────────────┐
      ▼               ▼
     PASS        FAIL / REWORK
      │
      ▼
Finished Goods
      │
      ▼
Inventory
      │
      ▼
Sales Order
```

---

## Development Status

### Completed / Implemented

- [ ] Authentication
- [ ] User management
- [ ] Employee management
- [ ] Department management
- [ ] Production management
- [ ] Work orders
- [ ] Inventory management
- [ ] Bill of Materials
- [ ] Machine management
- [ ] Maintenance
- [ ] Quality control
- [ ] Supplier management
- [ ] Procurement
- [ ] Customer management
- [ ] Sales orders
- [ ] Dashboard
- [ ] API documentation
- [ ] Automated testing

> Update the checklist according to the features that are actually implemented in your repository.

---

## Future Improvements

Possible future enhancements include:

- Real-time production monitoring
- Barcode and QR-code scanning
- Predictive machine maintenance
- Advanced production analytics
- OEE calculation
- Production scheduling
- Gantt charts
- Automated reorder suggestions
- Email/SMS notifications
- Supplier performance analytics
- Product traceability
- Mobile-friendly operator terminals
- Machine IoT integration

The original project specification also identifies predictive maintenance, barcode/RFID scanning, low-stock automation, production scheduling, supplier scorecards, traceability, and real-time alerts as potential extensions.

---

## Documentation

Detailed project documentation is available in:

```text
docs/
├── SRS/
├── SDS/
├── ERD/
└── API/
```

The SRS defines the functional and non-functional requirements, while the SDS describes the architecture, technology stack, database design, module design, and security considerations.

---

## Project Purpose

FactoryFlow was created to demonstrate how modern full-stack technologies can be used to solve real manufacturing and operational problems.

The platform brings together:

```text
Production
    +
Inventory
    +
Machines
    +
Quality
    +
Procurement
    +
Sales
    +
Workforce
    =
FactoryFlow
```

---

## License

This project is developed as a Full-Stack Web Development project.

Add your preferred license here.

---

## Author

**FactoryFlow Development Team**

Full-Stack Web Development Project

---

# FactoryFlow

**Manufacturing Management System**

> **Don't just track production. Build the system that runs the factory floor.**
