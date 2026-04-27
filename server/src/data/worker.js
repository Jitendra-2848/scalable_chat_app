import { Worker } from "bullmq";
import pool from "../config/db.js";
import { publish } from "../utils/redisClient.js";
import { addRecentMessage } from "../utils/cache.js";
import { sharedRedisConnection } from "./queue.js"; // ✅ Reuse same connection

// ─────────────────────────────────────────────
// MULTI-LANE MESSAGE BUFFER
// ─────────────────────────────────────────────
class MessageBuffer {
  constructor(options = {}) {
    this.maxSize      = options.maxSize      || 500;
    this.flushInterval = options.flushInterval || 50;
    this.maxRetries   = options.maxRetries   || 3;

    // 4 independent processing lanes
    this.lanes = Array.from({ length: 4 }, () => ({
      buffer:            [],
      timer:             null,
      isProcessing:      false,
      processingPromise: null,
    }));

    this.currentLane = 0;

    this.metrics = {
      processed:    0,
      failed:       0,
      retries:      0,
      totalBatches: 0,
      startTime:    Date.now(),
    };
  }

  // ── public ──────────────────────────────────
  push(message) {
    const idx  = this.currentLane;
    this.currentLane = (this.currentLane + 1) % this.lanes.length;

    this.lanes[idx].buffer.push({ ...message, retryCount: 0 });

    if (this.lanes[idx].buffer.length >= this.maxSize) {
      this._scheduleFlush(idx, true);
    } else if (!this.lanes[idx].timer) {
      this._scheduleFlush(idx, false);
    }
  }

  getMetrics() {
    const totalBuffered = this.lanes.reduce((s, l) => s + l.buffer.length, 0);
    const uptime        = (Date.now() - this.metrics.startTime) / 1000;

    return {
      ...this.metrics,
      bufferSize:   totalBuffered,
      activeLanes:  this.lanes.filter((l) => l.isProcessing).length,
      avgBatchSize:
        this.metrics.totalBatches > 0
          ? (this.metrics.processed / this.metrics.totalBatches).toFixed(2)
          : 0,
      throughput: uptime > 0
        ? (this.metrics.processed / uptime).toFixed(2)
        : "0",
    };
  }

  async drain() {
    await Promise.all(this.lanes.map((_, idx) => this._drainLane(idx)));
  }

  // ── private ─────────────────────────────────
  _scheduleFlush(laneIdx, immediate = false) {
    const lane = this.lanes[laneIdx];

    if (lane.timer) clearTimeout(lane.timer);

    lane.timer = setTimeout(
      () => this._flush(laneIdx),
      immediate ? 0 : this.flushInterval
    );
  }

  async _flush(laneIdx) {
    const lane = this.lanes[laneIdx];

    if (lane.isProcessing) return lane.processingPromise;
    if (lane.buffer.length === 0) return;

    lane.isProcessing = true;
    const batch = lane.buffer.splice(0, this.maxSize);

    if (lane.timer) {
      clearTimeout(lane.timer);
      lane.timer = null;
    }

    lane.processingPromise = this._processBatch(batch)
      .then(() => {
        this.metrics.processed    += batch.length;
        this.metrics.totalBatches += 1;
      })
      .catch((err) => {
        console.error(`❌ Lane ${laneIdx} failed:`, err.message);
        this._handleFailedBatch(batch, laneIdx);
      })
      .finally(() => {
        lane.isProcessing      = false;
        lane.processingPromise = null;

        if (lane.buffer.length > 0) {
          this._scheduleFlush(laneIdx, lane.buffer.length >= this.maxSize);
        }
      });

    return lane.processingPromise;
  }

  async _processBatch(batch) {
    // ✅ DB insert + cache + publish truly in parallel
    const [dbResult] = await Promise.allSettled([
      this._bulkInsertDB(batch),
      this._bulkCacheAndPublish(batch),
    ]);

    if (dbResult.status === "rejected") throw dbResult.reason;
  }

  // ── DB ──────────────────────────────────────
  async _bulkInsertDB(batch) {
    if (!batch.length) return;

    // Postgres hard limit: 65 535 parameters → 8 cols × 8191 rows = 65 528
    const MAX_ROWS = 8191;
    const chunks   = [];

    for (let i = 0; i < batch.length; i += MAX_ROWS) {
      chunks.push(batch.slice(i, i + MAX_ROWS));
    }

    // All chunks run in parallel, each with its own pooled client
    await Promise.all(chunks.map((c) => this._insertChunk(c)));
  }

  async _insertChunk(chunk) {
    const values       = [];
    const placeholders = [];

    chunk.forEach((m, i) => {
      const o = i * 8;
      placeholders.push(
        `($${o+1},$${o+2},$${o+3},$${o+4},$${o+5},$${o+6},$${o+7},$${o+8})`
      );
      values.push(
        m.id,
        m.sender_id,
        m.message      || "",
        m.conversation_id,
        m.file         || null,
        m.file_type    || null,
        m.file_name    || null,
        m.created_at
      );
    });

    const sql = `
      INSERT INTO messages
        (id, sender_id, message, conversation_id,
         file_url, file_type, file_name, created_at)
      VALUES ${placeholders.join(",")}
      ON CONFLICT (id) DO NOTHING
    `;

    // ✅ Borrow a client from the pool, release immediately after
    const client = await pool.connect();
    try {
      await client.query(sql, values);
    } finally {
      client.release();
    }
  }

