# Mini CRM Application

A modern CRM application built with React, Vite, and Tailwind CSS.

## Features

- Customer management
- Order tracking
- Campaign creation and management
- Audience targeting
- Google authentication

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd crm
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
  ├── components/
  │   ├── Auth/
  │   │   └── Login.jsx
  │   ├── CampaignListing/
  │   │   └── CampaignList.jsx
  │   └── DataIngestion/
  │       ├── AudienceForm.jsx
  │       ├── CustomerForm.jsx
  │       └── OrderForm.jsx
  ├── services/
  │   └── api.js
  ├── App.jsx
  └── main.jsx
```

## Technologies Used

- React 18
- Vite
- Tailwind CSS
- React Router
- Formik & Yup
- Axios
- Headless UI

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The application expects a backend API running at `http://localhost:5000` with the following endpoints:

- `/api/auth/*` - Authentication endpoints
- `/api/customers` - Customer management
- `/api/orders` - Order management
- `/api/campaigns` - Campaign management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
