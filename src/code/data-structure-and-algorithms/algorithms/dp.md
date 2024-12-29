---
order: 8
title: 动态规划
date: 2021-01-07
category: 算法
tag: 算法
timeline: true
article: true
---

# 动态规划(DP)

算法核心：==记住已经解决过的子问题的解==

**将一个问题拆成几个子问题，分别求解这些子问题，即可推断出大问题的解**

>   记住求解的方式有两种	1、自顶向下的备忘录法	2、自底向上。

​		在求解问题中,对于每一步决策,列出各种可能的局部解,再依据某种判定条件，舍弃那些肯定不能得到最优解的局部解,在每一步都经过筛选,以每一步都是最优解来保证全局是最优解。

**做题策略**

> 暴力递归和动态规划的关系

- 某一个暴力递归，有解的重复调用，就可以把这个暴力递归优化成动态规划
- 任何动态规划问题，都一定对应着某一个有重复过程的暴力递归，但不是所有的暴力递归，都一定对应着动态规划

> 如何找到某个问题的动态规划方式？

1. 设计暴力递归：重要原则+4种常见尝试模型！重点！
   - 从左往右的尝试模型
   - 范围上的尝试模型
   - 多样本位置全对应的尝试模型
   - 寻找业务限制的尝试模型
2. 分析有没有重复解：套路解决
3. 用记忆化搜索->用严格表结构实现动态规划：套路解决
4. 看看能否继续优化：套路解决

> 面试中设计暴力递归过程的原则

1. 每一个可变参数的类型，一定不要比int类型更加复杂
2. 原则1 可以违反，让类型突破到一维线性结构，那必须是单一可变参数
3. 如果发现原则1 被违反，但不违反原则2 ，只需要做到记忆化搜索即可
4. 可变参数的个数，能少则少

> 如何分析有没有重复解

1. 列出调用过程，可以只列出前几层
2. 有没有重复解，一看便知

> 暴力递归到动态规划的套路

1. 你已经有了一个不违反原则的暴力递归，而且的确存在解的重复调用
2. 找到哪些参数的变化会影响返回值，对每一个列出变化范围
3. 参数间的所有的组合数量，意味着表大小
4. 记忆化搜索的方法就是傻缓存，非常容易得到
5. 规定好严格表的大小，分析位置的依赖顺序，然后从基础填写到最终解
6. 对于有枚举行为的决策过程，进一步优化

> 动态规划的进一步优化

1. 空间压缩
2. 状态化简
3. 四边形不等式
4. 其他优化技巧

滚动数组是DP中的一种编程思想。简单的理解就是让数组滚动起来，每次都使用固定的几个存储空间，来达到压缩，节省存储空间的作用。起到优化空间，主要应用在递推或动态规划中。因为DP题目是一个自底向上的扩展过程，我们常常需要用到的是连续的解，前面的解往往可以舍去。所以用滚动数组优化是很有效的。利用滚动数组的话在N很大的情况下可以达到压缩存储的作用。 

知道了面试中设计暴力递归过程的原则，然后呢？一定要逼自己找到不违反原则情况下的暴力尝试！如果你找到的暴力尝试，不符合原则，马上舍弃！找新的！如果某个题目突破了设计原则，一定极难极难，面试中出现概率低于5%！

## 01背包问题

有这么一个问题：有n件物品和一个最多能背重量为w 的背包。第i件物品的重量是weight[i]，得到的价值是value[i] 。**每件物品只能用一次**，求解将哪些物品装入背包里物品价值总和最大。

![image-20241229195752657](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20241229195752657.png)

这个问题最先能够想到的就是暴力求解，每一件物品其实只有两个状态，取或者不取，所以可以使用回溯法搜索出所有的情况，那么时间复杂度就是O(2^n^)，这里的n表示物品数量。

> 暴力回溯

```java
public class LeetCodeTest {
    
    @Test
    public void test(){
        // 物品的重量数组
        int[] weights = {2, 3, 4, 5};
        // 物品的价值数组
        int[] values = {3, 4, 5, 6};
        // 物品总数
        int n = values.length;
        // 背包容量
        int capacity = 5;

        // 计算最大价值
        knapsack(weights, values, n, capacity);

        // 输出最大价值
        System.out.println("最大价值: " + maxValue);
    }

    // 记录当前背包中物品的最大价值
    private int maxValue = 0;

    // 01背包的回溯方法
    public void knapsack(int[] weights, int[] values, int n, int capacity) {
        // 从第0个物品开始回溯
        backtrack(weights, values, n, capacity, 0, 0);
    }

    // 回溯法递归函数
    private void backtrack(int[] weights, int[] values, int n, int capacity, int index, int currentValue) {
        // 如果已经遍历完所有物品，更新最大价值
        if (index == n) {
            maxValue = Math.max(maxValue, currentValue);
            return;
        }

        // 选择不放入当前物品
        backtrack(weights, values, n, capacity, index + 1, currentValue);

        // 选择放入当前物品（前提是物品重量不超过背包剩余容量）
        if (weights[index] <= capacity) {
            backtrack(weights, values, n, capacity - weights[index], index + 1, currentValue + values[index]);
        }
    }
}
```

> 可以使用一个二维表优化暴力回溯

1. **状态定义：**

   - 定义 `dp[i][j]` 表示在前 `i` 件物品中，背包容量为 `j` 时能取得的最大价值。
   - `i` 表示考虑到第 `i` 个物品（包括不选和选它的两种情况）。
   - `j` 表示背包的容量（从 `0` 到 `W`）。

