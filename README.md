# Job Sheet Management System

A modern, digital job sheet management system built with Next.js, TypeScript, Tailwind CSS, and Supabase. This application helps businesses manage job sheets, track work progress, generate invoices, and maintain customer records.

## Features

- 🔐 **Authentication & Authorization** - Secure user authentication with role-based access
- 📋 **Job Sheet Management** - Create, edit, and track job sheets
- 👨‍💼 **Admin Dashboard** - Comprehensive admin panel with analytics
- 📊 **Dashboard & Analytics** - Real-time statistics and reporting
- 💰 **Invoice Generation** - Automated invoice creation and PDF download
- 📱 **Responsive Design** - Mobile-first responsive interface
- 🌙 **Dark/Light Mode** - Theme switching capability
- 🔍 **Search & Filter** - Advanced search and filtering options

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **State Management**: React Hook Form
- **UI Components**: Radix UI, Lucide React Icons
- **Charts**: Recharts
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/AmrendraTheCoder/jobsheet-management-system.git
cd jobsheet-management-system
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   └── dashboard/         # User dashboard
├── components/            # Reusable components
│   ├── admin/             # Admin-specific components
│   ├── job-sheets/        # Job sheet components
│   └── ui/                # UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## Database Schema

The application uses Supabase with the following main tables:

- `job_sheets` - Job sheet records
- `quotations` - Quotation management
- `users` - User authentication and profiles

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please open an issue on GitHub.

## Author

**Amrendra Singh**

- GitHub: [@AmrendraTheCoder](https://github.com/AmrendraTheCoder)
