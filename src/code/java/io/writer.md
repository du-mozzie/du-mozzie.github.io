---
order: 6
title: Writer
date: 2021-06-06
category: Java
tag: Java
timeline: true
article: true
---

# Writer

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202852617.png)

Appendable 接口可以将 char 类型的数据读入到`数据缓冲区`
![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202905901.png)

OutputStreamWriter 处理流

OutputStreamWriter 的功能是将`输出字节流`转成`输出字符流`，与 InputStreamReader 相对应的，将`输入字节流`转成`输入字符流`
![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202923524.png)

```java
public class Test {
    public static void main(String[] args) throws Exception {
        Writer writer = new FileWriter("/Users/du/Desktop/copy.txt");
        //writer.write("你好");
//        char[] chars = {'你','好','世','界'};
//        writer.write(chars,2,2);
        String str = "Hello World,你好世界";
        writer.write(str,10,6);
        writer.flush();
        writer.close();
    }
}
```
