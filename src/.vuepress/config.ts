import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/",
  locales: {
    "/": {
      lang: "zh-CN",
      description: "mozzie的笔记",
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
        src: "//hm.baidu.com/hm.js?062f74a68f105c60f10f2a0fc9cc9803",
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
