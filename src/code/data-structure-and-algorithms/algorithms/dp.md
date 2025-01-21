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

##### 核心思想

这个模型的核心思想是：在一个问题中，我们通过**从左到右**逐一遍历每个可选项，并对于每个项进行两种尝试：**使用该项**和**不使用该项**。这种思想通常用于一些**决策问题**，其中每个选择都会对最终结果产生影响。

具体来说，**从左往右**的遍历方式要求我们对于每个选项都尝试两种选择：选择当前项或跳过当前项（即不选该项）。这种方法通过递归或者动态规划的方式来解答问题，最终得到一个最优的解。

##### 常见问题类型

**背包问题**：

- 对于每个物品，考虑是否将该物品放入背包中。如果放入背包，背包的剩余容量减少；如果不放入，则背包容量保持不变。

**子集和问题**：

- 给定一个集合，要求找到该集合的所有子集。每个元素都有两种选择：选或者不选。

**动态规划问题**：

- 对于需要遍历所有选项并进行状态转移的问题，使用从左到右的遍历来逐步构建解决方案。

**字符串处理问题**：

- 比如编辑距离、正则匹配等问题，每个字符的选择会影响后续的结果。

##### 模型解析：背包问题

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

##### 模型解析：子集问题

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

##### 总结

**从左往右的尝试模型**是一种常用于决策型问题的策略，通过遍历每一项并选择是否使用该项来构造解。它通常适用于需要逐一决策的场景，如背包问题、子集问题等。通过递归和动态规划的结合，可以有效解决这类问题，同时优化计算效率，避免不必要的重复计算。

#### L-R范围上的尝试模型

##### 核心思想

- **L和R的作用**：L表示子问题的左端，R表示子问题的右端。在逐步扩展问题的过程中，我们从 L 和 R 的取值范围开始，逐渐填充并计算出最终的解。
- **填表的固定方式**：填表的方式非常固定，通常在 **主对角线** 和 **副对角线** 上做一些特殊处理。
- **状态转移的方式**：一般是通过倒推填表，确保前一个状态的结果能够依赖到当前状态。

##### 动态规划填表的核心步骤

1. **初始化**：首先初始化表格的边界，通常是单一元素的情况（例如区间的长度为1时），或者可以从主对角线和副对角线开始填充。
2. **递推过程**：递推时会根据子问题的结果逐步填充表格，逐步扩大L和R的范围。
3. **最终结果**：填表过程完成后，表格中的某些位置（通常是右上角或左下角）会包含最优解。

##### L-R范围模型的优势

1. **适用范围广**：特别适用于那些问题中需要对区间进行逐步选择和计算的情境。
2. **空间和时间优化**：通过填表优化递归过程，避免了大量的重复计算。很多问题的时间复杂度可以从指数级降低到多项式级。
3. **简洁的状态转移**：状态转移公式通常非常直观，可以通过递推得到每个子问题的解。

##### 常见问题类型

这种模型适用于一些具有“区间”性质的问题，比如：

- **矩阵链乘法**：计算一系列矩阵的最优乘法顺序。
- **最短路径问题**：在一个带权图中寻找从源节点到所有其他节点的最短路径。
- **最长公共子序列**：在两个字符串中找出最长的公共子序列。
- **区间DP问题**：如打折购物、分割问题等。

##### 模型解析：矩阵链乘法问题

矩阵链乘法问题的目标是给定一系列矩阵，计算出最优的矩阵乘法顺序，使得计算所需的标量乘法次数最少。

1. **状态定义**：定义一个二维数组 `dp[i][j]`，表示从矩阵 `i` 到矩阵 `j` 的最小乘法次数。

2. **状态转移**：为了填充 `dp[i][j]`，我们需要选择一个切分点 `k`，将矩阵链 `[i, j]` 分成两部分：`[i, k]` 和 `[k+1, j]`。然后，`dp[i][j]` 就是从 `i` 到 `k` 和从 `k+1` 到 `j` 的最小乘法次数之和，再加上计算这两部分结果的乘法次数。

   假设矩阵 `A[i]` 的维度为 `p[i-1] x p[i]`，那么计算矩阵链 `[i, j]` 的乘法次数就是：
   $$
   dp[i][j] = min(dp[i][j], dp[i][k] + dp[k+1][j] + p[i] * p[k+1] * p[j]);
   $$
   其中，`p[i-1]` 是矩阵 `A[i]` 的行数，`p[k]` 是矩阵 `A[k+1]` 的行数，`p[j]` 是矩阵 `A[j]` 的列数。

