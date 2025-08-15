const routes = 
{
    path: '/task-management',
    name: '任务管理',
    icon: 'table',
    access: 'taskManagement',
    routes: [

            {
                path: '/task-management/test-task',
                name: '测试任务',
                access: ['testTask-preview','testTask-edit'],
                component: './task-management/test-task',
            },

        
            {
                path: '/task-management/test-requirement',
                name: '测试需求',
                access: ['testRequirement-preview','testRequirement-edit'],
                component: './task-management/test-requirement',
            },

        
            {
                path: '/task-management/test-task-one',
                name: '测试任务',
                access: ['testTaskOne-preview','testTaskOne-edit'],
                component: './task-management/test-task-one',
            },

        
    ],
},