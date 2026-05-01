---
order: 3
title: 成员方法
date: 2021-05-13
category: Java
tag: Java
timeline: true
article: true
---

# 成员方法

## 提交方法

-  AbstractExecutorService#submit()：提交任务，**把 Runnable 或 Callable 任务封装成 FutureTask 执行**，可以通过方法返回的任务对象，调用 get 阻塞获取任务执行的结果或者异常，源码分析在笔记的 Future 部分 

```java
public Future\<?\> submit(Runnable task) {
    // 空指针异常
    if (task == null) throw new NullPointerException();
    // 把 Runnable 封装成未来任务对象，执行结果就是 null，也可以通过参数指定 FutureTask#get 返回数据
    RunnableFuture\<Void\> ftask = newTaskFor(task, null);
    // 执行方法
    execute(ftask);
    return ftask;
}
public \<T\> Future\<T\> submit(Callable\<T\> task) {
    if (task == null) throw new NullPointerException();
    // 把 Callable 封装成未来任务对象
    RunnableFuture\<T\> ftask = newTaskFor(task);
    // 执行方法
    execute(ftask);	
    // 返回未来任务对象，用来获取返回值
    return ftask;
}
protected \<T\> RunnableFuture\<T\> newTaskFor(Runnable runnable, T value) {
    // Runnable 封装成 FutureTask，【指定返回值】
    return new FutureTask\<T\>(runnable, value);
}
protected \<T\> RunnableFuture\<T\> newTaskFor(Callable\<T\> callable) {
    // Callable 直接封装成 FutureTask
    return new FutureTask\<T\>(callable);
}
```

-  execute()：执行任务，**但是没有返回值，没办法获取任务执行结果**，出现异常会直接抛出任务执行时的异常。根据线程池中的线程数，选择添加任务时的处理方式 

```java
// command 可以是普通的 Runnable 实现类，也可以是 FutureTask，不能是 Callable
public void execute(Runnable command) {
    // 非空判断
    if (command == null)
        throw new NullPointerException();
  	// 获取 ctl 最新值赋值给 c，ctl 高 3 位表示线程池状态，低位表示当前线程池线程数量。
    int c = ctl.get();
    // 【1】当前线程数量小于核心线程数，此次提交任务直接创建一个新的 worker，线程池中多了一个新的线程
    if (workerCountOf(c) < corePoolSize) {
        // addWorker 为创建线程的过程，会创建 worker 对象并且将 command 作为 firstTask，优先执行
        if (addWorker(command, true))
            return;
        
        // 执行到这条语句，说明 addWorker 一定是失败的，存在并发现象或者线程池状态被改变，重新获取状态
        // SHUTDOWN 状态下也有可能创建成功，前提 firstTask == null 而且当前 queue 不为空（特殊情况）
        c = ctl.get();
    }
    // 【2】执行到这说明当前线程数量已经达到核心线程数量 或者 addWorker 失败
    // 	判断当前线程池是否处于running状态，成立就尝试将 task 放入到 workQueue 中
    if (isRunning(c) && workQueue.offer(command)) {
        int recheck = ctl.get();
        // 条件一成立说明线程池状态被外部线程给修改了，可能是执行了 shutdown() 方法，该状态不能接收新提交的任务
        // 所以要把刚提交的任务删除，删除成功说明提交之后线程池中的线程还未消费（处理）该任务
        if (!isRunning(recheck) && remove(command))
            // 任务出队成功，走拒绝策略
            reject(command);
        // 执行到这说明线程池是 running 状态，获取线程池中的线程数量，判断是否是 0
        // 【担保机制】，保证线程池在 running 状态下，最起码得有一个线程在工作
        else if (workerCountOf(recheck) == 0)
            addWorker(null, false);
    }
    // 【3】offer失败说明queue满了
    // 如果线程数量尚未达到 maximumPoolSize，会创建非核心 worker 线程直接执行 command，【这也是不公平的原因】
    // 如果当前线程数量达到 maximumPoolSiz，这里 addWorker 也会失败，走拒绝策略
    else if (!addWorker(command, false))
        reject(command);
}
```

## 添加线程

-  prestartAllCoreThreads()：**提前预热**，创建所有的核心线程 

```java
public int prestartAllCoreThreads() {
    int n = 0;
    while (addWorker(null, true))
        ++n;
    return n;
}
```

