
let queue: any[] = []
export function queueJob(job: any) {
  if (queue.indexOf(job) === -1) {
    queue.push(job)
    queueFlush() 
  }
}

let isFlushPending = false
function queueFlush() {
  if (!isFlushPending) {
    isFlushPending = true
    Promise.resolve().then(flushJobs)
  }
}

function flushJobs() {
  isFlushPending = false

  // 清空时，保证先刷新父组件，再刷新子组件
  queue.sort((a, b) => a.id - b.id)
  for (let i = 0; i < queue.length; i++) {
    const job = queue[i]
    job()
  }
  queue.length = 0
}