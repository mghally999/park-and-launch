/**
 * PARK & LAUNCH - Core Data Structures
 * Optimized data structures for maximum performance across all use cases.
 * 
 * Structures implemented:
 * - LRUCache (HashMap + Doubly Linked List) - O(1) get/put - for parking spot caching
 * - MinHeap (Binary Heap) - O(log n) insert/extract - for delivery scheduling priority
 * - Trie - O(m) search where m=word length - for search autocomplete
 * - GeoHashIndex (HashMap) - O(1) avg - for spatial proximity lookups
 * - CircularBuffer - O(1) - for fixed-size notification queues
 * - SegmentTree - O(log n) - for availability calendar range queries
 */

// ============================================================
// 1. LRU CACHE (Doubly Linked List + HashMap)
//    Use case: Cache frequently accessed parking spots, user sessions
//    Time: O(1) get and put | Space: O(capacity)
// ============================================================
class LRUNode {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
    this.timestamp = Date.now();
  }
}

class LRUCache {
  constructor(capacity = 1000, ttlMs = 300000) {
    this.capacity = capacity;
    this.ttlMs = ttlMs; // 5 minutes default TTL
    this.map = new Map(); // HashMap for O(1) access
    // Sentinel nodes (dummy head/tail) eliminate edge case checks
    this.head = new LRUNode(null, null);
    this.tail = new LRUNode(null, null);
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.size = 0;
  }

  _removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
    this.size--;
  }

  _insertAfterHead(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
    this.size++;
  }

  get(key) {
    if (!this.map.has(key)) return null;
    const node = this.map.get(key);
    // Check TTL
    if (Date.now() - node.timestamp > this.ttlMs) {
      this.delete(key);
      return null;
    }
    // Move to front (most recently used)
    this._removeNode(node);
    this._insertAfterHead(node);
    return node.value;
  }

  put(key, value) {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      node.value = value;
      node.timestamp = Date.now();
      this._removeNode(node);
      this._insertAfterHead(node);
    } else {
      if (this.size >= this.capacity) {
        // Evict least recently used (node before tail)
        const lru = this.tail.prev;
        this._removeNode(lru);
        this.map.delete(lru.key);
      }
      const node = new LRUNode(key, value);
      this._insertAfterHead(node);
      this.map.set(key, node);
    }
  }

  delete(key) {
    if (!this.map.has(key)) return false;
    const node = this.map.get(key);
    this._removeNode(node);
    this.map.delete(key);
    return true;
  }

  invalidatePattern(pattern) {
    // Invalidate all keys matching a pattern (e.g., 'parking:*')
    for (const key of this.map.keys()) {
      if (key.startsWith(pattern)) {
        this.delete(key);
      }
    }
  }

  stats() {
    return { size: this.size, capacity: this.capacity, hitRate: this._hits / (this._hits + this._misses) || 0 };
  }
}

// ============================================================
// 2. MIN-HEAP (Binary Heap)
//    Use case: Delivery scheduling by priority/time, nearest driver dispatch
//    Time: O(log n) insert/extract-min | Space: O(n)
// ============================================================
class MinHeap {
  constructor(comparator = (a, b) => a.priority - b.priority) {
    this.heap = [];
    this.compare = comparator;
  }

  get size() { return this.heap.length; }
  isEmpty() { return this.size === 0; }

  peek() { return this.heap[0] || null; }

  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.size - 1);
  }

  pop() {
    if (this.isEmpty()) return null;
    const min = this.heap[0];
    const last = this.heap.pop();
    if (!this.isEmpty()) {
      this.heap[0] = last;
      this._siftDown(0);
    }
    return min;
  }

  _parent(i) { return Math.floor((i - 1) / 2); }
  _left(i) { return 2 * i + 1; }
  _right(i) { return 2 * i + 2; }

  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = this._parent(i);
      if (this.compare(this.heap[i], this.heap[parent]) < 0) {
        this._swap(i, parent);
        i = parent;
      } else break;
    }
  }

  _siftDown(i) {
    const n = this.size;
    while (true) {
      let smallest = i;
      const l = this._left(i), r = this._right(i);
      if (l < n && this.compare(this.heap[l], this.heap[smallest]) < 0) smallest = l;
      if (r < n && this.compare(this.heap[r], this.heap[smallest]) < 0) smallest = r;
      if (smallest !== i) { this._swap(i, smallest); i = smallest; }
      else break;
    }
  }

  // Find and remove by ID - O(n) but needed for cancellations
  remove(predicate) {
    const idx = this.heap.findIndex(predicate);
    if (idx === -1) return false;
    this.heap[idx] = this.heap[this.size - 1];
    this.heap.pop();
    if (idx < this.size) {
      this._bubbleUp(idx);
      this._siftDown(idx);
    }
    return true;
  }
}

