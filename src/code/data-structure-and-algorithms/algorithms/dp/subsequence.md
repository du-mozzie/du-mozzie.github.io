---
order: 3
title: '子序列问题'
date: 2021-01-07
category: 算法
tag: 算法
timeline: true
article: true
---

## 子序列问题

### 最长递增子序列

[力扣 300. 最长递增子序列](https://leetcode.cn/problems/longest-increasing-subsequence/)

给你一个整数数组 `nums` ，找到其中最长严格递增子序列的长度。

**子序列** 是由数组派生而来的序列，删除（或不删除）数组中的元素而不改变其余元素的顺序。例如，`[3,6,2,7]` 是数组 `[0,3,1,6,2,2,7]` 的子序列。

```java
class Solution {
    public int lengthOfLIS(int[] nums) {
        // 下标为i的最长递增子序列长度为dp[i]
        int[] dp = new int[nums.length];
        dp[0] = 1;

        // 最长肯定有1
        int ans = 1;

        for (int i = 1; i < nums.length; i++) {
            // 找每个数的最长递增子序列
            int max = 0;
            // 0..i-1
            for (int j = 0; j < i; j++) {
                // 如果i比当前的数大说明可以以该数继续递增
                if(nums[i] > nums[j]) {
                    max = Math.max(max, dp[j]);
                }
            }
            // 加上当前数
            dp[i] = max + 1;
            ans = Math.max(ans, dp[i]);
        }
        return ans;
    }
}
```

### 最长连续递增序列

[力扣 674. 最长连续递增序列](https://leetcode.cn/problems/longest-continuous-increasing-subsequence/)

给定一个未经排序的整数数组，找到最长且 **连续递增的子序列**，并返回该序列的长度。

**连续递增的子序列** 可以由两个下标 `l` 和 `r`（`l < r`）确定，如果对于每个 `l <= i < r`，都有 `nums[i] < nums[i + 1]` ，那么子序列 `[nums[l], nums[l + 1], ..., nums[r - 1], nums[r]]` 就是连续递增子序列。

```java
class Solution {
    public int findLengthOfLCIS(int[] nums) {
        // 以i结尾的最长连续递增子序列为 dp[i]
        int[] dp = new int[nums.length];
        dp[0] = 1;
        int ans = 1;
        for (int i = 1; i < nums.length; i++) {
            // 如果大于前一个数就递增+1 否则从1开始计数
            dp[i] = nums[i] > nums[i - 1] ? dp[i - 1] + 1 : 1;
            ans = Math.max(ans, dp[i]);
        }
        return ans;
    }
}
```

### 最长重复子数组

[力扣 718. 最长重复子数组](https://leetcode.cn/problems/maximum-length-of-repeated-subarray/)

给两个整数数组 `nums1` 和 `nums2` ，返回 *两个数组中 **公共的** 、长度最长的子数组的长度* 。

```java
class Solution {
    public int findLength(int[] nums1, int[] nums2) {
        // nums1从0..i-1, nums2从0..j-1, 最长重复子数组长度为dp[i][j]
        int[][] dp = new int[nums1.length + 1][nums2.length + 1];
        int maxLength = 0; // 记录最长重复子数组的长度

        // 遍历 nums1 和 nums2
        for (int i = 1; i <= nums1.length; i++) {
            for (int j = 1; j <= nums2.length; j++) {
                // 如果两个元素相同，继续更新 dp 数组
                if (nums1[i - 1] == nums2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                    maxLength = Math.max(maxLength, dp[i][j]); // 更新最大值
                } else {
                    dp[i][j] = 0; // 不相等时长度为 0
                }
            }
        }
        return maxLength; // 返回最长重复子数组的长度
    }
}
```

优化一维数组，每一行都是通过左上角递推过来，所以只需要一维数组记录上一行，遍历nums2需要从后往前，否则会出现覆盖。

```java
class Solution {
    public int findLength(int[] nums1, int[] nums2) {
        int[] dp = new int[nums2.length + 1];
        int maxLength = 0;

        // 遍历 nums1 和 nums2
        for (int i = 1; i <= nums1.length; i++) {
            for (int j = nums2.length; j > 0; j--) {
                dp[j] = nums1[i - 1] == nums2[j - 1] ? dp[j - 1] + 1 : 0;
                maxLength = Math.max(maxLength, dp[j]);
            }
        }
        return maxLength;
    }
}
```

### 最长公共子序列

[力扣 1143. 最长公共子序列](https://leetcode.cn/problems/longest-common-subsequence/)

给定两个字符串 `text1` 和 `text2`，返回这两个字符串的最长 **公共子序列** 的长度。如果不存在 **公共子序列** ，返回 `0` 。

一个字符串的 **子序列** 是指这样一个新的字符串：它是由原字符串在不改变字符的相对顺序的情况下删除某些字符（也可以不删除任何字符）后组成的新字符串。

- 例如，`"ace"` 是 `"abcde"` 的子序列，但 `"aec"` 不是 `"abcde"` 的子序列。

两个字符串的 **公共子序列** 是这两个字符串所共同拥有的子序列。

```java
class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        int m = text1.length(), n = text2.length();
        // text1以0..i-1结尾, text2以0..j-1结尾的最长公共子序列是dp[i][j]
        int[][] dp = new int[m + 1][n + 1];

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                    // 相同 0..i-1, 0..j-1为结尾 + 1
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    // 不同 0..i-1或0..j-1 取最长
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        return dp[m][n];
    }
}
```

### 不相交的线

[力扣 1035. 不相交的线](https://leetcode.cn/problems/uncrossed-lines/)

在两条独立的水平线上按给定的顺序写下 `nums1` 和 `nums2` 中的整数。

现在，可以绘制一些连接两个数字 `nums1[i]` 和 `nums2[j]` 的直线，这些直线需要同时满足：

-  `nums1[i] == nums2[j]`
- 且绘制的直线不与任何其他连线（非水平线）相交。

请注意，连线即使在端点也不能相交：每个数字只能属于一条连线。

以这种方法绘制线条，并返回可以绘制的最大连线数。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250121204152904.png)

**这个问题其实就是最长子序列问题**

```java
class Solution {
    public int maxUncrossedLines(int[] nums1, int[] nums2) {
        int m = nums1.length, n = nums2.length;

        int[][] dp = new int[m + 1][n + 1];

        for(int i = 1; i <= m; i++) {
            for(int j = 1; j <= n; j++) {
                if(nums1[i - 1] == nums2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                }else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        return dp[m][n];
    }
}
```

### 最大子数组和

[力扣 53. 最大子数组和](https://leetcode.cn/problems/maximum-subarray/)

给你一个整数数组 `nums` ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。子数组是数组中的一个连续部分。

```java
class Solution {
    public int maxSubArray(int[] nums) {
        int n = nums.length;
        // 以nums[i]为下标的最大子数组和为dp[i]
        int[] dp = new int[n];
        dp[0] = nums[0];
        int ans = dp[0];
        for(int i = 1; i < n; i++) {
            // max(继续之前的连续和, 重新开始连续和)
            dp[i] = Math.max(dp[i - 1] + nums[i], nums[i]);
            ans = Math.max(ans, dp[i]);
        }
        return ans;
    }
}
```

### 判断子序列

[力扣 392. 判断子序列](https://leetcode.cn/problems/is-subsequence/)

给定字符串 **s** 和 **t** ，判断 **s** 是否为 **t** 的子序列。

字符串的一个子序列是原始字符串删除一些（也可以不删除）字符而不改变剩余字符相对位置形成的新字符串。（例如，`"ace"`是`"abcde"`的一个子序列，而`"aec"`不是）。

**进阶：**

如果有大量输入的 S，称作 S1, S2, ... , Sk 其中 k >= 10亿，你需要依次检查它们是否为 T 的子序列。在这种情况下，你会怎样改变代码？

```java
class Solution {
    public boolean isSubsequence(String s, String t) {
        int m = s.length(), n = t.length();
        // dp[i][j] 表示以下标i-1为结尾的字符串s，和以下标j-1为结尾的字符串t，相同子序列的长度为dp[i][j]
        int[][] dp = new int[m + 1][n + 1];

        for(int i = 1; i <= m; i++) {
            for(int j = 1; j <= n; j++) {
                if(s.charAt(i - 1) == t.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                }else{
                    // 只做t的删除
                    dp[i][j] = dp[i][j - 1];
                }
            }
        }
        return dp[m][n] == m;
    }
}
```

### 不同的子序列

[力扣 115. 不同的子序列](https://leetcode.cn/problems/distinct-subsequences/)

给你两个字符串 `s` 和 `t` ，统计并返回在 `s` 的 **子序列** 中 `t` 出现的个数，结果需要对 109 + 7 取模。

**示例 1：**

> 输入：s = "rabbbit", t = "rabbit"
> 输出：3
> 解释：
> 如下所示, 有 3 种可以从 s 中得到 "rabbit" 的方案。
> **rabb**b**it**
> **ra**b**b**b**it**
> **ra**bb**bit**

```java
class Solution {
    public int numDistinct(String s, String t) {
        int m = s.length(), n = t.length();
        // 以i-1为结尾的s子序列中出现以j-1为结尾的t的个数为dp[i][j]。
        int[][] dp = new int[m + 1][n + 1];

        // 初始化
        for(int i = 0; i <= m; i++) {
            // t为空字符串的时候永远为1
            dp[i][0] = 1;
        }

        for(int i = 1; i <= m; i++) {
            for(int j = 1; j <= n; j++) {
                // 当前位置只从它的左上角和上方递推过来
                if(s.charAt(i - 1) == t.charAt(j - 1)) {
                    // (不考虑s, t最后一位) + (不考虑s[i - 1]考虑t最后一位)
                    dp[i][j] = dp[i - 1][j - 1] + dp[i - 1][j];
                }else{
                    // 不考虑s[i - 1]考虑t最后一位
                    dp[i][j] = dp[i - 1][j];
                }
            }
        }
        return dp[m][n];
    }
}
```

### 两个字符串的删除操作

[力扣 583. 两个字符串的删除操作](https://leetcode.cn/problems/delete-operation-for-two-strings/)

给定两个单词 `word1` 和 `word2` ，返回使得 `word1` 和 `word2` **相同**所需的**最小步数**。

**每步** 可以删除任意一个字符串中的一个字符。

```java
class Solution {
    public int minDistance(String word1, String word2) {
        int m = word1.length(), n = word2.length();
        // word1以i-1为结尾, word2以j-1为结尾相同需要dp[i][j]步
        int[][] dp = new int[m + 1][n + 1];

        // 初始化
        for (int i = 1; i <= m; i++) {
            dp[i][0] = i;
        }

        for (int j = 1; j <= n; j++) {
            dp[0][j] = j;
        }

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                    // 相同无需删除
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    // 不同选择删除word1或者word2任意一个字符
                    dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + 1;
                }
            }
        }

        return dp[m][n];
    }
}
```

### 编辑距离

[力扣 72. 编辑距离](https://leetcode.cn/problems/edit-distance/)

给你两个单词 `word1` 和 `word2`， *请返回将 `word1` 转换成 `word2` 所使用的最少操作数* 。

你可以对一个单词进行如下三种操作：

- 插入一个字符
- 删除一个字符
- 替换一个字符

```java
class Solution {
    public int minDistance(String word1, String word2) {
        int m = word1.length(), n = word2.length();
        // word1以i-1为结尾, word2以i-2为结尾, word1转换成word2锁使用的最少操作数为dp[i][j]
        int[][] dp = new int[m + 1][n + 1];

        for (int i = 1; i <= m; i++) {
            dp[i][0] = i;
        }

        for (int j = 1; j <= n; j++) {
            dp[0][j] = j;
        }

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if(word1.charAt(i - 1) == word2.charAt(j - 1)) {
                    // 无需操作
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    // 删除word1(等效插入word2)
                    int p1 = dp[i - 1][j];
                    // 插入word1(等效删除word2)
                    int p2 = dp[i][j - 1];
                    // 在dp[i - 1][j - 1]的基础上替换,dp[i - 1][j - 1]说明0..i-1已经是等于0..j-1了
                    int p3 = dp[i - 1][j - 1];                 
                    dp[i][j] = Math.min(p1, Math.min(p2, p3)) + 1;
                }
            }
        }

        return dp[m][n];
    }
}
```

### 回文子串

[力扣 647. 回文子串](https://leetcode.cn/problems/palindromic-substrings/)

给你一个字符串 `s` ，请你统计并返回这个字符串中 **回文子串** 的数目。

**回文字符串** 是正着读和倒过来读一样的字符串。

**子字符串** 是字符串中的由连续字符组成的一个序列。

```java
class Solution {
    public int countSubstrings(String s) {
        int n = s.length();
        // 以i..j为区间的字串是否是回文, 默认都是false
        boolean[][] dp = new boolean[n][n];
        int ans = 0;
        // 因为需要依赖到左下角的值 从下往上 从左往右
        for (int i = n - 1; i >= 0; i--) {
            // j永远是>=i
            for (int j = i; j < n; j++) {
                // 如果s(i) == s(j)
                if (s.charAt(i) == s.charAt(j)) {
                    // 如果当前字串长度 <= 1 说明i..j最多长度为1, 肯定是回文串
                    if (j - i <= 1) {
                        ans++;
                        dp[i][j] = true;
                    } else {
                        // 如果> 1需要看i+1..j-1区间是否是回文
                        if (dp[i + 1][j - 1]) {
                            ans++;
                            dp[i][j] = true;
                        }
                    }
                }
            }
        }
        return ans;
    }
}
```

### 最长回文子序列

[力扣 516. 最长回文子序列](https://leetcode.cn/problems/longest-palindromic-subsequence/)

给你一个字符串 `s` ，找出其中最长的回文子序列，并返回该序列的长度。

子序列定义为：不改变剩余字符顺序的情况下，删除某些字符或者不删除任何字符形成的一个序列。

```java
class Solution {
    public int longestPalindromeSubseq(String s) {
        int n = s.length();
        // s(i) ~ s(j) 最长回文子序列长度为dp[i][j]
        int[][] dp = new int[n + 1][n + 1];

        // 从下往上 从左往右 只遍历右上角区域
        for (int i = n - 1; i >= 0; i--) {
            dp[i][i] = 1; // 初始化 对角线长度为1
            for (int j = i + 1; j < n; j++) {
                // i == j的时候 dp[i + 1][j - 1] + 2
                if (s.charAt(i) == s.charAt(j)) {
                    dp[i][j] = dp[i + 1][j - 1] + 2;
                } else {
                    // max(不选左边, 不选右边)
                    dp[i][j] = Math.max(dp[i + 1][j],  dp[i][j - 1]);
                }
            }
        }
        return dp[0][n - 1];
    }
}
```
