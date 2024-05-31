import { navbar } from "vuepress-theme-hope";

export default navbar([
  { text: "主页", icon: "home", link: "/" },
  {
    text: "代码笔记",
    icon: "code",
    prefix: "/code/",
    children: [
      {
        text: "数据结构与算法",
        icon: "template",
        link: "data-structure-and-algorithms/",
      },
      {
        text: "Java",
        icon: "java",
        link: "java/",
      },
      {
        text: "MySQL",
        icon: "mysql",
        link: "mysql/",
      },
      {
        text: "杂记",
        icon: "folder",
        link: "notes/",
      },
    ],
  },
  {
    text: "分类",
    icon: "type",
    children: [
      {
        text: "分类",
        icon: "categoryselected",
        link: "/category/",
      },
      {
        text: "标签",
        icon: "tag",
        link: "/tag/",
      },
      {
        text: "时间线",
        icon: "flow",
        link: "/timeline/",
      },
    ],
  },
  {
    text: "随笔",
    icon: "fa-solid fa-compass-drafting",
    link: "/jottings/",
  },
  { text: "链接", icon: "link", link: "/links" },
  { text: "关于我", icon: "people", link: "/about" },
]);
