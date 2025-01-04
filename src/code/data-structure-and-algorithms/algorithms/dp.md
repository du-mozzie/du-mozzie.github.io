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

## 基本概念

动态规划是对暴力递归算法的优化，主要是通过数组记录的方法，优化掉一些重复计算的过程。总结下动态规划的过程：

1. 抽象出一种“试法”，递归解决问题的方法，很重要
2. 找到“试法”中的可变参数，规划成数组表，可变参数一般是0维的，有几个可变参数就是几维的表
3. 找到base case，问题最基础的解，填入数组表中
4. 根据“试法”中的递归过程，和base case已经填到数组表的值，继续填表
5. 根据问题给定的参数，找到数组中对应的位置，就是最终的解

### 面试中设计暴力递归过程的原则

> 暴力递归和动态规划的关系

- 某一个暴力递归，有解的重复调用，就可以把这个暴力递归优化成动态规划
- 任何动态规划问题，都一定对应着某一个有重复过程的暴力递归，但不是所有的暴力递归，都一定对应着动态规划

> 原则

1. 每一个可变参数的类型，一定不要比int类型更加复杂
2. 原则1）可以违反，让类型突破到一维线性结构，那必须是单一可变参
3. 如果发现原则1）被违反，但不违反原则2），只需要做到记忆化搜索即可
4. 可变参数的个数，能少则少
5. 递归函数的可变参数不能是数组类型，一个可变参数就是一维表，两个可变参数就是二维表。

> 如何找到某个问题的动态规划方式？

1. 设计暴力递归：重要原则+4种常见尝试模型！重点！
   - 从左往右的尝试模型
   - 范围上的尝试模型
   - 多样本位置全对应的尝试模型
   - 寻找业务限制的尝试模型
2. 分析有没有重复解：套路解决
3. 用记忆化搜索->用严格表结构实现动态规划：套路解决
4. 看看能否继续优化：套路解决

> 暴力递归到动态规划的套路

1. 你已经有了一个不违反原则的暴力递归，而且的确存在解的重复调用
2. 找到哪些参数的变化会影响返回值，对每一个列出变化范围
3. 参数间的所有的组合数量，意味着表大小
4. 记忆化搜索的方法就是傻缓存，非常容易得到
5. 规定好严格表的大小，分析位置的依赖顺序，然后从基础填写到最终解
6. 对于有枚举行为的决策过程，进一步优化

>   记住求解的方式有两种

1. 自顶向下的备忘录法
2. 自底向上。

在求解问题中,对于每一步决策,列出各种可能的局部解,再依据某种判定条件，舍弃那些肯定不能得到最优解的局部解,在每一步都经过筛选,以每一步都是最优解来保证全局是最优解。

> 如何分析有没有重复解

1. 列出调用过程，可以只列出前几层
2. 有没有重复解，一看便知

> 动态规划的进一步优化

1. 空间压缩
2. 状态化简
3. 四边形不等式
4. 其他优化技巧

滚动数组是DP中的一种编程思想。简单的理解就是让数组滚动起来，每次都使用固定的几个存储空间，来达到压缩，节省存储空间的作用。起到优化空间，主要应用在递推或动态规划中。因为DP题目是一个自底向上的扩展过程，我们常常需要用到的是连续的解，前面的解往往可以舍去。所以用滚动数组优化是很有效的。利用滚动数组的话在N很大的情况下可以达到压缩存储的作用。 

知道了面试中设计暴力递归过程的原则，然后呢？一定要逼自己找到不违反原则情况下的暴力尝试！如果你找到的暴力尝试，不符合原则，马上舍弃！找新的！如果某个题目突破了设计原则，一定极难极难，面试中出现概率低于5%！

> 暴力转成动态规划总结：

1. 暴力递归的return值，dp也要进行赋值。
2. 暴力的递归尝试改成从dp中取值。
3. 递归参数是减，那么dp的for循环就是从小到大，从初始数据先写0也能看出来是从小到大循环
4. 递归返回的参数是min。那么在递归中最上面min = Integer.MaxValue, 就需要给dp数组都赋值为此。而不是继续使用min
5. 写递归方法时，判定停止条件可以是index == nums.length 也可以是index == nums.length - 1，这个停止条件适合那种小人移动问题，比如说一个m*n 数组最短路径，爬楼梯，打家劫舍；其余的都用index == nums.length

**将一个问题拆成几个子问题，分别求解这些子问题，即可推断出大问题的解**

### 常见的4种尝试模型

#### 从左往右的尝试模型

模型核心：遍历每一项尝试用该项，或者不用该项

> 相关题目

##### 背包问题

**题目描述：**有N件物品和一个容量是V的背包。每件物品只能使用一次。第件物品的体积是，价值是W。求解将哪些物品装入背包，可使这些物品的总体积不超过背包容量，且总价值最大。输出最大价值。

