const routes = 
{
    path: '/case-management',
    name: '测试设计',
    icon: 'table',
    access: 'caseManagement',
    routes: [

            {
                path: '/case-management/test-case',
                name: '测试用例',
                access: ['testCase-preview','testCase-edit'],
                component: './case-management/test-case',
            },

        
            {
                path: '/case-management/test-sequence',
                name: '序列编辑',
                access: ['testSequence-preview','testSequence-edit'],
                component: './case-management/test-sequence',
            },

        
            {
                path: '/case-management/test-case-example',
                name: '示例测试库',
                access: ['testCaseExample-preview','testCaseExample-edit'],
                component: './case-management/test-case-example',
            },

        
            {
                path: '/case-management/test-sequence-edit',
                name: '序列编辑',
                access: ['testSequenceEdit-preview','testSequenceEdit-edit'],
                component: './case-management/test-sequence-edit',
            },

        
            {
                path: '/case-management/test-sequence-integration',
                name: '序列集成',
                access: ['testSequenceIntegration-preview','testSequenceIntegration-edit'],
                component: './case-management/test-sequence-integration',
            },

        
            {
                path: '/case-management/test-sequence-process',
                name: '测试流程',
                access: ['testSequenceProcess-preview','testSequenceProcess-edit'],
                component: './case-management/test-sequence-process',
            },

        
            {
                path: '/case-management/case-run',
                name: '用例执行',
                access: ['caseRun-preview','caseRun-edit'],
                component: './case-management/case-run',
            },

        
            {
                path: '/case-management/case-library',
                name: '序列执行',
                access: ['caseLibrary-preview','caseLibrary-edit'],
                component: './case-management/case-library',
            },

        
    ],
},