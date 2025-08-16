# Trading Analytics Dashboard

A modern, responsive analytics dashboard built with React for tracking trading performance metrics and insights.


## 🚀 Live Demo

[View Live Demo](http://localhost:3000) (when running locally)


## 📁 Project Structure

```
mini-analytics-dashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services (local data only)
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
└── setup.js               # Project setup script
```


##  Tech Stack

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling and responsive design
- **Recharts** - Data visualization and charts
- **Lucide React** - Icons


##  Features


### Analytics Dashboard
- **Metrics** - Win rate, profit factor, Sharpe ratio
- **Performance charts** - Cumulative P&L visualization
- **Trade analysis** - Recent trades with detailed information
- **Asset allocation** - Portfolio distribution charts
- **Profit distribution** - P&L analysis visualization


###  User Experience
- **Responsive design** - Works on all screen sizes
- **Export functionality** - CSV and PDF export options
- **Keyboard shortcuts** - Quick access to features


###  Mobile Optimized
- **Touch-friendly** - Optimized for mobile devices
- **Responsive charts** - Charts adapt to screen size
- **Mobile navigation** - Intuitive mobile interface


##  Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SumitRaj0/mini-analytics-dashboard.git
   cd mini-analytics-dashboard
   ```

2. **Run the setup script**
   ```bash
   node setup.js
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

4. **Start the React app**
   ```bash
   npm start
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000


##  Available Scripts

- `npm start` - Start the frontend React app
- `npm run build` - Build the frontend for production


## � Key Decisions & Architecture

### Frontend Architecture

**Component Structure**
- Used functional components with React hooks
- Implemented custom hooks for reusable logic (useZoomScale, useDateFilter)
- Separated concerns with dedicated service layer

**Styling Approach**
- Chose Tailwind CSS for rapid development and consistency
- Implemented responsive design with mobile-first approach
- Created custom utility classes for specific use cases
- Used consistent styling approach

**State Management**
- Used React's built-in state management (useState, useEffect)
- Implemented context for global state (theme, notifications)
- Created custom hooks for complex state logic
- Used proper error boundaries for error handling


### Technical Decisions

**Chart Library Choice**
- Selected Recharts for its React integration
- Implemented responsive chart containers
- Created custom tooltips and formatting
- Used proper chart accessibility features

**Responsive Design**
- Implemented mobile-first responsive design
- Created adaptive layouts for different screen sizes
- Used CSS Grid and Flexbox for layouts
- Implemented touch-friendly interactions

**Performance Optimization**
- Used React.memo for component optimization
- Implemented proper loading states
- Created efficient data fetching patterns
- Used proper error boundaries


## 🎨 Design Decisions

### Visual Design
- **Clean, professional aesthetic** - Focused on readability and usability
- **Consistent color scheme** - Used semantic colors for data visualization
- **Typography hierarchy** - Clear information architecture
- **White space utilization** - Proper spacing for better readability

### User Experience
- **Intuitive navigation** - Clear information hierarchy
- **Real-time feedback** - Loading states and notifications
- **Accessibility** - Proper ARIA labels and keyboard navigation
- **Mobile optimization** - Touch-friendly interface

### Data Visualization
- **Meaningful charts** - Each chart serves a specific purpose
- **Color coding** - Green for profits, red for losses
- **Interactive elements** - Hover states and tooltips
- **Responsive charts** - Adapt to different screen sizes


##  Development Process

### Code Organization
- **Modular components** - Each component has a single responsibility
- **Reusable hooks** - Custom hooks for common functionality
- **Service layer** - Data separated from components
- **Utility functions** - Shared helper functions

### Testing Strategy
- **Error boundaries** - Graceful error handling
- **Loading states** - Proper user feedback
- **Data validation** - Input validation and sanitization
- **Cross-browser testing** - Compatibility across browsers

### Performance Considerations
- **Lazy loading** - Components load when needed
- **Optimized re-renders** - Proper dependency arrays
- **Efficient data handling** - Minimal data processing
- **Bundle optimization** - Tree shaking and code splitting


## 📸 Screenshots

### Desktop Dashboard - Main View
![Desktop Dashboard](assets/desktop-dashboard.png)

### Desktop Dashboard - View 2
![Desktop Dashboard View 2](assets/desktop-dashboard-view-2.png)

### Desktop Dashboard - View 3
![Desktop Dashboard View 3](assets/desktop-dashboard-view-3.png)

### Mobile Dashboard
![Mobile Dashboard](assets/mobileView.png)




## Local Development (Mock Mode)

The frontend now includes a lightweight mock API so you can run the dashboard locally without a backend. Static JSON files are served from `client/public/mock-db` and the client is configured to fetch these when running in development.

- Start the app:
  1. cd client; npm install
  2. npm start
  3. Open http://localhost:3000

- Mock files (examples):
  - `client/public/mock-db/analytics.json`
  - `client/public/mock-db/performance-chart.json`
  - `client/public/mock-db/health.json`

- Switch to a real backend:
  - Set the environment variable `REACT_APP_API_URL` to your API base (for example `http://localhost:5000/api`) and restart the dev server.

## Recent Changes

- Converted project to client-only for local development (removed server references).
- Added richer mock data so all dashboard widgets render without an API.
- Populated Recent Trades with full trade objects (exitDate, entryPrice, exitPrice, quantity, pnl, pnlPercentage, type, tags).
- Extended performance data across multiple months and added more daily points for better chart resolution.
- Updated Monthly Performance Trend visuals: profit bars use indigo, losses red, and win-rate line uses a violet accent.

## 🚀 Deployment

### Frontend Deployment
```bash
cd client
npm run build
```


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request


## 📄 License

This project is licensed under the MIT License.


##  Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Recharts for the charting library
- Lucide for the beautiful icons

---

**Built with ❤️ using React**