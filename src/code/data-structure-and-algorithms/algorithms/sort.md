---
order: 3
title: 排序算法
date: 2021-01-02
category: 算法
tag: 算法
timeline: true
article: true
---

# 排序算法

排序算法的稳定性及其汇总

同样值的个体之间，如果不因为排序而改变相对次序，就是这个排序是有稳定性的；否则就没有。

不具备稳定性的排序:

- 选择排序
- 快速排序
- 堆排序

具备稳定性的排序:

- 冒泡排序
- 插入排序
- 归并排序
- 一切桶排序思想下的排序

目前没有找到时间复杂度O(N*logN)，额外空间复杂度0(1)，又稳定的排序。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images//image-20220518161318801.png)

`基于比较的排序`

## 冒泡排序

每一个数之间都进行比较，遇到比自己小的数就交换位置

```java
private static void bubbleSort(int[] arr) {
    for (int i = 0; i < arr.length - 1; i++) {
        for (int j = i + 1; j < arr.length; j++) {
            if (arr[i] > arr[j]) {
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
    }
}
```

## 选择排序

数组第一位先跟后面的元素，进行比较，选出最小的那一个数放在第一位

此时第一位数为最小数，然后用第二位数比较后面的数，一直比较到最后一位，数组排序完成

```java
private static void selectionSort(int[] arr){
    for (int i = 0; i < arr.length - 1; i++) {
        int minIndex = i;
        for (int j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        if (minIndex != i) {
            int temp = arr[i];
            arr[i] = arr[minIndex];
            arr[minIndex] = temp;
        }
    }
}
```

## 插入排序

适用于基本有序的序列

**步骤：**

将第一待排序序列第一个元素看做一个有序序列，把第二个元素到最后一个元素当成是未排序序列。

从头到尾依次扫描未排序序列，将扫描到的每个元素插入有序序列的适当位置。（如果待插入的元素与有序序列中的某个元素相等，则将待插入元素插入到相等元素的后面。）

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/insertionSort.gif)

**Java实现代码：**

```java
private static void insertionSort(int[] arr){
    for (int i = 1; i < arr.length; i++) {
        for (int j = i - 1; j >= 0 && arr[j] > arr[j + 1]; j--) {
            arr[j] ^= arr[j + 1];
            arr[j + 1] ^= arr[j];
            arr[j] ^= arr[j + 1];
        }
    }
}
```

## 快速排序

快速排序是由东尼·霍尔所发展的一种排序算法。在平均状况下，排序 n 个项目要 Ο(nlogn) 次比较。在最坏状况下则需要 Ο(n2) 次比较，但这种状况并不常见。事实上，快速排序通常明显比其他 Ο(nlogn) 算法更快，因为它的内部循环（inner loop）可以在大部分的架构上很有效率地被实现出来。

快速排序使用分治法（Divide and conquer）策略来把一个串行（list）分为两个子串行（sub-lists）。

快速排序又是一种分而治之思想在排序算法上的典型应用。本质上来看，快速排序应该算是在冒泡排序基础上的递归分治法。

快速排序的名字起的是简单粗暴，因为一听到这个名字你就知道它存在的意义，就是快，而且效率高！它是处理大数据最快的排序算法之一了

> 快速排序的最坏运行情况是 O(n²)，比如说顺序数列的快排。但它的平摊期望时间是 O(nlogn)，且 O(nlogn) 记号中隐含的常数因子很小，比复杂度稳定等于 O(nlogn) 的归并排序要小很多。所以，对绝大多数顺序性较弱的随机数列而言，快速排序总是优于归并排序。

空间复杂度最差：o(n)

空间复杂度最好：o(logn) 

### 算法步骤

1. 从数列中挑出一个元素，称为 "基准"（pivot）;
2. 将大于Pivot的数字放在Pivot的右边
3. 将小于Pivot的数字放在Pivot的左边
4. 分别对左右子序列重复前三步操作

> 代码

```java
private void quickSort(int[] arr, int l, int r){
    if(l >= r) return;
    int left = l, right = r;
    // 选取一个pivot
    int pivot = arr[left];
    while(left < right){
        // 因为pivot选取的是下标0的位置，所有从right开始处理
        while(left < right && arr[right] >= pivot){
            right--;
        }
        if(left < right){
            arr[left] = arr[right];
        }
        while(left < right && arr[left] < pivot){
            left++;
        }
        if(left < right){
            arr[right] = arr[left];
        }
    }
    // 如果left >= right说明两边的数字已经排好序
    arr[left] = pivot;
    // 分别在处理左右子序列
    quickSort(arr, l, left - 1);
    quickSort(arr, left + 1, r);
}
```