3. **填表顺序**：一般从较小的子问题（区间长度为1的子问题）开始逐步向大问题推导。

```java
public static int matrixChainOrder(int[] p) {
    int n = p.length;
    int[][] dp = new int[n][n];

    for (int len = 2; len < n; len++) {
        for (int i = 0; i < n - len; i++) {
            int j = i + len;
            dp[i][j] = Integer.MAX_VALUE;
            for (int k = i; k < j; k++) {
                dp[i][j] = Math.min(dp[i][j], dp[i][k] + dp[k+1][j] + p[i] * p[k+1] * p[j]);
            }
        }
    }

    return dp[0][n-1];
}
```

##### 模型解析：最长公共子序列问题

假设我们有两个字符串 `X` 和 `Y`，目标是找出它们的最长公共子序列。

[力扣 1143. 最长公共子序列](https://leetcode.cn/problems/longest-common-subsequence/description/)

1. **状态定义**：定义 `dp[i][j]` 为字符串 `X[0..i-1]` 和 `Y[0..j-1]` 的最长公共子序列的长度。

2. **状态转移**：如果 `X[i-1] == Y[j-1]`，则：
   $$
   dp[i][j]=dp[i−1][j−1]+1
   $$
   否则：
   $$
   dp[i][j]=max(dp[i−1][j],dp[i][j−1])
   $$

3. **填表顺序**：逐步填充整个表格，从 `(0,0)` 到 `(m,n)`，最终 `dp[m][n]` 为结果。

```java
public static int longestCommonSubsequence(String X, String Y) {
    int m = X.length();
    int n = Y.length();
    int[][] dp = new int[m+1][n+1];

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (X.charAt(i-1) == Y.charAt(j-1)) {
                dp[i][j] = dp[i-1][j-1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
            }
        }
    }

    return dp[m][n];
}
```

###### 复杂度分析

- **时间复杂度**：O(N^2)，其中N为字符串或矩阵的长度。
- **空间复杂度**：O(N^2)，由于我们需要一个二维数组存储状态。

##### 总结

L-R范围上的尝试模型适合于解决区间类问题，核心思想是通过逐步构建子问题的解，从而得到最终的最优解。常见的应用包括矩阵链乘法、最长公共子序列等问题。填表顺序的固定性以及利用子问题解来递推求解，使得这个模型在很多问题中都非常有效。

#### 多样本位置全对应的尝试模型

##### 模型核心

这个模型的核心思想是：给定两个样本数据，分别对应行和列，通过计算它们在每个位置上的对应关系，逐步填充一个二维的表格（动态规划表）。在这个模型中，**行样本**和**列样本**的数据项一一对应，我们根据它们之间的关系逐步计算出最优解。具体来说，这个模型通常应用于**二维动态规划**的问题，其中每个位置的值依赖于行和列样本的对应关系。

##### 常见问题类型

多样本位置全对应的尝试模型通常适用于**多维数据**的匹配问题。常见的应用场景包括：

- **最长公共子序列**（LCS）问题：用于找出两个字符串或数组的最长公共子序列。
- **编辑距离**（Levenshtein Distance）问题：计算将一个字符串转换成另一个字符串的最小操作次数（插入、删除、替换）。
- **二维矩阵匹配问题**：比如计算两个二维矩阵之间的最优匹配或计算距离。

##### 模型解析：最长公共子序列（LCS）问题

假设有两个字符串 `X` 和 `Y`，我们要找出它们的**最长公共子序列**。这个问题可以用多样本位置全对应的尝试模型来解决，具体如下：

1. **状态定义**：
   - 定义一个二维数组 `dp[i][j]`，表示字符串 `X[0..i-1]` 和字符串 `Y[0..j-1]` 的最长公共子序列的长度。
2. **状态转移**：
   - 如果 `X[i-1] == Y[j-1]`，则 `dp[i][j] = dp[i-1][j-1] + 1`，表示当前字符匹配，可以增加一个公共子序列的长度。
   - 如果 `X[i-1] != Y[j-1]`，则 `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`，表示取去掉当前字符后的两个子序列中更长的一个。
3. **填表顺序**：
   - **边界条件**：当 `i == 0` 或 `j == 0` 时，`dp[i][j] = 0`，表示空字符串与任何字符串的公共子序列长度为0。
   - **递推过程**：从 `dp[1][1]` 开始，逐步填充整个表格。

###### 代码实现

```java
public static int longestCommonSubsequence(String X, String Y) {
    int m = X.length();
    int n = Y.length();
    int[][] dp = new int[m + 1][n + 1]; // 用于存储状态

    // 填表
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (X.charAt(i - 1) == Y.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1] + 1; // 字符相同，公共子序列长度加1
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]); // 字符不同，取较长的子序列
            }
        }
    }

    return dp[m][n]; // 返回两个字符串的最长公共子序列的长度
}
```

###### 状态转移过程

1. 边界条件：
   - `dp[i][0] = 0` 和 `dp[0][j] = 0`，因为任何字符串与空字符串的最长公共子序列长度为0。
2. 递推过程：
   - 从 `dp[1][1]` 开始，根据字符是否相等，填充表格。递推的过程中，每次更新 `dp[i][j]`时，都要考虑两个选项：
     1. 如果当前字符相同，则 `dp[i][j] = dp[i-1][j-1] + 1`。
     2. 如果当前字符不同，则 `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`，即取前一个状态。

###### 复杂度分析

- **时间复杂度**：O(m * n)，其中 `m` 和 `n` 分别是两个字符串的长度。我们需要填充一个 `m * n` 的二维数组。
- **空间复杂度**：O(m * n)，因为我们需要一个二维数组来存储每个状态。

##### 模型解析：编辑距离问题（Levenshtein Distance）

编辑距离问题的目标是计算将字符串 `word1` 转换成字符串 `word2` 所需的最小操作次数，操作包括插入、删除和替换。这个问题也可以使用多样本位置全对应的尝试模型来解决。

1. **状态定义**：
   - 定义一个二维数组 `dp[i][j]`，表示将字符串 `word1[0..i]` 转换为字符串 `word2[0..j]` 所需的最小编辑操作数。
2. **状态转移**：
   - 如果 `word1[i-1] == word2[j-1]`，则 `dp[i][j] = dp[i-1][j-1]`，表示不需要任何操作。
   - 如果 `word1[i-1] != word2[j-1]`，则：
     - 插入操作：`dp[i-1][j] + 1`。
     - 删除操作：`dp[i][j-1] + 1`。
     - 替换操作：`dp[i-1][j-1] + 1`。
   - 取三者的最小值。
3. **填表顺序**：
   - **边界条件**：当 `i == 0` 或 `j == 0` 时，`dp[i][j]` 的值就是 `i` 或 `j`，即转换成空字符串所需的操作次数。
   - **递推过程**：从 `dp[1][1]` 开始逐步填充整个表格。

###### 代码实现

```java
public int minDistance(String word1, String word2) {
    int m = word1.length();
    int n = word2.length();

    // 有一个字符串为空串
    if (m * n == 0) {
        return m + n;
    }

    // dp含义字符0..i 编辑成 0..j 需要的最少操作次数
    int[][] dp = new int[m + 1][n + 1];

    // 初始化第一行和第一列
    for (int i = 0; i <= m; i++) {
        dp[i][0] = i; // 从空串到word1的i个字符，需要i次操作（删除）
    }
    for (int j = 0; j <= n; j++) {
        dp[0][j] = j; // 从空串到word2的j个字符，需要j次操作（插入）
    }

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                // 如果 i == j 说明无需操作
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                // 插入
                int p1 = dp[i - 1][j];
                // 删除
                int p2 = dp[i][j - 1];
                // 替换
                int p3 = dp[i - 1][j - 1];
                dp[i][j] = Math.min(p1, Math.min(p2, p3)) + 1;
            }
        }
    }

    return dp[m][n]; // 返回最小编辑距离
}
```

###### 复杂度分析

- **时间复杂度**：O(m * n)，其中 `m` 和 `n` 是字符串的长度。我们填充一个 `m * n` 的二维数组。
- **空间复杂度**：O(m * n)，用于存储动态规划的状态。

##### 总结

多样本位置全对应的尝试模型是解决涉及二维数组或多维数据匹配问题的有效方法。通过构建动态规划表并填充边界和中间部分，我们可以逐步推导出最优解。常见的应用包括**最长公共子序列**和**编辑距离**等问题，它们都符合这种二维状态转移的结构。

#### 寻找业务限制的尝试模型

##### 模型核心

这个模型的核心思想是：当我们在某个问题中遇到有**业务限制**的情境时，通常会有多个可行的操作（或状态转移），但在这些操作中只有某些特定的操作是**可行**的。通过限制条件（如走棋盘、路径的方向限制等），我们可以排除一些不可行的选择，从而优化搜索或状态转移过程。

##### 常见问题类型

寻找业务限制的尝试模型通常适用于**有约束的路径寻找问题**或**有特定方向限制的状态转移问题**。常见的应用场景包括：

- **迷宫问题**：例如在一个迷宫中从起点走到终点，但只能在某些方向上走。
- **棋盘问题**：例如棋盘上的骑士走法、皇后走法等。
- **图的最短路径问题**：在有权图或无权图中，求解从某一点到另一点的最短路径，路径可能会受到方向、障碍物等限制。

##### 模型解析：迷宫问题（或路径问题）

假设有一个二维迷宫，我们从起点 `S` 出发，目标是找到到达终点 `E` 的一条路径。这个问题受到的**业务限制**是：从每个点只能走到相邻的几个方向（上下左右，或者有其他限制）。

1. **状态定义**：
   - 定义一个二维数组 `dp[i][j]`，表示从起点 `S` 到达位置 `(i, j)` 的最短路径长度。
2. **状态转移**：
   - 对于每一个位置 `(i, j)`，我们可以从它的四个相邻位置（上、下、左、右）中选择一个方向走，前提是该位置没有被障碍物阻挡，并且符合业务限制（如边界约束）。
   - `dp[i][j] = min(dp[i-1][j], dp[i][j-1], dp[i+1][j], dp[i][j+1]) + 1`，表示从相邻位置选择一个到达当前格子的最短路径长度。
3. **边界条件**：
   - 起点 `S` 位置的值初始化为0（即起点距离起点是0）。
   - 如果当前位置不可达（被墙壁或障碍物阻挡），则该位置的值为无穷大。
4. **填表顺序**：
   - **边界条件**：首先初始化起点，并且处理边界上的可达位置。
   - **递推过程**：从起点开始，通过递推计算出每个位置的最短路径，遵循边界条件限制。

###### 代码实现

```java
public static int shortestPath(int[][] maze, int[] start, int[] end) {
    int m = maze.length;
    int n = maze[0].length;
    int[][] dp = new int[m][n];
    for (int[] row : dp) {
        Arrays.fill(row, Integer.MAX_VALUE); // 初始化所有位置为不可达
    }
    
    dp[start[0]][start[1]] = 0; // 起点的距离是0
    
    // 方向数组：上、下、左、右
    int[] dx = {-1, 1, 0, 0};
    int[] dy = {0, 0, -1, 1};
    
    // 使用队列进行广度优先搜索（BFS）
    Queue<int[]> queue = new LinkedList<>();
    queue.offer(start);
    
    while (!queue.isEmpty()) {
        int[] current = queue.poll();
        int x = current[0], y = current[1];
        
        // 遍历四个方向
        for (int i = 0; i < 4; i++) {
            int nx = x + dx[i], ny = y + dy[i];
            
            // 判断新位置是否在迷宫范围内，且不是障碍物
            if (nx >= 0 && nx < m && ny >= 0 && ny < n && maze[nx][ny] != 1 && dp[nx][ny] == Integer.MAX_VALUE) {
                dp[nx][ny] = dp[x][y] + 1; // 更新最短路径
                queue.offer(new int[] {nx, ny}); // 加入队列
            }
        }
    }
    
    return dp[end[0]][end[1]] == Integer.MAX_VALUE ? -1 : dp[end[0]][end[1]]; // 如果不可达返回-1
}
```

###### 状态转移过程

1. 边界条件：
   - 起点 `dp[start[0]][start[1]]` 初始化为0，表示从起点出发。
   - 每个不可达位置（如墙壁）初始化为 `Integer.MAX_VALUE`，表示该位置不能到达。
2. 递推过程：
   - 从起点开始，逐步计算到达每个位置的最短路径。每次计算时，从当前位置可以选择四个方向（上、下、左、右）中的一个，但必须遵循**业务限制**：即不走到墙壁或者出界的地方。

###### 复杂度分析

- **时间复杂度**：O(m * n)，其中 `m` 和 `n` 分别是迷宫的行数和列数。每个位置都最多会被访问一次。
- **空间复杂度**：O(m * n)，用于存储动态规划表和队列。

##### 模型解析：棋盘问题（如骑士问题）

假设一个 `8x8` 的棋盘上，我们要求解从某个位置出发的**骑士的最短路径问题**，目标是找到到达目标位置的最短路径。骑士的走法受到业务限制——只能按照 "L" 形的跳跃方式走（上、下、左、右的组合）。

1. **状态定义**：

   - 定义一个二维数组 `dp[i][j]`，表示从起点位置到 `(i, j)` 位置的最短路径长度。

2. **状态转移**：

   - 骑士的跳跃方式有8种，分别为：

     ```scss
     (+2, +1), (+2, -1), (-2, +1), (-2, -1)
     (+1, +2), (+1, -2), (-1, +2), (-1, -2)
     ```

   - 对于每个位置 `(i, j)`，我们可以从它的8个方向中选择一个方向跳跃到下一个位置。

3. **边界条件**：

   - 起点位置的 `dp` 值初始化为0。
   - 如果位置超出棋盘范围，或者被阻挡，则不能跳跃。

4. **填表顺序**：

   - **边界条件**：初始化起点，处理边界上的可达位置。
   - **递推过程**：从起点出发，通过递推计算出每个位置的最短路径。

###### 代码实现

```java
public static int knightShortestPath(int N, int[] start, int[] end) {
    int[][] dp = new int[N][N];
    for (int[] row : dp) {
        Arrays.fill(row, Integer.MAX_VALUE);
    }

    dp[start[0]][start[1]] = 0;

    int[] dx = {2, 2, -2, -2, 1, 1, -1, -1};
    int[] dy = {1, -1, 1, -1, 2, -2, 2, -2};

    Queue<int[]> queue = new LinkedList<>();
    queue.offer(start);

    while (!queue.isEmpty()) {
        int[] current = queue.poll();
        int x = current[0], y = current[1];

        for (int i = 0; i < 8; i++) {
            int nx = x + dx[i], ny = y + dy[i];

            if (nx >= 0 && nx < N && ny >= 0 && ny < N && dp[nx][ny] == Integer.MAX_VALUE) {
                dp[nx][ny] = dp[x][y] + 1;
                queue.offer(new int[] {nx, ny});
            }
        }
    }

    return dp[end[0]][end[1]] == Integer.MAX_VALUE ? -1 : dp[end[0]][end[1]];
}
```

###### 复杂度分析

- **时间复杂度**：O(N^2)，每个位置会被访问一次，因此时间复杂度是棋盘大小的平方。
- **空间复杂度**：O(N^2)，用于存储棋盘上的状态信息。

##### 总结

**寻找业务限制的尝试模型**适用于那些在状态转移或路径选择中有特定约束的问题。通过合理设置**边界条件**、**限制方向**和**可行操作**，我们可以优化计算过程，避免无效的状态转移。常见的应用场景包括**迷宫路径问题**、**棋盘问题**、**图的最短路径问题**等。

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

## 子序列问题

### 最长递增子序列

[力扣 300. 最长递增子序列](https://leetcode.cn/problems/longest-increasing-subsequence/)

给你一个整数数组 `nums` ，找到其中最长严格递增子序列的长度。

**子序列** 是由数组派生而来的序列，删除（或不删除）数组中的元素而不改变其余元素的顺序。例如，`[3,6,2,7]` 是数组 `[0,3,1,6,2,2,7]` 的子序列。

```java
class Solution {
    public int lengthOfLIS(int[] nums) {
        int n = nums.length;
        // 最小长度为1
        int ans = 1;
        // dp[i] 以i结尾的最长的递增子序列长度
        int[] dp = new int[n];
        dp[0] = 1;

        // dp记住之前每个数的最长递增子序列，当前的数i跟0..i-1(j)进行比较，如果>j说明可以组成递增序列，找到最大的进行更新
        for (int i = 1; i < n; i++) {
            int max = 0;
            for (int j = 0; j < i; j++) {
                if (nums[i] > nums[j]) {
                    max = Math.max(max, dp[j]);
                }
            }
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
        int n = nums.length;
        int ans = 1;
        int[] dp = new int[n];
        dp[0] = 1;
        // i > i - 1, 说明是连续递增的
        for(int i = 1; i < n; i++) {
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

## 树形DP套路

1. 以某个节点X为头节点的子树中，分析答案有哪些可能性，并且这种分析是以X的左子树、X的右子树和X整棵树的角度来考虑可能性的
2. 根据第一步的可能性分析，列出所有需要的信息
3. 合并第二步的信息，对左树和右树提出同样的要求，并写出信息结构
4. 设计递归函数，递归函数是处理以X为头节点的情况下的答案。
   包括设计递归的basecase，默认直接得到左树和右树的所有信息，以及把可能性做整合，并且要返回第三步的信息结构这四个小步骤

一般都要用到查表
