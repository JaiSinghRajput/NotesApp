import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { UploadNote } from './pages/UploadNote';
import { NoteViewer } from './pages/NoteViewer';
import { Browse } from './pages/Browse';
import { MyUploads } from './pages/MyUploads';
import { UserManagement } from './pages/UserManagement';
import { Categories } from './pages/Categories';
import { Search } from './pages/Search';
import { Profile } from './pages/Profile';
import { CategoryManagement } from './pages/CategoryManagement';
import { Stats } from './pages/Stats';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';

// Protected Route Component
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role || '')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { theme } = useUIStore();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><RootLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="browse" element={<Browse />} />
          <Route path="categories" element={<Categories />} />
          <Route path="search" element={<Search />} />
          <Route path="profile" element={<Profile />} />
          <Route path="note/:id" element={<NoteViewer />} />

          {/* Admin Routes */}
          <Route
            path="admin/upload"
            element={
              <ProtectedRoute roles={['admin']}>
                <UploadNote />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/my-uploads"
            element={
              <ProtectedRoute roles={['admin']}>
                <MyUploads />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/categories"
            element={
              <ProtectedRoute roles={['admin', 'super-admin']}>
                <CategoryManagement />
              </ProtectedRoute>
            }
          />

          {/* Super Admin Routes */}
          <Route
            path="super-admin/users"
            element={
              <ProtectedRoute roles={['super-admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="super-admin/stats"
            element={
              <ProtectedRoute roles={['super-admin']}>
                <Stats />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
