import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright="Powered by NEVC"
      links={[
        {
          key: 'OS 测试平台',
          title: 'OS 测试平台',
          href: 'https://nevc.com.cn/',
          blankTarget: true,
        },
        // {
        //   key: 'github',
        //   title: <GithubOutlined />,
        //   href: 'https://github.com/ant-design/ant-design-pro',
        //   blankTarget: true,
        // },
        {
          key: 'NEVC',
          title: 'NEVC',
          href: 'https://nevc.com.cn/',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