-  addWorker()：**添加线程到线程池**，返回 true 表示创建 Worker 成功，且线程启动。首先判断线程池是否允许添加线程，允许就让线程数量 + 1，然后去创建 Worker 加入线程池
   注意：SHUTDOWN 状态也能添加线程，但是要求新加的 Woker 没有 firstTask，而且当前 queue 不为空，所以创建一个线程来帮助线程池执行队列中的任务 

```java
// core == true 表示采用核心线程数量限制，false 表示采用 maximumPoolSize
private boolean addWorker(Runnable firstTask, boolean core) {
    // 自旋【判断当前线程池状态是否允许创建线程】，允许就设置线程数量 + 1
    retry:
    for (;;) {
        // 获取 ctl 的值
        int c = ctl.get();
        // 获取当前线程池运行状态
        int rs = runStateOf(c);	
        
        // 判断当前线程池状态【是否允许添加线程】
        
        // 当前线程池是 SHUTDOWN 状态，但是队列里面还有任务尚未处理完，需要处理完 queue 中的任务
        // 【不允许再提交新的 task，所以 firstTask 为空，但是可以继续添加 worker】
        if (rs >= SHUTDOWN && !(rs == SHUTDOWN && firstTask == null && !workQueue.isEmpty()))
            return false;
        for (;;) {
            // 获取线程池中线程数量
            int wc = workerCountOf(c);
            // 条件一一般不成立，CAPACITY是5亿多，根据 core 判断使用哪个大小限制线程数量，超过了返回 false
            if (wc >= CAPACITY || wc >= (core ? corePoolSize : maximumPoolSize))
                return false;
            // 记录线程数量已经加 1，类比于申请到了一块令牌，条件失败说明其他线程修改了数量
            if (compareAndIncrementWorkerCount(c))
                // 申请成功，跳出了 retry 这个 for 自旋
                break retry;
            // CAS 失败，没有成功的申请到令牌
            c = ctl.get();
            // 判断当前线程池状态是否发生过变化，被其他线程修改了，可能其他线程调用了 shutdown() 方法
            if (runStateOf(c) != rs)
                // 返回外层循环检查是否能创建线程，在 if 语句中返回 false
                continue retry;
           
        }
    }
    
    //【令牌申请成功，开始创建线程】
    
	// 运行标记，表示创建的 worker 是否已经启动，false未启动  true启动
    boolean workerStarted = false;
    // 添加标记，表示创建的 worker 是否添加到池子中了，默认false未添加，true是添加。
    boolean workerAdded = false;
    Worker w = null;
    try {
        // 【创建 Worker，底层通过线程工厂 newThread 方法创建执行线程，指定了首先执行的任务】
        w = new Worker(firstTask);
        // 将新创建的 worker 节点中的线程赋值给 t
        final Thread t = w.thread;
        // 这里的判断为了防止 程序员自定义的 ThreadFactory 实现类有 bug，创造不出线程
        if (t != null) {
            final ReentrantLock mainLock = this.mainLock;
            // 加互斥锁，要添加 worker 了
            mainLock.lock();
            try {
                // 获取最新线程池运行状态保存到 rs
                int rs = runStateOf(ctl.get());
				// 判断线程池是否为RUNNING状态，不是再【判断当前是否为SHUTDOWN状态且firstTask为空，特殊情况】
                if (rs < SHUTDOWN || (rs == SHUTDOWN && firstTask == null)) {
                    // 当线程start后，线程isAlive会返回true，这里还没开始启动线程，如果被启动了就需要报错
                    if (t.isAlive())
                        throw new IllegalThreadStateException();
                    
                    //【将新建的 Worker 添加到线程池中】
                    workers.add(w);
                    int s = workers.size();
					// 当前池中的线程数量是一个新高，更新 largestPoolSize
                    if (s > largestPoolSize)
                        largestPoolSize = s;
                    // 添加标记置为 true
                    workerAdded = true;
                }
            } finally {
                // 解锁啊
                mainLock.unlock();
            }
            // 添加成功就【启动线程执行任务】
            if (workerAdded) {
                // Thread 类中持有 Runnable 任务对象，调用的是 Runnable 的 run ，也就是 FutureTask
                t.start();
                // 运行标记置为 true
                workerStarted = true;
            }
        }
    } finally {
        // 如果启动线程失败，做清理工作
        if (! workerStarted)
            addWorkerFailed(w);
    }
    // 返回新创建的线程是否启动
    return workerStarted;
}
```

-  addWorkerFailed()：清理任务 

