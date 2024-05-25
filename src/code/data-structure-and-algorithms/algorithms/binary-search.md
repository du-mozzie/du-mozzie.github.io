---
order: 6
title: 二分查找
date: 2021-01-04
category: 数据结构与算法
timeline: true
article: true
---

# 二分查找

[x的平方根](https://leetcode-cn.com/problems/sqrtx/)

有序数组通常使用二分查找

线性表中的元素必须是有序的，线性表必须采用顺序存储；待查找的数是整数，且知道范围，大概可以使用二分查找

https://leetcode-cn.com/problems/sqrtx/

```java
public static int binarySearch(int[] arr, int start, int end, int hkey){
    int result = -1;

    while (start <= end){
        int mid = start + (end - start)/2;    //防止溢出
        if (arr[mid] > hkey)
            end = mid - 1;
        else if (arr[mid] < hkey)
            start = mid + 1;
        else {
            result = mid ;  
            break;
        }
    }
    return result;
}
```