// ============================================================
// 3. TRIE (Prefix Tree)
//    Use case: Search autocomplete for boat parts, locations, marina names
//    Time: O(m) insert/search where m = word length | Space: O(alphabet * m * n)
// ============================================================
class TrieNode {
  constructor() {
    this.children = new Map(); // HashMap for O(1) child access
    this.isEnd = false;
    this.data = null; // Store metadata (id, category, etc.)
    this.frequency = 0; // Track search frequency for ranking
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
    this._count = 0;
  }

  insert(word, data = null) {
    let node = this.root;
    const lower = word.toLowerCase();
    for (const ch of lower) {
      if (!node.children.has(ch)) {
        node.children.set(ch, new TrieNode());
      }
      node = node.children.get(ch);
    }
    if (!node.isEnd) this._count++;
    node.isEnd = true;
    node.data = data;
    node.frequency++;
  }

  search(word) {
    let node = this.root;
    const lower = word.toLowerCase();
    for (const ch of lower) {
      if (!node.children.has(ch)) return null;
      node = node.children.get(ch);
    }
    return node.isEnd ? { data: node.data, frequency: node.frequency } : null;
  }

  // Returns top-k autocomplete suggestions sorted by frequency
  autocomplete(prefix, k = 10) {
    let node = this.root;
    const lower = prefix.toLowerCase();
    for (const ch of lower) {
      if (!node.children.has(ch)) return [];
      node = node.children.get(ch);
    }
    const results = [];
    this._dfs(node, lower, results);
    // Sort by frequency (most searched first) - O(n log n)
    results.sort((a, b) => b.frequency - a.frequency);
    return results.slice(0, k);
  }

  _dfs(node, prefix, results) {
    if (node.isEnd) results.push({ word: prefix, data: node.data, frequency: node.frequency });
    for (const [ch, child] of node.children) {
      this._dfs(child, prefix + ch, results);
    }
  }

  get size() { return this._count; }
}

// ============================================================
// 4. GEO-HASH INDEX
//    Use case: Find nearest parking yards, drivers, slipways
//    Time: O(1) insert/lookup by precision | Space: O(n)
// ============================================================
class GeoHashIndex {
  constructor(precision = 6) {
    this.precision = precision; // Higher = more precise
    this.index = new Map(); // geohash -> Set of items
    this.BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  }

  encode(lat, lng, precision = this.precision) {
    let minLat = -90, maxLat = 90, minLng = -180, maxLng = 180;
    let hash = '';
    let isLng = true, bit = 0, charIdx = 0;

    while (hash.length < precision) {
      if (isLng) {
        const midLng = (minLng + maxLng) / 2;
        if (lng >= midLng) { charIdx = (charIdx << 1) | 1; minLng = midLng; }
        else { charIdx = charIdx << 1; maxLng = midLng; }
      } else {
        const midLat = (minLat + maxLat) / 2;
        if (lat >= midLat) { charIdx = (charIdx << 1) | 1; minLat = midLat; }
        else { charIdx = charIdx << 1; maxLat = midLat; }
      }
      isLng = !isLng;
      if (++bit === 5) {
        hash += this.BASE32[charIdx];
        bit = 0; charIdx = 0;
      }
    }
    return hash;
  }

  insert(id, lat, lng, data) {
    const hash = this.encode(lat, lng);
    if (!this.index.has(hash)) this.index.set(hash, new Map());
    this.index.get(hash).set(id, { id, lat, lng, data, hash });
  }

  delete(id, lat, lng) {
    const hash = this.encode(lat, lng);
    if (this.index.has(hash)) {
      this.index.get(hash).delete(id);
    }
  }

  // Get all items in the same geohash cell
  getNeighborhood(lat, lng) {
    const hash = this.encode(lat, lng);
    const neighbors = this._getNeighbors(hash);
    const results = [];
    for (const h of [hash, ...neighbors]) {
      if (this.index.has(h)) {
        results.push(...this.index.get(h).values());
      }
    }
    return results;
  }