```java
private void addWorkerFailed(Worker w) {
    final ReentrantLock mainLock = this.mainLock;
    // 持有线程池全局锁，因为操作的是线程池相关的东西
    mainLock.lock();
    try {
        //条件成立需要将 worker 在 workers 中清理出去。
        if (w != null)
            workers.remove(w);
        // 将线程池计数 -1，相当于归还令牌。
        decrementWorkerCount();
        // 尝试停止线程池
        tryTerminate();
    } finally {
        //释放线程池全局锁。
        mainLock.unlock();
    }
}
```

## 运行方法

-  Worker#run：Worker 实现了 Runnable 接口，当线程启动时，会调用 Worker 的 run() 方法 

```java
public void run() {
    // ThreadPoolExecutor#runWorker()
    runWorker(this);
}
```

-  runWorker()：线程启动就要**执行任务**，会一直 while 循环获取任务并执行 

```java
final void runWorker(Worker w) {
    Thread wt = Thread.currentThread();	
    // 获取 worker 的 firstTask
    Runnable task = w.firstTask;
    // 引用置空，【防止复用该线程时重复执行该任务】
    w.firstTask = null;
    // 初始化 worker 时设置 state = -1，表示不允许抢占锁
    // 这里需要设置 state = 0 和 exclusiveOwnerThread = null，开始独占模式抢锁
    w.unlock();
    // true 表示发生异常退出，false 表示正常退出。
    boolean completedAbruptly = true;
    try {
        // firstTask 不是 null 就直接运行，否则去 queue 中获取任务
        // 【getTask 如果是阻塞获取任务，会一直阻塞在take方法，直到获取任务，不会走返回null的逻辑】
        while (task != null || (task = getTask()) != null) {
            // worker 加锁，shutdown 时会判断当前 worker 状态，【根据独占锁状态判断是否空闲】
            w.lock();
            
			// 说明线程池状态大于 STOP，目前处于 STOP/TIDYING/TERMINATION，此时给线程一个中断信号
            if ((runStateAtLeast(ctl.get(), STOP) ||
                 // 说明线程处于 RUNNING 或者 SHUTDOWN 状态，清除打断标记
                 (Thread.interrupted() && runStateAtLeast(ctl.get(), STOP))) && !wt.isInterrupted())
                // 中断线程，设置线程的中断标志位为 true
                wt.interrupt();
            try {
                // 钩子方法，【任务执行的前置处理】
                beforeExecute(wt, task);
                Throwable thrown = null;
                try {
                    // 【执行任务】
                    task.run();
                } catch (Exception x) {
                 	//.....
                } finally {
                    // 钩子方法，【任务执行的后置处理】
                    afterExecute(task, thrown);
                }
            } finally {
                task = null;		// 将局部变量task置为null，代表任务执行完成
                w.completedTasks++;	// 更新worker完成任务数量
                w.unlock();			// 解锁
            }
        }
        // getTask()方法返回null时会走到这里，表示queue为空并且线程空闲超过保活时间，【当前线程执行退出逻辑】
        completedAbruptly = false;	
    } finally {
        // 正常退出 completedAbruptly = false
       	// 异常退出 completedAbruptly = true，【从 task.run() 内部抛出异常】时，跳到这一行
        processWorkerExit(w, completedAbruptly);
    }
}
```

-  unlock()：重置锁 

```java
public void unlock() { release(1); }
// 外部不会直接调用这个方法 这个方法是 AQS 内调用的，外部调用 unlock 时触发此方法
protected boolean tryRelease(int unused) {
    setExclusiveOwnerThread(null);		// 设置持有者为 null
    setState(0);						// 设置 state = 0
    return true;
}
```

-  getTask()：获取任务，线程空闲时间超过 keepAliveTime 就会被回收，判断的依据是**当前线程阻塞获取任务超过保活时间**，方法返回 null 就代表当前线程要被回收了，返回到 runWorker 执行线程退出逻辑。线程池具有担保机制，对于 RUNNING 状态下的超时回收，要保证线程池中最少有一个线程运行，或者任务阻塞队列已经是空 

