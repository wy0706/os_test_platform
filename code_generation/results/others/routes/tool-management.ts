const routes = 
{
    path: '/tool-management',
    name: '检测工具',
    icon: 'table',
    access: 'toolManagement',
    routes: [

            {
                path: '/tool-management/ide-tool',
                name: '集成开发环境',
                access: ['ideTool-preview','ideTool-edit'],
                component: './tool-management/ide-tool',
            },

        
            {
                path: '/tool-management/deploy-tool',
                name: '部署工具',
                access: ['deployTool-preview','deployTool-edit'],
                component: './tool-management/deploy-tool',
            },

        
    ],
},