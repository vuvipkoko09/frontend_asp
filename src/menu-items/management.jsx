// assets
import {
  BarcodeOutlined,
  AppstoreAddOutlined,
  TagsOutlined,
  FireOutlined,
  FieldTimeOutlined
} from '@ant-design/icons';

// icons
const icons = {
  BarcodeOutlined,
  AppstoreAddOutlined,
  TagsOutlined,
  FireOutlined,
  FieldTimeOutlined
};

// ==============================|| MENU ITEMS - MANAGEMENT ||============================== //

const management = {
  id: 'management',
  title: 'Quản lý hệ thống',
  type: 'group',
  children: [
    {
      id: 'product-list',
      title: 'Danh mục Sản phẩm',
      type: 'item',
      url: '/products',
      icon: icons.AppstoreAddOutlined,
      roles: ['Admin', 'Staff']
    },
    {
      id: 'inventory',
      title: 'Nhập / Xuất Kho',
      type: 'item',
      url: '/inventory/transaction',
      icon: icons.BarcodeOutlined,
      roles: ['Admin', 'Staff']
    },
    {
      id: 'imei-tracking',
      title: 'Tra cứu IMEI',
      type: 'item',
      url: '/inventory/track',
      icon: icons.FieldTimeOutlined,
      roles: ['Admin', 'Staff']
    },
    {
      id: 'categories',
      title: 'Quản lý Danh mục',
      type: 'item',
      url: '/management/categories',
      icon: icons.TagsOutlined,
      roles: ['Admin', 'Staff']
    },
    {
      id: 'brands',
      title: 'Quản lý Thương hiệu',
      type: 'item',
      url: '/management/brands',
      icon: icons.FireOutlined,
      roles: ['Admin', 'Staff']
    },
    {
      id: 'audit-logs',
      title: 'Nhật ký hệ thống',
      type: 'item',
      url: '/management/audit-logs',
      icon: icons.FieldTimeOutlined,
      roles: ['Admin']
    }
  ]
};

export default management;