2. **状态转移方程：**

   - 对于第 `i` 个物品，我们有两个选择：

     - **不选择第 `i` 个物品：** `dp[i][j] = dp[i-1][j]`，即背包容量 `j` 下的最大价值不变。
     - **选择第 `i` 个物品：** 如果物品的重量小于等于当前容量 `j`，则 `dp[i][j] = dp[i-1][j-weight[i]] + value[i]`，即加上第 `i` 个物品的价值。

   - 综合起来，状态转移方程为：

     ```
     dp[i][j] = max(dp[i-1][j], dp[i-1][j - weight[i]] + value[i])
     ```

3. **初始化：**

   - `dp[0][j] = 0`，即没有物品时，背包中任何容量下的最大价值都为 0。
   - `dp[i][0] = 0`，即背包容量为 0 时，任何物品都无法放入背包，最大价值为 0。

4. **最终目标：**

   - 最终的答案是 `dp[n][W]`，即考虑所有物品并且背包容量为 `W` 时的最大价值。

```java
public class LeetCodeTest {
    
    @Test
    public void test(){
        // 物品的重量数组
        int[] weights = {2, 3, 4, 5};
        // 物品的价值数组
        int[] values = {3, 4, 5, 6};
        // 物品总数
        int n = values.length;
        // 背包容量
        int capacity = 5;

        // 计算最大价值
        int maxValue = knapsack(weights, values, n, capacity);

        // 输出最大价值
        System.out.println("最大价值: " + maxValue);
    }

    // 动态规划方法，计算最大价值
    public int knapsack(int[] weights, int[] values, int n, int capacity) {
        // 创建 DP 表，dp[i][j] 表示前 i 个物品，背包容量为 j 时的最大价值
        int[][] dp = new int[n + 1][capacity + 1];

        // 遍历每个物品
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j <= capacity; j++) {
                // 如果不选择第 i 个物品
                dp[i][j] = dp[i - 1][j];

                // 如果选择第 i 个物品（且容量足够）
                if (weights[i - 1] <= j) {
                    dp[i][j] = Math.max(dp[i][j], dp[i - 1][j - weights[i - 1]] + values[i - 1]);
                }
            }
        }

        // 最终的最大价值存储在 dp[n][capacity] 中
        return dp[n][capacity];
    }
}
```

时间和空间复杂度

- **时间复杂度：** `O(n * W)`，其中 `n` 是物品的数量，`W` 是背包的容量。我们需要对每个物品和每个容量进行遍历。
- **空间复杂度：** `O(n * W)`，需要一个大小为 `n+1` x `W+1` 的二维数组来存储每个子问题的结果。

> 进一步优化

我们可以发现，**当前的状态只与前一行的状态有关**，因此可以只使用一个一维数组来代替二维数组，从而节省空间。

- 定义一个 `dp[j]` 数组，表示背包容量为 `j` 时的最大价值。
- 从 `i = 1` 到 `n` 遍历物品，在每次遍历物品时，从 **背包容量从大到小** 更新 `dp` 数组。这是因为我们要避免当前物品多次计算。

```java
public class LeetCodeTest {
    
    @Test
    public void test(){
        // 物品的重量数组
        int[] weights = {2, 3, 4, 5};
        // 物品的价值数组
        int[] values = {3, 4, 5, 6};
        // 物品总数
        int n = values.length;
        // 背包容量
        int capacity = 5;

        // 计算最大价值
        int maxValue = knapsack(weights, values, n, capacity);

        // 输出最大价值
        System.out.println("最大价值: " + maxValue);
    }

    // 动态规划方法，计算最大价值
    public int knapsack(int[] weights, int[] values, int n, int capacity) {
        // dp[i] 表示容量为 i 的背包所能获得的最大价值
        int[] dp = new int[capacity + 1];

        // 遍历每个物品
        for (int i = 0; i < n; i++) {
            // 从后往前遍历，避免重复计算
            for (int j = capacity; j >= weights[i]; j--) {
                dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);
            }
        }

        // 最终的最大价值存储在 dp[capacity] 中
        return dp[capacity];
    }
}
```

时间复杂度和空间复杂度：

- **时间复杂度：**`O(n * W)`其中 `n` 是物品的数量，`W` 是背包的容量
  - 外层循环遍历每个物品 `n` 次。
  - 内层循环遍历每个可能的背包容量 `W` 次。
- **空间复杂度：** `O(W)`，因为我们只需要一个一维数组来存储当前背包容量下的最大价值。

**注意点**：

1. 一定是先物品后背包；不然每个背包只装一个物品
2. 背包一定是倒叙的，不然会重复装同一个

### 相关题目

1. [力扣 416.分割等和子集](https://leetcode.cn/problems/partition-equal-subset-sum/description/)
2. [力扣 1049.最后一块石头的重量Ⅱ](https://leetcode.cn/problems/last-stone-weight-ii/description/)
3. [力扣 494.目标和](https://leetcode.cn/problems/target-sum/description/)

## 树形DP套路

1. 以某个节点X为头节点的子树中，分析答案有哪些可能性，并且这种分析是以X的左子树、X的右子树和X整棵树的角度来考虑可能性的
2. 根据第一步的可能性分析，列出所有需要的信息
3. 合并第二步的信息，对左树和右树提出同样的要求，并写出信息结构
4. 设计递归函数，递归函数是处理以X为头节点的情况下的答案。
   包括设计递归的basecase，默认直接得到左树和右树的所有信息，以及把可能性做整合，并且要返回第三步的信息结构这四个小步骤

一般都要用到查表
