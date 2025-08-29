const routes = 
{
    path: '/system-management',
    name: '系统管理',
    icon: 'table',
    access: 'systemManagement',
    routes: [

            {
                path: '/system-management/equip-management',
                name: '添加设备',
                access: ['equipManagement-preview','equipManagement-edit'],
                component: './system-management/equip-management',
            },

        
            {
                path: '/system-management/command-management',
                name: '添加命令',
                access: ['commandManagement-preview','commandManagement-edit'],
                component: './system-management/command-management',
            },

        
    ],
},