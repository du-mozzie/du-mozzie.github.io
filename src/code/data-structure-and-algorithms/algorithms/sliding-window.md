---
order: 7
title: 滑动窗口
date: 2021-01-05
category: 数据结构与算法
timeline: true
article: true
---

# 滑动窗口

**滑动窗口算法思想是非常重要的一种思想，可以用来解决数组，字符串的子元素问题。它可以将嵌套循环的问题，转换为单层循环问题，降低时间复杂度，提高效率。**

滑动窗口的思想非常简单，它将子数组（子字符串）理解成一个滑动的窗口，然后将这个窗口在数组上滑动，在窗口滑动的过程中，左边会出一个元素，右边会进一个元素，然后只需要计算当前窗口内的元素值即可。

可用滑动窗口思想解决的问题，一般有如下特点：

1.  窗口内元素是连续的。就是说，抽象出来的这个可滑动的窗口，在原数组或字符串上是连续的。
2.  窗口只能由左向右滑动，不能逆过来滑动。就是说，窗口的左右边界，只能从左到右增加，不能减少，即使局部也不可以。

## 算法思路

1.  使用双指针中的左右指针技巧，初始化 left = right = 0，把索引闭区间 [left, right] 称为一个「窗口」。
2.  先不断地增加 right 指针扩大窗口 [left, right]，直到窗口符合要求
3.  停止增加 right，转而不断增加 left 指针缩小窗口 [left, right]，直到窗口中的字符串不再符合要求。同时，每次增加 left，我们都要更新一轮结果。
4.  重复第 2 和第 3 步，直到 right 到达尽头。

>   第 2 步相当于在寻找一个「可行解」，然后第 3 步在优化这个「可行解」，最终找到最优解。 左右指针轮流前进，窗口大小增增减减，窗口不断向右滑动。

**代码模板**

```go
left,right := 0,0 // 左右指针

// 窗口右边界滑动
for right < length {
  window.add(s[right])      // 右元素进窗
  right++                   // 右指针增加

  // 窗口满足条件
  for valid(window) && left<right {
    ...                      // 满足条件后的操作
    window.remove(arr[left]) // 左元素出窗
    left++                   // 左指针移动，直到窗口不满足条件
  }
}
```



注意:

-   滑动窗口适用的题目一般具有单调性
-   滑动窗口、双指针、单调队列和单调栈经常配合使用

滑动窗口的思路很简单，但在leetcode上关于滑动窗口的题目一般都是mid甚至hard的题目。其难点在于，如何抽象窗口内元素的操作，验证窗口是否符合要求的过程。
即上面步骤2，步骤3的两个过程。https://leetcode-cn.com/problems/minimum-size-subarray-sum/)

所谓滑动窗口，**就是不断的调节子序列的起始位置和终止位置，从而得出我们要想的结果**

给定一个含有 n 个正整数的数组和一个正整数 s ，找出该数组中满足其和 ≥ s 的长度最小的 连续 子数组，并返回其长度。如果不存在符合条件的子数组，返回 0。

示例：

输入：s = 7, nums = [2,3,1,2,4,3] 输出：2 解释：子数组 [4,3] 是该条件下的长度最小的子数组。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/滑动窗口.gif)

最后找到 4，3 是最短距离。

其实从动画中可以发现滑动窗口也可以理解为双指针法的一种！只不过这种解法更像是一个窗口的移动，所以叫做滑动窗口更适合一些。

在本题中实现滑动窗口，主要确定如下三点：

-   窗口内是什么？
-   如何移动窗口的起始位置？
-   如何移动窗口的结束位置？

窗口就是 满足其和 ≥ s 的长度最小的 连续 子数组。

窗口的起始位置如何移动：如果当前窗口的值大于s了，窗口就要向前移动了（也就是该缩小了）。

窗口的结束位置如何移动：窗口的结束位置就是遍历数组的指针，窗口的起始位置设置为数组的起始位置就可以了。

解题的关键在于 窗口的起始位置如何移动，如图所示：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210719172352539.png)

可以发现**滑动窗口的精妙之处在于根据当前子序列和大小的情况，不断调节子序列的起始位置。从而将O(n^2)的暴力解法降为O(n)。**

```java
class Solution {
    // 滑动窗口
    public int minSubArrayLen(int s, int[] nums) {
        int left = 0;
        int sum = 0;
        int result = Integer.MAX_VALUE;
        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            while (sum >= s) {
                result = Math.min(result, right - left + 1);
                sum -= nums[left++];
            }
        }
        return result == Integer.MAX_VALUE ? 0 : result;
    }
}
```