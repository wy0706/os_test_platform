const routes = 
{
    path: '/log-management',
    name: '日志管理',
    icon: 'table',
    access: 'logManagement',
    routes: [

            {
                path: '/log-management/operation-log',
                name: '操作日志',
                access: ['operationLog-preview','operationLog-edit'],
                component: './log-management/operation-log',
            },

        
            {
                path: '/log-management/login-log',
                name: '登录日志',
                access: ['loginLog-preview','loginLog-edit'],
                component: './log-management/login-log',
            },

        
            {
                path: '/log-management/test-log',
                name: '测试日志',
                access: ['testLog-preview','testLog-edit'],
                component: './log-management/test-log',
            },

        
    ],
},