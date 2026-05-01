---
order: 2
title: '01背包问题'
date: 2021-01-07
category: 算法
tag: 算法
timeline: true
article: true
---

## 01背包问题

有这么一个问题：有n件物品和一个最多能背重量为w 的背包。第i件物品的重量是weight[i]，得到的价值是value[i] 。**每件物品只能用一次**，求解将哪些物品装入背包里物品价值总和最大。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20241229195752657.png)

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

1. 纯01背包问题，容量为`i`最大能装多少价值的物品。

   纯01背包问题是指每个物品只能被选择一次，且物品不能分割。容量为 `i` 的背包最大能装的价值可以通过动态规划解决。设 `dp[i]` 表示容量为 `i` 的背包能装的最大价值，则状态转移方程为：
   $$
   dp[i] = max(dp[i], dp[i - w[j]] + v[j])
   $$
   其中 `w[j]` 和 `v[j]` 分别为第 `j` 个物品的重量和价值。最终结果为 `dp[n]`，其中 `n` 为背包容量。

2. [力扣 416.分割等和子集](https://leetcode.cn/problems/partition-equal-subset-sum/description/)，容量为`i`的背包能否装满指定价值的物品

   该问题是判断是否可以将一个数组分成两个子集，使得这两个子集的和相等。数组和为`sum`，背包容量为`target = sum / 2`，`target`如果是奇数则没有办法解决该问题，设 `dp[i]` 表示容量为`i` 的背包个能组成的最大价值，`dp[0]`的最大价值为0，则状态转移方程为：
   $$
   dp[i] = max(dp[i], dp[i - num] + num)
   $$
   其中 `num` 为当前物品价值，同时也是物品的重量。如果 `dp[target] == target` 那么可以分割，否则不能。

3. [力扣 1049.最后一块石头的重量Ⅱ](https://leetcode.cn/problems/last-stone-weight-ii/description/)，容量为`i`的背包尽量装，最多能装多少

   该问题是求在给定的石头数组中，每次可以选择任意两块石头，将它们同时粉碎，求所有石头都粉碎后，剩下的一块石头的重量，题可以将石头分为两个集合，数组和为`sum`，背包容量为`target = sum / 2`（向下取整，另外一个集合肯定比这个集合大）。这可以通过动态规划解决。设`dp[i]`表示容量为`i`的背包能组成的最大价值，`dp[0]`的最大价值为0，则状态转移方程为：
   $$
   dp[i] = max(dp[i], dp[i - stone] + stone)
   $$
   其中 `stone` 为当前石头价值，同时也是石头的重量，`dp[target]`是其中一个集合，求差值就是结果`(sum - dp[target]) - dp[target]`

4. [力扣 494.目标和](https://leetcode.cn/problems/target-sum/description/)，容量为`i`的背包装满有几种方法

   该问题是求给定一个整数数组`nums`和一个目标数`target`，求有多少种方法使得数组中某些数的和等于目标数，根据题意可以分为一个正数集合与一个负数集合，设数组和为`sum`，负数集合为`neg`，正数集合为`sum - neg`，则有如下公式：
   $$
   (sum - neg) - neg = target
   $$
   $$
   sum - 2neg = target
   $$

   $$
   neg = (sum - target) / 2
   $$

   通过上面公式可以得到背包容量`neg`，要求`neg`必须是非负偶数，因为要求数量和，设`dp[i]`表示容量为`i`时有几种方法能装满背包，`dp[0]`有一种方法，所以状态转移方程为：
   $$
   dp[i] += dp[i - num]
   $$
   其中 `num` 为当前物品价值，同时也是物品的重量。最终结果为 `dp[target]`。

5. [力扣 474.一和零](https://leetcode.cn/problems/ones-and-zeroes/)，容量为`i`的背包装满有多少物品

   该问题是求给定一个由0和1组成的字符串数组，求在给定的0和1的容量限制下，最多可以装多少个字符串。字符串数组每一项都是一个物品，其0、1的数量就是对应价值与重量，背包有两个维度，设`dp[j][k]`表示`0`容量为`j`，`1`容量为`k`的时候能装的物品数量，状态转移方程为：
   $$
   dp[j][k] = max(dp[j][k], dp[j - zero][k - one] + 1)
   $$
   其中 `zero` 和 `one` 分别为每个字符串中0和1的价值与重量。最终结果为 `dp[m][n]`，`m` 和 `n` 分别为0和1的容量限制。
