const routes = 
{
    path: '/backend-management',
    name: '后台管理',
    icon: 'table',
    access: 'backendManagement',
    routes: [

            {
                path: '/backend-management/user-management',
                name: '用户管理',
                access: ['userManagement-preview','userManagement-edit'],
                component: './backend-management/user-management',
            },

        
            {
                path: '/backend-management/permission-management',
                name: '权限管理',
                access: ['permissionManagement-preview','permissionManagement-edit'],
                component: './backend-management/permission-management',
            },

        
    ],
},