```java
private Runnable getTask() {
    // 超时标记，表示当前线程获取任务是否超时，true 表示已超时
    boolean timedOut = false; 
    for (;;) {
        int c = ctl.get();
        // 获取线程池当前运行状态
        int rs = runStateOf(c);
		
        // 【tryTerminate】打断线程后执行到这，此时线程池状态为STOP或者线程池状态为SHUTDOWN并且队列已经是空
        // 所以下面的 if 条件一定是成立的，可以直接返回 null，线程就应该退出了
        if (rs >= SHUTDOWN && (rs >= STOP || workQueue.isEmpty())) {
            // 使用 CAS 自旋的方式让 ctl 值 -1
            decrementWorkerCount();
            return null;
        }
        
		// 获取线程池中的线程数量
        int wc = workerCountOf(c);

        // 线程没有明确的区分谁是核心或者非核心线程，是根据当前池中的线程数量判断
        
        // timed = false 表示当前这个线程 获取task时不支持超时机制的，当前线程会使用 queue.take() 阻塞获取
        // timed = true 表示当前这个线程 获取task时支持超时机制，使用 queue.poll(xxx,xxx) 超时获取
        // 条件一代表允许回收核心线程，那就无所谓了，全部线程都执行超时回收
        // 条件二成立说明线程数量大于核心线程数，当前线程认为是非核心线程，有保活时间，去超时获取任务
        boolean timed = allowCoreThreadTimeOut || wc > corePoolSize;
        
		// 如果线程数量是否超过最大线程数，直接回收
        // 如果当前线程【允许超时回收并且已经超时了】，就应该被回收了，由于【担保机制】还要做判断：
        // 	  wc > 1 说明线程池还用其他线程，当前线程可以直接回收
        //    workQueue.isEmpty() 前置条件是 wc = 1，【如果当前任务队列也是空了，最后一个线程就可以退出】
        if ((wc > maximumPoolSize || (timed && timedOut)) && (wc > 1 || workQueue.isEmpty())) {
            // 使用 CAS 机制将 ctl 值 -1 ,减 1 成功的线程，返回 null，代表可以退出
            if (compareAndDecrementWorkerCount(c))
                return null;
            continue;
        }

        try {
            // 根据当前线程是否需要超时回收，【选择从队列获取任务的方法】是超时获取或者阻塞获取
            Runnable r = timed ?
                workQueue.poll(keepAliveTime, TimeUnit.NANOSECONDS) : workQueue.take();
            // 获取到任务返回任务，【阻塞获取会阻塞到获取任务为止】，不会返回 null
            if (r != null)
                return r;
            // 获取任务为 null 说明超时了，将超时标记设置为 true，下次自旋时返 null
            timedOut = true;
        } catch (InterruptedException retry) {
            // 阻塞线程被打断后超时标记置为 false，【说明被打断不算超时】，要继续获取，直到超时或者获取到任务
            // 如果线程池 SHUTDOWN 状态下的打断，会在循环获取任务前判断，返回 null
            timedOut = false;
        }
    }
}
```

-  processWorkerExit()：**线程退出线程池**，也有担保机制，保证队列中的任务被执行 

```java
// 正常退出 completedAbruptly = false，异常退出为 true
private void processWorkerExit(Worker w, boolean completedAbruptly) {
    // 条件成立代表当前 worker 是发生异常退出的，task 任务执行过程中向上抛出异常了
    if (completedAbruptly) 
        // 从异常时到这里 ctl 一直没有 -1，需要在这里 -1
        decrementWorkerCount();

    final ReentrantLock mainLock = this.mainLock;
    // 加锁
    mainLock.lock();
    try {
        // 将当前 worker 完成的 task 数量，汇总到线程池的 completedTaskCount
        completedTaskCount += w.completedTasks;
		// 将 worker 从线程池中移除
        workers.remove(w);
    } finally {
        mainLock.unlock();	// 解锁
    }
	// 尝试停止线程池，唤醒下一个线程
    tryTerminate();

    int c = ctl.get();
    // 线程池不是停止状态就应该有线程运行【担保机制】
    if (runStateLessThan(c, STOP)) {
        // 正常退出的逻辑，是对空闲线程回收，不是执行出错
        if (!completedAbruptly) {
            // 根据是否回收核心线程确定【线程池中的线程数量最小值】
            int min = allowCoreThreadTimeOut ? 0 : corePoolSize;
            // 最小值为 0，但是线程队列不为空，需要一个线程来完成任务担保机制
            if (min == 0 && !workQueue.isEmpty())
                min = 1;
            // 线程池中的线程数量大于最小值可以直接返回
            if (workerCountOf(c) >= min)
                return;
        }
        // 执行 task 时发生异常，有个线程因为异常终止了，需要添加
        // 或者线程池中的数量小于最小值，这里要创建一个新 worker 加进线程池
        addWorker(null, false);
    }
}
```

## 停止方法

-  shutdown()：停止线程池 

