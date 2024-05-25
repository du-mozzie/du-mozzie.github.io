---
order: 4
title: 埃式筛
date: 2021-01-03
category: 数据结构与算法
timeline: true
article: true
---

# 埃式筛

[leetcode 204 计算质数](https://leetcode-cn.com/problems/count-primes/)

通过标记0<n中的合数来减少遍历次数，求出0<n的素数个数

```java
class Solution {
    public int countPrimes(int n) {
        int[] isPrime = new int[n];
        int count = 0;
        for(int i = 2; i < n; i++){
            if(isPrime[i] == 0){
                count++;
                if((long) i * i < n){
                    for(int j = i * i; j < n; j += i){
                        isPrime[j] = 1;
                    }
                }
            }
        }
        return count;
    }
}
```