  _getNeighbors(hash) {
    // Simplified neighbor computation - returns adjacent cells
    return [hash]; // Production: compute all 8 neighbors
  }

  // Find k-nearest items using Haversine distance - O(n) in neighborhood
  findKNearest(lat, lng, k = 10) {
    const candidates = this.getNeighborhood(lat, lng);
    return candidates
      .map(item => ({ ...item, distance: this._haversine(lat, lng, item.lat, item.lng) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);
  }

  _haversine(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
              Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
}

// ============================================================
// 5. CIRCULAR BUFFER
//    Use case: Fixed-size notification queues, GPS coordinate trail
//    Time: O(1) push/read | Space: O(capacity) fixed
// ============================================================
class CircularBuffer {
  constructor(capacity) {
    this.buffer = new Array(capacity);
    this.capacity = capacity;
    this.head = 0; // Read pointer
    this.tail = 0; // Write pointer
    this.size = 0;
  }

  push(item) {
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    if (this.size < this.capacity) this.size++;
    else this.head = (this.head + 1) % this.capacity; // Overwrite oldest
  }

  read() {
    if (this.size === 0) return null;
    const item = this.buffer[this.head];
    this.head = (this.head + 1) % this.capacity;
    this.size--;
    return item;
  }

  peek() { return this.size > 0 ? this.buffer[this.head] : null; }
  isEmpty() { return this.size === 0; }
  isFull() { return this.size === this.capacity; }

  toArray() {
    const arr = [];
    for (let i = 0; i < this.size; i++) {
      arr.push(this.buffer[(this.head + i) % this.capacity]);
    }
    return arr;
  }
}

// ============================================================
// 6. SEGMENT TREE (Range Queries)
//    Use case: Parking availability queries over date ranges
//    Time: O(log n) query/update | Space: O(n)
// ============================================================
class SegmentTree {
  constructor(n) {
    this.n = n;
    this.tree = new Int32Array(4 * n); // Typed array for performance
    this.lazy = new Int32Array(4 * n);
  }

  // Build from initial availability array
  build(arr, node = 1, start = 0, end = this.n - 1) {
    if (start === end) {
      this.tree[node] = arr[start];
      return;
    }
    const mid = Math.floor((start + end) / 2);
    this.build(arr, 2*node, start, mid);
    this.build(arr, 2*node+1, mid+1, end);
    this.tree[node] = this.tree[2*node] + this.tree[2*node+1];
  }

  // Range sum query: total available spots in [l, r]
  query(l, r, node = 1, start = 0, end = this.n - 1) {
    if (r < start || end < l) return 0;
    if (l <= start && end <= r) return this.tree[node];
    const mid = Math.floor((start + end) / 2);
    return this.query(l, r, 2*node, start, mid) +
           this.query(l, r, 2*node+1, mid+1, end);
  }

  // Point update: book/release a spot on day idx
  update(idx, val, node = 1, start = 0, end = this.n - 1) {
    if (start === end) { this.tree[node] += val; return; }
    const mid = Math.floor((start + end) / 2);
    if (idx <= mid) this.update(idx, val, 2*node, start, mid);
    else this.update(idx, val, 2*node+1, mid+1, end);
    this.tree[node] = this.tree[2*node] + this.tree[2*node+1];
  }
}

// ============================================================
// SINGLETON INSTANCES (Application-wide caches)
// ============================================================

const parkingSpotCache = new LRUCache(500, 60000); // 1-min TTL
const userSessionCache = new LRUCache(10000, 86400000); // 24hr TTL
const productSearchTrie = new Trie();
const locationSearchTrie = new Trie();
const driverGeoIndex = new GeoHashIndex(6);
const yardGeoIndex = new GeoHashIndex(7);
const deliveryQueue = new MinHeap((a, b) => a.scheduledTime - b.scheduledTime);
const notificationBuffer = new CircularBuffer(1000);

module.exports = {
  LRUCache,
  MinHeap,
  Trie,
  GeoHashIndex,
  CircularBuffer,
  SegmentTree,
  // Singletons
  parkingSpotCache,
  userSessionCache,
  productSearchTrie,
  locationSearchTrie,
  driverGeoIndex,
  yardGeoIndex,
  deliveryQueue,
  notificationBuffer,
};
