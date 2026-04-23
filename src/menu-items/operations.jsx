// assets
import {
  WarningOutlined,
  CarOutlined,
  ReconciliationOutlined,
  LineChartOutlined
} from '@ant-design/icons';

// icons
const icons = {
  WarningOutlined,
  CarOutlined,
  ReconciliationOutlined,
  LineChartOutlined
};

// ==============================|| MENU ITEMS - OPERATIONS ||============================== //

const operations = {
  id: 'operations',
  title: 'Vận hành Kho & Báo cáo',
  type: 'group',
  children: [
    {
      id: 'damage-reports',
      title: 'Xử lý hàng lỗi',
      type: 'item',
      url: '/operations/damage-reports',
      icon: icons.WarningOutlined,
      roles: ['Admin', 'Staff']
    },
    {
      id: 'shipments',
      title: 'Bàn giao vận chuyển',
      type: 'item',
      url: '/operations/shipments',
      icon: icons.CarOutlined,
      roles: ['Admin', 'Staff']
    },
    {
      id: 'inventory-checks',
      title: 'Kiểm kê định kỳ',
      type: 'item',
      url: '/operations/inventory-checks',
      icon: icons.ReconciliationOutlined,
      roles: ['Admin', 'Staff']
    },
    {
      id: 'inventory-reports',
      title: 'Báo cáo tồn kho',
      type: 'item',
      url: '/operations/reports',
      icon: icons.LineChartOutlined,
      roles: ['Admin']
    }
  ]
};

export default operations;