  // ── Cache + Publish ──────────────────────────
  async _bulkCacheAndPublish(batch) {
    // Group by conversation for cache efficiency
    const byConv = new Map();
    for (const msg of batch) {
      if (!byConv.has(msg.conversation_id)) byConv.set(msg.conversation_id, []);
      byConv.get(msg.conversation_id).push(msg);
    }

    const ops = [];

    // Cache: one promise per message, grouped by conv
    for (const [convId, msgs] of byConv) {
      ops.push(
        Promise.all(
          msgs.map((msg) =>
            addRecentMessage(convId, msg).catch((err) =>
              console.error(`Cache error ${msg.id}:`, err.message)
            )
          )
        )
      );
    }

    // Publish: chunks of 50 to avoid Redis pipeline overflow
    const CHUNK = 50;
    for (let i = 0; i < batch.length; i += CHUNK) {
      const slice = batch.slice(i, i + CHUNK);
      ops.push(
        Promise.all(
          slice.map((msg) =>
            publish(msg).catch((err) =>
              console.error(`Publish error ${msg.id}:`, err.message)
            )
          )
        )
      );
    }

    await Promise.allSettled(ops);
  }

  // ── Retry / DLQ ─────────────────────────────
  _handleFailedBatch(batch, laneIdx) {
    const retriable = [];
    const dead      = [];

    for (const msg of batch) {
      msg.retryCount = (msg.retryCount || 0) + 1;
      (msg.retryCount <= this.maxRetries ? retriable : dead).push(msg);
    }

    if (retriable.length) {
      const delay = Math.min(500 * 2 ** retriable[0].retryCount, 15_000);
      setTimeout(() => {
        this.lanes[laneIdx].buffer.unshift(...retriable);
        this.metrics.retries += retriable.length;
        this._scheduleFlush(laneIdx, false);
      }, delay);
    }

    if (dead.length) {
      this.metrics.failed += dead.length;
      console.error(
        `💀 ${dead.length} msgs permanently failed:`,
        dead.map((m) => m.id).slice(0, 5)
      );
    }
  }

  async _drainLane(laneIdx) {
    let iters = 0;
    const lane = this.lanes[laneIdx];

    while ((lane.buffer.length > 0 || lane.isProcessing) && iters < 100) {
      await this._flush(laneIdx);
      await new Promise((r) => setTimeout(r, 100));
      iters++;
    }
  }
}

// ─────────────────────────────────────────────
// BUFFER INSTANCE (one per process)
// ─────────────────────────────────────────────
const messageBuffer = new MessageBuffer({
  maxSize:       500,
  flushInterval: 50,
  maxRetries:    3,
});

// ─────────────────────────────────────────────
// WORKERS
// All workers share ONE Redis connection.
// BullMQ internally duplicates it for its own
// pub/sub needs, so total connections =
//   sharedRedisConnection + BullMQ internals (2)
// = 3 connections total, not N×workers.
// ─────────────────────────────────────────────
const WORKER_COUNT   = parseInt(process.env.WORKER_COUNT        || "4");
const CONCURRENCY    = parseInt(process.env.WORKER_CONCURRENCY  || "50");
const workers        = [];

for (let i = 0; i < WORKER_COUNT; i++) {
  const worker = new Worker(
    "message",
    async (job) => {
      messageBuffer.push(job.data);
    },
    {
      // ✅ KEY FIX: all workers share the same IORedis instance
      // Plain object connection = BullMQ creates NEW connections per worker
      connection:      sharedRedisConnection,
      concurrency:     CONCURRENCY,
      maxStalledCount: 3,
      stalledInterval: 30_000,
      lockDuration:    30_000,
    }
  );

  worker.on("failed", (job, err) =>
    console.error(`❌ Worker-${i} failed:`, job?.id, err.message)
  );

  worker.on("error", (err) => {
    if (!err.message.includes("Connection is closed")) {
      console.error(`❌ Worker-${i} error:`, err.message);
    }
  });

  workers.push(worker);
}

console.log(
  `✅ Workers ready: ${WORKER_COUNT} × ${CONCURRENCY} concurrency` +
  ` = ${WORKER_COUNT * CONCURRENCY} capacity | Redis connections: 3 (shared)`
);

// ─────────────────────────────────────────────
// METRICS  (every 30s)
// ─────────────────────────────────────────────
if (process.env.ENABLE_METRICS !== "false") {
  setInterval(() => {
    const m = messageBuffer.getMetrics();
    console.log("📊 Metrics:", {
      processed:    m.processed,
      failed:       m.failed,
      bufferSize:   m.bufferSize,
      activeLanes:  m.activeLanes,
      avgBatchSize: m.avgBatchSize,
      throughput:   `${m.throughput}/sec`,
    });
  }, 30_000);
}

// ─────────────────────────────────────────────
// GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 ${signal} – shutting down...`);

  const forced = setTimeout(() => {
    console.error("❌ Forced exit");
    process.exit(1);
  }, 30_000);

  try {
    await Promise.all(workers.map((w) => w.pause()));
    console.log("⏸️  Workers paused");

    await messageBuffer.drain();
    console.log("📤 Buffer drained");

    await Promise.all(workers.map((w) => w.close()));
    console.log("🔌 Workers closed");

    await pool.end();
    console.log("💾 DB pool closed");

    clearTimeout(forced);
    console.log("✅ Shutdown complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Shutdown error:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT",  () => gracefulShutdown("SIGINT"));

process.on("uncaughtException",  (err)    => {
  console.error("💥 Uncaught:", err.message);
  gracefulShutdown("uncaughtException");
});
process.on("unhandledRejection", (reason) =>
  console.error("💥 Unhandled rejection:", reason)
);

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────
export { workers, messageBuffer };

export const getHealth = () => ({
  status: "healthy",
  workers: workers.length,
  ...messageBuffer.getMetrics(),
});