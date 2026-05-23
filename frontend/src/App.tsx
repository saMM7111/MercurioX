
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { Customers } from './pages/Customers';
import { Employees } from './pages/Employees';
import { AuditLogs } from './pages/AuditLogs';

const queryClient = new QueryClient();

const Forbidden = () => <div style={{ padding: '2rem' }}><h1>403 Forbidden</h1></div>;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/customers" element={<Customers />} />
                
                <Route element={<ProtectedRoute roles={['ADMIN', 'MANAGER']} />}>
                  <Route path="/employees" element={<Employees />} />
                </Route>
                
                <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                  <Route path="/audit-logs" element={<AuditLogs />} />
                </Route>
              </Route>
            </Route>
            
            <Route path="/403" element={<Forbidden />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
