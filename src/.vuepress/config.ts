import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/",
  locales: {
    "/": {
      lang: "zh-CN",
      //   title: "Du的小站",
      description: "Du的随笔和笔记",
    },
  },
  theme,

  head: [
    [
      "link",
      {
        rel: "stylesheet",
        href: "//at.alicdn.com/t/font_2410206_mfj6e1vbwo.css",
      },
    ],
    [
      "link",
      {
        rel: "stylesheet",
        href: "//at.alicdn.com/t/font_3294373_aaebeoej8c7.css",
      },
    ],
    [
      "script",
      {
        // 百度统计
        src: "//hm.baidu.com/hm.js?85e80625eddf91d81d9535565850722b",
      },
    ],
    [
      "script",
      {
        // Clarity
        src: "/assets/js/clarity.js",
      },
    ],
  ],

  // vuepress-plugin-pwa2:  ⚠ The plugin will register service worker to handle assets,
  // so we recommend you to set "shouldPrefetch: false" in VuePress config file.
  shouldPrefetch: false,

  pagePatterns: ["**/*.md", "!**/*.snippet.md", "!.vuepress", "!node_modules"],
});
