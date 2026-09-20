import { useAuth } from '../../context/AuthContext';
import Sidebar from '../dashboard/Sidebar';
import Topbar from '../dashboard/Topbar';
import { useState } from 'react';
import './PageLayout.css';

function PageLayout({ children }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="page-layout">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="page-layout-main">
        <Topbar user={user} setSidebarOpen={setSidebarOpen} />
        <main className="page-layout-content">{children}</main>
      </div>
    </div>
  );
}

export default PageLayout;
