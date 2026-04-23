import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import ProtectedRoute from 'components/ProtectedRoute';

// render- Dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));

// render - management
const CategoryList = Loadable(lazy(() => import('pages/management/CategoryList')));
const BrandList = Loadable(lazy(() => import('pages/management/BrandList')));
const AuditLogList = Loadable(lazy(() => import('pages/management/AuditLogList')));
const ProfilePage = Loadable(lazy(() => import('pages/management/Profile')));
const Inventory = Loadable(lazy(() => import('pages/inventory/InventoryTransaction')));
const IMEITracking = Loadable(lazy(() => import('pages/inventory/IMEITracking')));
const ProductList = Loadable(lazy(() => import('pages/products/ProductList')));

// render - operations
const DamageReports = Loadable(lazy(() => import('pages/operations/DamageReports')));
const Shipments = Loadable(lazy(() => import('pages/operations/ShipmentManager')));
const InventoryChecks = Loadable(lazy(() => import('pages/operations/InventoryCheck')));
const InventoryReports = Loadable(lazy(() => import('pages/operations/Reports')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  // ProtectedRoute kiểm tra login trước, nếu ok mới render DashboardLayout
  element: <ProtectedRoute />,
  children: [
    {
      element: <DashboardLayout />,
      children: [
        {
          path: '/',
          element: <DashboardDefault />
        },
        {
          path: 'dashboard',
          children: [
            {
              path: 'default',
              element: <DashboardDefault />
            }
          ]
        },
        {
          path: 'inventory',
          children: [
            {
              path: 'transaction',
              element: <Inventory />
            },
            {
              path: 'track',
              element: <IMEITracking />
            }
          ]
        },
        {
          path: 'products',
          element: <ProductList />
        },
        {
          path: 'management',
          children: [
            {
              path: 'categories',
              element: <CategoryList />
            },
            {
              path: 'brands',
              element: <BrandList />
            },
            {
              path: 'audit-logs',
              element: <AuditLogList />
            },
            {
              path: 'profile',
              element: <ProfilePage />
            }
          ]
        },
        {
          path: 'operations',
          children: [
            {
              path: 'damage-reports',
              element: <DamageReports />
            },
            {
              path: 'shipments',
              element: <Shipments />
            },
            {
              path: 'inventory-checks',
              element: <InventoryChecks />
            },
            {
              path: 'reports',
              element: <InventoryReports />
            }
          ]
        }
      ]
    }
  ]
};

export default MainRoutes;
