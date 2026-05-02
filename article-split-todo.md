---
title: Long Article Split TODO
article: false
index: false
---

# Long Article Split TODO

## Done

- [x] `src/code/ai/agentscope.md` -> `src/code/ai/agentscope/`
- [x] `src/code/java/io.md` -> `src/code/java/io/`
- [x] `src/code/java/jvm.md` -> `src/code/java/jvm/`
- [x] `src/code/java/common-class.md` -> `src/code/java/common-class/`
- [x] `src/code/java/collection.md` -> `src/code/java/collection/`
- [x] `src/code/netty/netty-basic.md` -> `src/code/netty/netty-basic/`
- [x] `src/code/netty/netty-source.md` -> `src/code/netty/netty-source/`
- [x] `src/code/netty/nio-basic.md` -> `src/code/netty/nio-basic/`
- [x] `src/code/spring/mvc/parameter-resolver.md` -> `src/code/spring/mvc/parameter-resolver/`
- [x] `src/code/distributed/elasticsearch/basic.md` -> `src/code/distributed/elasticsearch/basic/`
- [x] `src/code/data-structure-and-algorithms/algorithms/dp.md` -> `src/code/data-structure-and-algorithms/algorithms/dp/`
- [x] `src/code/redis/distributed-lock.md` -> `src/code/redis/distributed-lock/`
- [x] `src/code/java/juc/thread-pool.md` -> `src/code/java/juc/thread-pool/`
- [x] `src/code/java/juc/synchronizer.md` -> `src/code/java/juc/synchronizer/`
- [x] `src/code/java/juc/concurrent-util.md` -> `src/code/java/juc/concurrent-util/`
- [x] `src/code/java/juc/no-lock.md` -> `src/code/java/juc/no-lock/`
- [x] `src/code/java/juc/sync.md` -> `src/code/java/juc/sync/`
- [x] `src/code/java/juc/memory.md` -> `src/code/java/juc/memory/`
- [x] `src/code/java/juc/thread.md` -> `src/code/java/juc/thread/`
- [x] `src/code/java/io/network-programming.md` -> `src/code/java/io/network-programming/`
- [x] `src/code/java/juc/concurrent-util/concurrent-hash-map.md` -> `src/code/java/juc/concurrent-util/concurrent-hash-map/`
- [x] `src/code/java/juc/thread-pool/work-principle.md` -> `src/code/java/juc/thread-pool/work-principle/`
- [x] `src/code/java/juc/synchronizer/re-lock.md` -> `src/code/java/juc/synchronizer/re-lock/`
- [x] `src/code/data-structure-and-algorithms/algorithms/dp/basic-concepts.md` -> `src/code/data-structure-and-algorithms/algorithms/dp/basic-concepts/`
- [x] `src/code/redis/distributed-lock/redisson.md` -> `src/code/redis/distributed-lock/redisson/`
- [x] `src/code/netty/netty-source/02-source-code.md` -> `src/code/netty/netty-source/02-source-code/`
- [x] `src/code/java/juc/no-lock/thread-local.md` -> `src/code/java/juc/no-lock/thread-local/`
- [x] `src/code/java/juc/thread-pool/blocking-queue.md` -> `src/code/java/juc/thread-pool/blocking-queue/`
- [x] `src/code/java/juc/thread-pool/task-scheduling.md` -> `src/code/java/juc/thread-pool/task-scheduling/`
- [x] `src/code/java/juc/concurrent-util/concurrent-hash-map/member-method.md` -> `src/code/java/juc/concurrent-util/concurrent-hash-map/member-method/`

## Split Rules

- Convert the original article path into a directory with the same basename.
- Add a `README.md` directory entry page with `article: false`, `index: false`, `dir.order` matching the original order when available, original intro text, `<!--more-->`, and `<Catalog />`.
- Split each major section into a child Markdown article with `order`, `title`, `date`, and existing taxonomy fields preserved when present.
- Prefer existing second-level headings (`##`) as split points. If a long article only uses `###` beneath one top-level heading, split by those `###` headings and promote heading levels in child files.
- Delete the original aggregate `.md` after the directory replacement is created.
- Run `npm run docs:build` after all splits.
