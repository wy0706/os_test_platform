const routes = 
{
    path: '/system-management',
    name: '系统管理',
    icon: 'table',
    access: 'systemManagement',
    routes: [

            {
                path: '/system-management/operation-log',
                name: '操作日志',
                access: ['operationLog-preview','operationLog-edit'],
                component: './system-management/operation-log',
            },

        
            {
                path: '/system-management/login-log',
                name: '登录日志',
                access: ['loginLog-preview','loginLog-edit'],
                component: './system-management/login-log',
            },

        
    ],
},