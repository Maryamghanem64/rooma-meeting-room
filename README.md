# Smart Meeting Room & Minutes Management System

A modern, responsive React-based web application for managing meeting rooms, scheduling meetings, and handling meeting minutes with a professional design and smooth animations.

## 🚀 Features

### 🔐 Authentication
- **Login System**: Secure user authentication with email/password
- **Demo Account**: Quick access with demo credentials
- **Protected Routes**: Automatic redirection for unauthenticated users
- **User Profiles**: Personal user information and settings

### 📊 Dashboard
- **Welcome Section**: Personalized greeting with user information
- **Statistics Cards**: Meeting counts, completion rates, and room utilization
- **Upcoming Meetings**: List of scheduled meetings with quick actions
- **Quick Actions**: One-click access to common tasks
- **Room Availability**: Real-time room status overview
- **Notifications**: Important alerts and updates

### 📅 Meeting Room Booking
- **Comprehensive Form**: Title, date/time, duration, attendees, room selection
- **Room Availability Preview**: Color-coded room status with equipment details
- **Attendee Management**: Search and add participants
- **Advanced Options**: Recurring meetings, video conferencing integration
- **Form Validation**: Real-time validation with error messages

### 🎥 Active Meeting Screen
- **Meeting Controls**: Start/stop meeting, recording, transcription
- **Live Timer**: Real-time meeting duration tracking
- **Participant Management**: View attendees and their status
- **Video Integration**: Zoom/Teams link integration
- **Live Transcription**: Real-time speech-to-text
- **Notes Panel**: In-meeting note-taking functionality

### 📝 Minutes Management
- **Template System**: Structured minutes with predefined fields
- **Action Items**: Track decisions and assign responsibilities
- **File Attachments**: Upload and manage meeting documents
- **Status Tracking**: Draft and finalized minutes
- **Search & Filter**: Find minutes by keyword, date, or status
- **Export Options**: PDF and document export capabilities

### 🏢 Admin Panel
- **Room Management**: Add, edit, and delete meeting rooms
- **Analytics Dashboard**: Usage statistics and popular rooms
- **System Status**: Monitor database and service health
- **User Management**: Admin controls for user accounts
- **Equipment Tracking**: Manage room equipment and maintenance

### 🎨 Design & UX
- **Modern UI**: Clean, professional design with consistent styling
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: CSS animations and transitions for better UX
- **Loading States**: Professional loading spinners and skeleton screens
- **Error Handling**: User-friendly error messages and recovery options

## 🛠️ Technology Stack

- **Frontend Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.0
- **Routing**: React Router DOM 7.8.0
- **Styling**: Custom CSS with CSS Variables
- **Icons**: Font Awesome 6.0.0
- **HTTP Client**: Axios 1.11.0
- **Form Handling**: React Hook Form 7.62.0
- **Date Handling**: date-fns 4.1.0
- **UI Components**: Custom component library

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   └── Header.jsx          # Navigation header
│   ├── LoginPage.jsx           # Authentication page
│   ├── Dashboard.jsx           # Main dashboard
│   ├── BookMeeting.jsx         # Meeting booking form
│   ├── ActiveMeeting.jsx       # Live meeting interface
│   ├── Minutes.jsx             # Minutes management
│   ├── AdminPanel.jsx          # Admin controls
│   ├── Rooms.jsx               # Room overview
│   └── Bookings.jsx            # User bookings
├── context/
│   └── AuthContext.jsx         # Authentication state management
├── styles/
├── assets/
├── App.jsx                     # Main application component
├── main.jsx                    # Application entry point
├── index.css                   # Global styles
└── App.css                     # App-specific styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-meeting-room
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Demo Login
Use these credentials for quick testing:
- **Email**: `demo@example.com`
- **Password**: `demo12345`

## 🎯 Key Features Explained

### Authentication System
The app uses a context-based authentication system with localStorage for persistence. Users can log in with email/password or use the demo account for testing.

### Responsive Design
Built with mobile-first approach using CSS Grid and Flexbox. The design adapts seamlessly across all device sizes.

### Component Architecture
- **Reusable Components**: Cards, buttons, forms, and modals
- **State Management**: React hooks and context for global state
- **Route Protection**: Automatic redirection for unauthenticated users

### Animation System
- **CSS Animations**: Fade-in, slide-in, and hover effects
- **Loading States**: Spinners and skeleton screens
- **Smooth Transitions**: Button hover effects and form interactions

## 🔧 Customization

### Styling
The app uses CSS variables for easy theming. Modify colors, spacing, and other design tokens in `src/index.css`.

### Components
All components are modular and can be easily customized or extended. Each component includes comprehensive comments for easy understanding.

### Mock Data
Currently uses mock data for demonstration. Replace API calls in components with actual backend endpoints.

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Font Awesome for icons
- Unsplash for placeholder images
- React community for excellent documentation

## 📞 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using React and modern web technologies**