```java
public void shutdown() {
    final ReentrantLock mainLock = this.mainLock;
    // 获取线程池全局锁
    mainLock.lock();
    try {
        checkShutdownAccess();
        // 设置线程池状态为 SHUTDOWN，如果线程池状态大于 SHUTDOWN，就不会设置直接返回
        advanceRunState(SHUTDOWN);
        // 中断空闲线程
        interruptIdleWorkers();
        // 空方法，子类可以扩展
        onShutdown(); 
    } finally {
        // 释放线程池全局锁
        mainLock.unlock();
    }
    tryTerminate();
}
```

-  interruptIdleWorkers()：shutdown 方法会**中断所有空闲线程**，根据是否可以获取 AQS 独占锁判断是否处于工作状态。线程之所以空闲是因为阻塞队列没有任务，不会中断正在运行的线程，所以 shutdown 方法会让所有的任务执行完毕 

```java
// onlyOne == true 说明只中断一个线程 ，false 则中断所有线程
private void interruptIdleWorkers(boolean onlyOne) {
    final ReentrantLock mainLock = this.mainLock;
    / /持有全局锁
    mainLock.lock();
    try {
        // 遍历所有 worker
        for (Worker w : workers) {
            // 获取当前 worker 的线程
            Thread t = w.thread;
            // 条件一成立：说明当前迭代的这个线程尚未中断
            // 条件二成立：说明【当前worker处于空闲状态】，阻塞在poll或者take，因为worker执行task时是要加锁的
            //           每个worker有一个独占锁，w.tryLock()尝试加锁，加锁成功返回 true
            if (!t.isInterrupted() && w.tryLock()) {
                try {
                    // 中断线程，处于 queue 阻塞的线程会被唤醒，进入下一次自旋，返回 null，执行退出相逻辑
                    t.interrupt();
                } catch (SecurityException ignore) {
                } finally {
                    // 释放worker的独占锁
                    w.unlock();
                }
            }
            // false，代表中断所有的线程
            if (onlyOne)
                break;
        }

    } finally {
        // 释放全局锁
        mainLock.unlock();
    }
}
```

-  shutdownNow()：直接关闭线程池，不会等待任务执行完成 

```java
public List\<Runnable\> shutdownNow() {
    // 返回值引用
    List\<Runnable\> tasks;
    final ReentrantLock mainLock = this.mainLock;
    // 获取线程池全局锁
    mainLock.lock();
    try {
        checkShutdownAccess();
        // 设置线程池状态为STOP
        advanceRunState(STOP);
        // 中断线程池中【所有线程】
        interruptWorkers();
        // 从阻塞队列中导出未处理的task
        tasks = drainQueue();
    } finally {
        mainLock.unlock();
    }

    tryTerminate();
    // 返回当前任务队列中 未处理的任务。
    return tasks;
}
```

-  tryTerminate()：设置为 TERMINATED 状态 if either (SHUTDOWN and pool and queue empty) or (STOP and pool empty) 

```java
final void tryTerminate() {
    for (;;) {
        // 获取 ctl 的值
        int c = ctl.get();
        // 线程池正常，或者有其他线程执行了状态转换的方法，当前线程直接返回
        if (isRunning(c) || runStateAtLeast(c, TIDYING) ||
            // 线程池是 SHUTDOWN 并且任务队列不是空，需要去处理队列中的任务
            (runStateOf(c) == SHUTDOWN && ! workQueue.isEmpty()))
            return;
        
        // 执行到这里说明线程池状态为 STOP 或者线程池状态为 SHUTDOWN 并且队列已经是空
        // 判断线程池中线程的数量
        if (workerCountOf(c) != 0) {
            // 【中断一个空闲线程】，在 queue.take() | queue.poll() 阻塞空闲
            // 唤醒后的线程会在getTask()方法返回null，
            // 执行 processWorkerExit 退出逻辑时会再次调用 tryTerminate() 唤醒下一个空闲线程
            interruptIdleWorkers(ONLY_ONE);
            return;
        }
		// 池中的线程数量为 0 来到这里
        final ReentrantLock mainLock = this.mainLock;
        // 加全局锁
        mainLock.lock();
        try {
            // 设置线程池状态为 TIDYING 状态，线程数量为 0
            if (ctl.compareAndSet(c, ctlOf(TIDYING, 0))) {
                try {
                    // 结束线程池
                    terminated();
                } finally {
                    // 设置线程池状态为TERMINATED状态。
                    ctl.set(ctlOf(TERMINATED, 0));
                    // 【唤醒所有调用 awaitTermination() 方法的线程】
                    termination.signalAll();
                }
                return;
            }
        } finally {
			// 释放线程池全局锁
            mainLock.unlock();
        }
    }
}
```
