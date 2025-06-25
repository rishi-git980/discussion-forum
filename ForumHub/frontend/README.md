# Forum App Frontend

A modern forum application built with React and Bootstrap.

## Features

- User authentication (login/register)
- Create and view posts
- Add comments to posts
- Like posts
- User profiles
- Category-based organization
- Responsive design

## Tech Stack

- React 18
- React Router v6
- Bootstrap 5
- Vite
- Axios
- SASS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the frontend directory and add the following:
   ```
   VITE_API_URL=http://localhost:5000
   ```

### Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

### Building for Production

To create a production build:

```bash
npm run build
```

The build output will be in the `dist` directory.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utility functions
│   ├── data/          # Static data
│   ├── styles/        # SCSS styles
│   ├── App.jsx        # Main App component
│   └── main.jsx       # Entry point
├── public/            # Static assets
├── index.html         # HTML template
└── vite.config.js     # Vite configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 