### 三路快排

上面的排序在leetcode会超时，下面介绍一种基于快速排序的改进版本，结合了随机选择pivot和三路partitioning的思想

1. 随机选择pivot：在每次递归调用中，通过随机选择数组中的一个元素作为pivot，可以避免在特定情况下（如数组已经有序）快速排序的最坏情况发生，从而提高了算法的性能。
2. 三路partitioning：传统的快速排序使用单一的pivot将数组分为两部分，小于pivot的和大于pivot的。但在面对大量重复元素的情况下，这样的分割容易导致递归深度过深，影响性能。三路partitioning将数组分为三部分：小于、等于和大于pivot的元素，使得重复元素分布在中间部分，减少了比较和交换的次数，提高了性能。

算法的步骤如下：

- 在数组中随机选择一个元素作为pivot。
- 使用三路partitioning将数组分为小于、等于和大于pivot的三部分。
- 递归地对小于和大于pivot的两部分进行快速排序。
- 由于等于pivot的部分已经有序，无需再次排序。

通过随机选择pivot和三路partitioning，这个排序算法在处理大规模数据和包含大量重复元素的数组时都能够有很好的性能表现。

```java
private static void quickSort(int[] arr) {
    if (arr == null || arr.length < 2) {
        return;
    }
    quickSort(arr, 0, arr.length - 1);
}

private static void quickSort(int[] arr, int l, int r) {
    if (l < r) {
        swap(arr, l + (int) (Math.random() * (r - l + 1)), r);
        int[] p = partition(arr, l, r);
        quickSort(arr, l, p[0] - 1);
        quickSort(arr, p[1] + 1, r);
    }
}

private static int[] partition(int[] arr, int l, int r) {
    int less = l - 1;
    int more = r;
    while (l < more) {
        if (arr[l] < arr[r]) {
            swap(arr, ++less, l++);
        } else if (arr[l] > arr[r]) {
            swap(arr, --more, l);
        } else {
            l++;
        }
    }
    swap(arr, more, r);
    return new int[]{less + 1, more};
}

public static void swap(int[] arr, int i, int j) {
    int temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}
```

## 归并排序

思路：

整体就是一个简单递归，先找到原来数组的中间数，然后分为左右两边进行排序，在创建一个空数组，长度等于原来的数组，左右两个数组进行比较，依次排入新的数组中

时间复杂度：O(NlogN)，可以用master公式求

空间复杂度：O(N)

```java
public static void mergeSort(int[] arr) {
    if (arr == null || arr.length < 2) return;
    process(arr, 0, arr.length - 1);
}

private static void process(int[] arr, int l, int r) {
    if (l == r) return;
    int mid = l + ((r - l) >> 1);
    process(arr, l, mid);
    process(arr, mid + 1, r);
    merge(arr, l, mid, r);
}

private static void merge(int[] arr, int l, int mid, int r) {
    int[] help = new int[r - l + 1];
    int p1 = l;
    int p2 = mid + 1;
    int i = 0;
    while (p1 <= mid && p2 <= r) {
        help[i++] = arr[p1] <= arr[p2] ? arr[p1++] : arr[p2++];
    }
    while (p1 <= mid) {
        help[i++] = arr[p1++];
    }
    while (p2 <= r) {
        help[i++] = arr[p2++];
    }
    for (i = 0; i < help.length; i++) {
        arr[l + i] = help[i];
    }
}
```

## 堆排序

堆排序（Heapsort）是指利用堆这种数据结构所设计的一种排序算法。堆积是一个近似完全二叉树的结构，并同时满足堆积的性质：即子结点的键值或索引总是小于（或者大于）它的父节点。堆排序可以说是一种利用堆的概念来排序的选择排序。分为两种方法：

1. 大顶堆：每个节点的值都大于或等于其子节点的值，在堆排序算法中用于升序排列；
2. 小顶堆：每个节点的值都小于或等于其子节点的值，在堆排序算法中用于降序排列；

堆排序的平均时间复杂度为 Ο(nlogn)。

### 1. 算法步骤

1. 创建一个堆 H[0……n-1]；
2. 把堆首（最大值）和堆尾互换；
3. 把堆的尺寸缩小 1，并调用 shift_down(0)，目的是把新的数组顶端数据调整到相应位置；
4. 重复步骤 2，直到堆的尺寸为 1。

### 2. 动图演示

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/heapSort.gif) 

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/Sorting_heapsort_anim.gif) 

