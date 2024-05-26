---
order: 5
title: 双指针
date: 2021-01-04
category: 算法
tag: 算法
timeline: true
article: true
---

# 双指针

**双指针**，指的是在遍历对象的过程中，不是普通的使用单个指针进行访问，而是使用两个相同方向（*快慢指针*）或者相反方向（*对撞指针*）的指针进行扫描，从而达到相应的目的。

## 对撞指针

**对撞指针**是指在有序数组中，将指向最左侧的索引定义为`左指针(left)`，最右侧的定义为`右指针(right)`，然后从两头向中间进行数组遍历。

>   对撞数组适用于**有序数组**，也就是说当你遇到题目给定有序数组时，应该第一时间想到用对撞指针解题。

伪代码

```javascript
function fn (list) {
  var left = 0;
  var right = list.length - 1;

  //遍历数组
  while (left <= right) {
    left++;
    // 一些条件判断 和处理
    ... ...
    right--;
  }
}
```

[LeetCode 881 救生艇](https://leetcode-cn.com/problems/boats-to-save-people/)

## 快慢指针

**快慢指针**也是双指针，但是两个指针从同一侧开始遍历数组，将这两个指针分别定义为`快指针（fast）`和`慢指针（slow）`，两个指针以不同的策略移动，直到两个指针的值相等（或其他特殊条件）为止，如fast每次增长两个，slow每次增长一个。

[LeetCode 26 删除排序数组中的重复项](https://link.zhihu.com/?target=https%3A//leetcode-cn.com/problems/remove-duplicates-from-sorted-array/)

[LeetCode 141.环形链表](https://link.zhihu.com/?target=https%3A//leetcode-cn.com/problems/linked-list-cycle/)

## 总结

当遇到有序数组时，应该优先想到`双指针`来解决问题，因两个指针的同时遍历会减少空间复杂度和时间复杂度。