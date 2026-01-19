import { hopeTheme } from "vuepress-theme-hope";
import navbar from "./navbar.js";
import sidebar from "./sidebar.js";
import { JUE_JIN_LOGO } from "./logo.js";

export default hopeTheme({
  hostname: "https://du-mozzie.github.io",

  author: {
    name: "mozzie",
    url: "https://du-mozzie.github.io",
  },

  iconAssets: "fontawesome-with-brands",

  iconPrefix: "iconfont icon-",

  logo: "/assets/images/ghibli.jpg",

  repo: "https://github.com/du-mozzie/du-mozzie.github.io",

  repoDisplay: false,

  docsDir: "src",

  // 导航栏
  navbar,

  // 侧边栏
  sidebar,
  headerDepth: 6,

  // 页脚
  footer: "",

  displayFooter: true,

  // 博客相关
  blog: {
    description:
      "人生只有一辈子可活，问题是：这辈子你打算怎么活？你决定成为什么样的人？",
    intro: "/about.html",
    medias: {
      Gitee: "https://gitee.com/du_mozzie",
      GitHub: "https://github.com/du-mozzie",
      Email: "mailto:2548425238@qq.com",
      Gmail: "mailto:mozzie.du@gmail.com",
      掘金: ["https://juejin.cn/user/87590848708078", JUE_JIN_LOGO],
      Discord: "https://discord.com/users/1074571140325969970",
    },
    //默认每个分页的文章数
    //https://vuepress-theme-hope.gitee.io/v2/zh/guide/blog/intro.html#%E5%A4%9A%E8%AF%AD%E8%A8%80%E6%94%AF%E6%8C%81
    articlePerPage: 10,
  },

  // 如果想要实时查看任何改变，启用它。注: 这对更新性能有很大负面影响
  hotReload: true,

  // 编辑此页
  editLink: false,
  // 是否显示页面最后更新时间
  lastUpdated: false,
  // 是否显示页面贡献者
  contributors: true,

  // 在这里配置主题提供的插件
  plugins: {
    search: true,
    blog: {
      excerptLength: 10,
    },

    components: {
      components: [
        "Badge",
        "VPCard",
        "CodePen",
        "StackBlitz",
        "SiteInfo",
        "Share",
      ],
    },

    mdEnhance: {
      align: true,
      codetabs: true,
      component: true,
      demo: true,
      figure: true,
      imgLazyload: true,
      imgSize: true,
      include: true,
      mark: true,
      sub: true,
      sup: true,
      tabs: true,
      tasklist: true,
      vPre: true,
      mathjax: true,
    },
  },
});
