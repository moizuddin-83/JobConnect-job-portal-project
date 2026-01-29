# JobConnect - SE Project

JobConnect is a modern job portal application designed to bridge the gap between job seekers and employers. Built with performance and user experience in mind, it provides a seamless platform for posting jobs, applying for positions, and managing the recruitment process.

## 🚀 Features

- **User Authentication**: Secure Login and Sign-up for job seekers and employers.
- **Job Management**:
  - **Post Jobs**: Employers can easily create detailed job listings.
  - **Browse Jobs**: Job seekers can view available positions on the Home page.
  - **Apply**: Streamlined application process (`ApplyJobPage`).
- **Applicant Tracking**: Employers can view and manage applicants (`ViewApplicantsPage`).
- **Real-time Communication**: Integrated Chat feature for direct communication between recruiters and candidates.
- **User Profiles**: personalized profile management.
- **Dashboard**: specialized dashboard views for managing activities.
- **PWA Support**: Installable as a Progressive Web App (`InstallPage`).

## 🛠️ Technology Stack

This project is built using a robust modern web stack:

- **Frontend Framework**: [React](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/) - for lightning-fast development and build.
- **Language**: [TypeScript](https://www.typescriptlang.org/) - for type-safe code.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - utility-first CSS framework.
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) - for accessible and customizable components.

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/moizuddin-83/JobConnect-job-portal-project
   cd job-Connect-SE-Project-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open the App**
   Open your browser and navigate to `http://localhost:8080` (or the port shown in your terminal).

## 📂 Project Structure

- `src/pages`: Contains main application views (Home, Login, PostJob, etc.).
- `src/components`: Reusable UI components.
- `src/contexts`: React Context providers for state management.
- `src/hooks`: Custom React hooks.
- `src/lib`: Utility functions and configurations.

## 🤝 Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

