const routes = 
{
    path: '/case-management',
    name: '用例管理',
    icon: 'table',
    access: 'caseManagement',
    routes: [

            {
                path: '/case-management/case-library',
                name: '用例库',
                access: ['caseLibrary-preview','caseLibrary-edit'],
                component: './case-management/case-library',
            },

        
            {
                path: '/case-management/test-sequence-integration',
                name: '序列集成',
                access: ['testSequenceIntegration-preview','testSequenceIntegration-edit'],
                component: './case-management/test-sequence-integration',
            },

        
            {
                path: '/case-management/test-case',
                name: '测试用例',
                access: ['testCase-preview','testCase-edit'],
                component: './case-management/test-case',
            },

        
            {
                path: '/case-management/test-sequence',
                name: '测试序列',
                access: ['testSequence-preview','testSequence-edit'],
                component: './case-management/test-sequence',
            },

        
    ],
},