---
order: 2
title: '从左往右的尝试模型'
date: 2021-01-07
category: 算法
tag: 算法
timeline: true
article: true
---

# 从左往右的尝试模型

## 核心思想

这个模型的核心思想是：在一个问题中，我们通过**从左到右**逐一遍历每个可选项，并对于每个项进行两种尝试：**使用该项**和**不使用该项**。这种思想通常用于一些**决策问题**，其中每个选择都会对最终结果产生影响。

具体来说，**从左往右**的遍历方式要求我们对于每个选项都尝试两种选择：选择当前项或跳过当前项（即不选该项）。这种方法通过递归或者动态规划的方式来解答问题，最终得到一个最优的解。

## 常见问题类型

**背包问题**：

- 对于每个物品，考虑是否将该物品放入背包中。如果放入背包，背包的剩余容量减少；如果不放入，则背包容量保持不变。

**子集和问题**：

- 给定一个集合，要求找到该集合的所有子集。每个元素都有两种选择：选或者不选。

**动态规划问题**：

- 对于需要遍历所有选项并进行状态转移的问题，使用从左到右的遍历来逐步构建解决方案。

**字符串处理问题**：

- 比如编辑距离、正则匹配等问题，每个字符的选择会影响后续的结果。

## 模型解析：背包问题

**题目描述**：在背包问题中，给定多个物品，每个物品有一个重量和价值，目标是选择一部分物品放入背包，使得背包的总价值最大且不超过背包容量。通过**从左到右**的方式，遍历每个物品，尝试将其放入背包或不放入背包。

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

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250104164254125.png)

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

## 模型解析：子集问题

**题目描述**：给定一个集合，求其所有子集。每个元素都有两种选择：选或者不选。

[力扣 78.子集](https://leetcode.cn/submissions/detail/591325840/)
[力扣 90.子集Ⅱ](https://leetcode.cn/submissions/detail/591396340/)

1. 递归和回溯（基础解法）

   首先，我们通过递归来求解所有的子集。在每一层递归中，选择一个元素并决定是否将其添加到当前的子集，最终生成所有的子集。
   
   ```java
   import java.util.*;
   
   public class Subsets {
       
       public static void main(String[] args) {
           int[] nums = {1, 2, 3};
           List<List<Integer>> result = new ArrayList<>();
           subsets(nums, 0, new ArrayList<>(), result);
           System.out.println(result);
       }
   
       // 递归函数，index表示当前处理的位置
       public static void subsets(int[] nums, int index, List<Integer> current, List<List<Integer>> result) {
           // 到达末尾，记录当前子集
           if (index == nums.length) {
               result.add(new ArrayList<>(current));
               return;
           }
   
           // 不选当前元素
           subsets(nums, index + 1, current, result);
           
           // 选当前元素
           current.add(nums[index]);
           subsets(nums, index + 1, current, result);
           current.remove(current.size() - 1); // 回溯
       }
   }
   ```
   
   **复杂度分析**：
   
   - **时间复杂度**：O(2^N^)，其中N是元素个数。每添加一个元素时，都需要将其与当前的所有子集进行组合，最终生成2^N^个子集。
   - **空间复杂度**：O(2^N^)，用于存储所有的子集。

2. 动态规划优化（状态转移）

   我们可以通过动态规划来优化子集生成问题。动态规划的思路是：从空集合开始，每次加入一个元素，逐步生成所有的子集。具体来说，若已经生成了`[subsets]`集合中的一些子集，那么加入一个新的元素`x`后，新的子集是通过将`x`添加到`[subsets]`中的每一个已有子集生成的。

   ```java
   import java.util.*;
   
   public class Subsets {
       
       public static void main(String[] args) {
           int[] nums = {1, 2, 3};
           List<List<Integer>> result = subsets(nums);
           System.out.println(result);
       }
   
       // 动态规划方法
       public static List<List<Integer>> subsets(int[] nums) {
           List<List<Integer>> result = new ArrayList<>();
           result.add(new ArrayList<>()); // 初始化空子集
           
           for (int num : nums) {
               int n = result.size();
               // 遍历现有的子集，并将num加入到这些子集中的每一个
               for (int i = 0; i < n; i++) {
                   List<Integer> newSubset = new ArrayList<>(result.get(i));
                   newSubset.add(num);
                   result.add(newSubset);
               }
           }
           
           return result;
       }
   }
   ```

   **复杂度分析**：

   - **时间复杂度**：O(2^N)，其中N是元素个数。每添加一个元素时，都需要将其与当前的所有子集进行组合，最终生成2^N个子集。
   - **空间复杂度**：O(2^N)，用于存储所有的子集。

3. 位运算优化（更高效的方式）

   位运算提供了一种非常简洁且高效的方式来生成所有子集。对于一个包含N个元素的集合，每个元素可以被选择或者不选择，对应一个二进制的位数。例如，一个3元素的集合 `{1, 2, 3}` 可以用一个3位的二进制数表示每个子集：

   - 000 -> 空子集 `[]`
   - 001 -> `{3}`
   - 010 -> `{2}`
   - 011 -> `{2, 3}`
   - 100 -> `{1}`
   - 101 -> `{1, 3}`
   - 110 -> `{1, 2}`
   - 111 -> `{1, 2, 3}`

   因此，我们可以通过遍历从0到2^N^-1的所有整数，每个整数的二进制表示就对应了一个子集。

   ```java
   import java.util.*;
   
   public class Subsets {
       
       public static void main(String[] args) {
           int[] nums = {1, 2, 3};
           List<List<Integer>> result = subsets(nums);
           System.out.println(result);
       }
   
       // 位运算方法
       public static List<List<Integer>> subsets(int[] nums) {
           List<List<Integer>> result = new ArrayList<>();
           int n = nums.length;
           int totalSubsets = 1 << n;  // 2^n 个子集
           
           for (int i = 0; i < totalSubsets; i++) {
               List<Integer> subset = new ArrayList<>();
               for (int j = 0; j < n; j++) {
                   // 如果第j位是1，说明选择了nums[j]
                   if ((i & (1 << j)) != 0) {
                       subset.add(nums[j]);
                   }
               }
               result.add(subset);
           }
           
           return result;
       }
   }
   
   ```

   **复杂度分析**：

   - **时间复杂度**：O(2^N^ * N)，其中N是元素个数。我们需要遍历2^N^个子集，对于每个子集需要遍历N个元素来检查其是否包含在子集中。
   - **空间复杂度**：O(2^N^)，存储所有的子集。

4. 总结

   - **递归/回溯**：基础的解法，直观易懂，但可能会导致大量重复计算，时间复杂度较高。
   - **动态规划**：通过逐步构建子集集合，避免重复计算，适用于大多数情况。
   - **位运算**：最为高效，利用二进制的位表示来生成子集，简洁且高效，但需要一定的位运算知识。

## 总结

**从左往右的尝试模型**是一种常用于决策型问题的策略，通过遍历每一项并选择是否使用该项来构造解。它通常适用于需要逐一决策的场景，如背包问题、子集问题等。通过递归和动态规划的结合，可以有效解决这类问题，同时优化计算效率，避免不必要的重复计算。