1. 递归写法，尝试函数（从左到右）

   index表示从左到右开始一个一个的选择物品，来到的当前位置。 bag表示背包剩余的空间。

   去尝试，按照正常的思维去想，首先来到了index位置，那么就会有两种选择，把index位置的货物放进背包，或者不选此货物。

   递归函数解决将对当前位置index的最佳选择。

   base情况： 当index == 数组长度时，表明越界了，所以会返回0
   ```java
   public static void main(String[] agas) {
       // 伪代码
       int[] weights = {...};
       int[] values = {...};
       int bag = N;
       int maxValue = process(weights, values, 0, bag);
   }
   
   
   // 当前考虑到了index号货物，index...所有的货物可以自由选择
   // 做的选择不能超过背包容量
   // 返回最大价值
   public static int process(int[] weights, int[] values, int index, int bag) {
       // 没有背包可以装了，无效解
       if(bag < 0) return -1;
       // 遍历结束, 
       if(index == weights.length) return 0;
       
       // index 当前物品索引
       // 不要当前的货
       int p1 = process(weights, values, index + 1, bag);
       // 要当前的货
       int p2 = process(weights, values, index + 1, bag - weights[i]);
       // 要当前的货是否有效
       if(next != -1) {
           p2 += values[index];
       }
       // 不要跟要之间选择一个最大的
       return Math.max(p1, p2);
   }
   ```

   **注意此题还需要考虑一个无效解，此无效解的解法是通用的。**

   如果当前货物weight是7，bag剩余承重是6，那么如果选择此物品，会导致背包超重，所以不能去选这个物品。

2. 优化，N维数组

   看看是否有重复递归，如果有用表格优化，递归有几个可变参就创建一个几维的数组

   ![image-20250104164254125](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250104164254125.png)

   背包问题暴力尝试很明显会出现重复递归的问题，这个时候就可以用一个二维数组存储这些信息进行优化

   ```java
   public static void main(String[] agas) {
       // 伪代码
       int[] weights = {...};
       int[] values = {...};
       int bag = N;
       int maxValue = process(weights, values, bag);
   }
   
   
   // 当前考虑到了index号货物，index...所有的货物可以自由选择
   // 做的选择不能超过背包容量
   // 返回最大价值
   public static int process(int[] weights, int[] values, int bag) {
       // N代表物品的数量
       int N = weights.length;
       // 物品0..N，在背包容量bag的情况下的最大价值
       int[][] dp = new int[N + 1][bag + 1];
   
       // 遍历物品
       for(int index = 1; index<= N; index++) {
           // 遍历容量
           for(int j = 0; j <= bag; j++) {
               int p1 = dp[index + 1, bag];
               // 要当前的货
               int p2 = j - weights[index] < 0 ? -1 : dp[index + 1, bag - weights[i]];
               // 要当前的货是否有效
               if(next != -1) {
                   p2 += values[index];
               }
               dp[index][j] = Math.max(p1, p2);
           }
       }
       return dp[N][bag];
   }
   ```

3. 可以打表然后观察依赖关系，会发现当前物品的最大价值依赖：上一个物品的最大价值、上一个物品背包容量减去当前物品重量，可以递推出下面公式，根据公式进行优化二维数组，转换成一维数组
   $$
   dp[i] = max(dp[i], dp[i - w[j]] + v[j])
   $$

   ```java
   public static void main(String[] agas) {
       // 伪代码
       int[] weights = {...};
       int[] values = {...};
       int bag = N;
       int maxValue = process(weights, values, bag);
   }
   
   public static int process(int[] weights, int[] values, int bag) {
       int N = weights.length; // 物品数量
       int[] dp = new int[bag + 1]; // 一维数组，表示容量为j时的最大价值
   
       // 遍历物品
       for (int index = 0; index < N; index++) {
           // 遍历容量（从后往前遍历，确保当前状态只依赖上一层状态）
           for (int j = bag; j >= weights[index]; j--) {
               dp[j] = Math.max(dp[j], dp[j - weights[index]] + values[index]);
           }
       }
   
       return dp[bag];
   }
   
   ```

#### 范围上的尝试模型

#### 多样本位置全对应的尝试模型

#### 寻找业务限制的尝试模型



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
   (sum - neg) - neg = target\\
   sum - 2neg = target\\
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

## 树形DP套路

1. 以某个节点X为头节点的子树中，分析答案有哪些可能性，并且这种分析是以X的左子树、X的右子树和X整棵树的角度来考虑可能性的
2. 根据第一步的可能性分析，列出所有需要的信息
3. 合并第二步的信息，对左树和右树提出同样的要求，并写出信息结构
4. 设计递归函数，递归函数是处理以X为头节点的情况下的答案。
   包括设计递归的basecase，默认直接得到左树和右树的所有信息，以及把可能性做整合，并且要返回第三步的信息结构这四个小步骤

一般都要用到查表
