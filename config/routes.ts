export default [
    {
        path: '/user',
        layout: false,
        routes: [
            {
                path: '/user/login',
                layout: false,
                name: 'login',
                component: './user/Login',
            },
            {
                path: '/user',
                redirect: '/user/login',
            },
        ],
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: './TrangChu',
        icon: 'HomeOutlined',
    },
    {
        path: '/random-user',
        name: 'RandomUser',
        component: './RandomUser',
        icon: 'ArrowsAltOutlined',
    },
    {
        path: '/todo-list',
        name: 'TodoList',
        icon: 'OrderedListOutlined',
        component: './TodoList',
    },

    {
        path: '/bai-1',
        name: 'Bài 1: Đoán số',
        icon: 'QuestionCircleOutlined',
        component: './Bai1',
    },
    {
        path: '/bai-2',
        name: 'Bài 2: Quản lý học tập',
        icon: 'BookOutlined',
        component: './Bai2',
    },

    {
        path: '/products',
        name: 'Quản lý sản phẩm',
        icon: 'table', 
        component: './ProductList',
    },
    
    {
    path: '/quan-ly',
    name: 'Quản lý Hệ thống',
    icon: 'shop',
    routes: [
      { path: '/quan-ly/dashboard', name: 'Thống kê', component: './Dashboard' },
      { path: '/quan-ly/san-pham', name: 'Sản phẩm', component: './ProductManagement' },
      { path: '/quan-ly/don-hang', name: 'Đơn hàng', component: './OrderManagement' },
    ],
  },

    {
        path: '/notification',
        layout: false,
        hideInMenu: true,
        routes: [
            { path: './subscribe', exact: true, component: './ThongBao/Subscribe' },
            { path: './check', exact: true, component: './ThongBao/Check' },
            { path: './', exact: true, component: './ThongBao/NotifOneSignal' },
        ],
    },
    {
        path: '/',
        redirect: '/dashboard',
    },
    {
        path: '/403',
        component: './exception/403/403Page',
        layout: false,
    },
    {
        path: '/hold-on',
        component: './exception/DangCapNhat',
        layout: false,
    },
    {
        component: './exception/404',
    },
];