```java
private static void heapSort(int[] arr) {
    if (arr == null || arr.length < 2) return;
    
    // 把数组变为大根堆,数是一个个给的
    //for (int i = 0; i < arr.length; i++) {
    //    heapInsert(arr, i);
    //}

    // 把数组变为大根堆,数是直接给的一个数组
    for (int i = arr.length - 1; i >= 0; i--) {
        heapify(arr, i, arr.length);
    }
    
    int heapSize = arr.length;
    swap(arr, 0, --heapSize);
    while (heapSize > 0) {
        heapify(arr, 0, heapSize);
        swap(arr, 0, --heapSize);
    }
}

// 某个数index是否比它的父节点的数小，如果比父节点的数大，跟父节点交换位置
private static void heapInsert(int[] arr, int index) {
    while (arr[index] > arr[(index - 1) / 2]) {
        swap(arr, index, (index - 1) / 2);
        index = (index - 1) / 2;
    }
}

// 某个数在index位置，能否往下移动(是否比子节点的数大)
private static void heapify(int[] arr, int index, int heapSize) {
    // 左子节点
    int left = index * 2 + 1;
    while (left < heapSize) {
        // 比较左子节点跟右子节点，比较大的数等下跟父节点进行比较，先判断右子节点是否有越界
        int largest = left + 1 < heapSize && arr[left + 1] > arr[left] ? left + 1 : left;
        largest = arr[largest] > arr[index] ? largest : index;
        if (largest == index) {
            break;
        }
        swap(arr, largest, index);
        index = largest;
        left = index * 2 + 1;
    }
}

private static void swap(int[] arr, int i, int j) {
    int temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}
```

`不基于比较的排序`
根据数据状况做的排序，应用场景局限，但是不基于比较的排序会比较快

## 基数排序

适用于序列的均值均在0~9之间

​		基数排序的发明可以追溯到1887年赫尔曼·何乐礼在打孔卡片制表机(Tabulation Machine)上的贡献。它是这样实现的：将所有待比较数值（正整数）统一为同样的数位长度，数位较短的数前面补零。然后，从最低位开始，依次进行一次排序。这样从最低位排序一直到最高位排序完成以后, 数列就变成一个有序序列。

​		基数排序的方式可以采用LSD（Least significant digital）或MSD（Most significant digital），LSD的排序方式由键值的最右边开始，而MSD则相反，由键值的最左边开始。

```java
private static void radixSort(int[] arr) {
    if (arr == null || arr.length < 2) return;
    radixSort(arr, 0, arr.length - 1, maxBits(arr, 0, arr.length - 1));
}

// 获取排序区间最大的数的位数
private static int maxBits(int[] arr, int l, int r) {
    int max = Integer.MIN_VALUE;
    for (int i = l; i < r; i++) {
        max = Math.max(max, arr[i]);
    }
    int res = 0;
    while (max != 0) {
        res++;
        max /= 10;
    }
    return res;
}

private static void radixSort(int[] arr, int l, int r, int digit) {
    // 10进制
    final int radix = 10;
    int i, j;
    // 有多少个数准备多少个空间
    int[] bucket = new int[r - l + 1];
    // 最大有几位就进出几次
    for (int d = 1; d <= digit; d++) {
        // 10个空间
        // count[0] 当前位(d位)是e的数字有多少个
        // count[1] 当前位(d位)是(0和1)的数字有多少个
        // count[2] 当前位(d位)是(0、1和2)的数字有多少个count[i]当前位(d位)是(0~i)的数字有多少个
        int[] count = new int[radix];
        // 计算d位0-9的数字有几个
        for (i = l; i <= r; i++) {
            j = getDigit(arr[i], d);
            count[j]++;
        }
        // 计算1-9 d位<=自己的数有几个
        for (i = 1; i < radix; i++) {
            count[i] = count[i] + count[i - 1];
        }
        // 将arr数组按count个数放入bucket中
        for (i = r; i >= l; i--) {
            j = getDigit(arr[i], d);
            // 将arr[i] 放入bucket对应位置
            bucket[count[j] - 1] = arr[i];
            count[j]--;
        }
        // 将bucket排好数字重新放入数组中
        for (i = l, j = 0; i <= r; i++, j++) {
            arr[i] = bucket[i];
        }
    }
}

/**
* 计算数字x d位的数字
*
* @param x 需要计算的数字
* @param d 第几位
* @return 该位的数字
*/
private static int getDigit(int x, int d) {
    return Math.abs(((x / ((int) Math.pow(10, d - 1))) % 10));
}
```
