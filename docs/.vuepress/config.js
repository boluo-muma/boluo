module.exports = {
  base: '/boluo/',
  title: '菠萝吹雪的博客',
  description: 'Just playing around',
  themeConfig: {
    navbar: [
      { text: '树遍历方法', link: '/list/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'External', link: 'https://baidu.com' },
    ],
    sidebar: {
      '/home/': [
        {
          text: '指南',
          children:[
            '/home/README.md'
          ]
        }
      ],
      '/list/':[
        {
          text: '',
          children: [
            '/list/README.md'
          ]
        }
      ]
    }
  }

}