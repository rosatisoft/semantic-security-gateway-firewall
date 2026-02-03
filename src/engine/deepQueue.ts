// src/engine/deepQueue.ts

type Task<T> = () => Promise<T>;

const MAX_CONCURRENT = Number(process.env.DEEP_MAX_CONCURRENT || 2);
const MAX_QUEUE = Number(process.env.DEEP_MAX_QUEUE || 50);

let active = 0;
const queue: {
  task: Task<any>;
  resolve: (v: any) => void;
  reject: (e: any) => void;
}[] = [];

function next() {
  if (active >= MAX_CONCURRENT) return;
  if (queue.length === 0) return;

  const item = queue.shift();
  if (!item) return;

  active++;

  item.task()
    .then(item.resolve)
    .catch(item.reject)
    .finally(() => {
      active--;
      next();
    });
}

export function enqueueDeep<T>(task: Task<T>): Promise<T> {
  if (queue.length >= MAX_QUEUE) {
    return Promise.reject(new Error("Deep queue full"));
  }

  return new Promise((resolve, reject) => {
    queue.push({ task, resolve, reject });
    next();
  });
}

export function deepQueueStats() {
  return {
    active,
    queued: queue.length,
    max_concurrent: MAX_CONCURRENT,
    max_queue: MAX_QUEUE,
  };
}
