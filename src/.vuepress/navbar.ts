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
        icon: "/assets/images/navbar/data-structure.svg",
        link: "data-structure-and-algorithms/",
      },
      {
        text: "Java",
        icon: "/assets/images/navbar/java.svg",
        link: "java/",
      },
      {
        text: "Netty",
        icon: "/assets/images/navbar/netty.svg",
        link: "netty/",
      },
      {
        text: "MySQL",
        icon: "/assets/images/navbar/mysql.svg",
        link: "mysql/",
      },
      {
        text: "Spring",
        icon: "/assets/images/navbar/spring.svg",
        link: "spring/",
      },
      {
        text: "Redis",
        icon: "/assets/images/navbar/redis.svg",
        link: "redis/",
      },
      {
        text: "分布式",
        icon: "/assets/images/navbar/distributed.svg",
        link: "distributed/",
      },
      {
        text: "AI",
        icon: "/assets/images/navbar/ai.svg",
        link: "ai/",
      },
      {
        text: "其他",
        icon: "/assets/images/navbar/notes.svg",
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
        icon: "/assets/images/navbar/category.svg",
        link: "/category/",
      },
      {
        text: "标签",
        icon: "/assets/images/navbar/tag.svg",
        link: "/tag/",
      },
      {
        text: "时间线",
        icon: "/assets/images/navbar/timeline.svg",
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
