(function () {
  "use strict";

  var DB_NAME = "nx_otc_demo";
  var DB_VER = 2;

  var _db;

  function openDb() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VER);
      req.onerror = function () {
        reject(req.error);
      };
      req.onsuccess = function () {
        _db = req.result;
        resolve(_db);
      };
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains("orders")) {
          var os = db.createObjectStore("orders", { keyPath: "id" });
          os.createIndex("by_updated", "updatedAt", { unique: false });
          os.createIndex("by_status", "status", { unique: false });
        }
        if (!db.objectStoreNames.contains("ai_messages")) {
          var am = db.createObjectStore("ai_messages", { autoIncrement: true });
          am.createIndex("by_ts", "ts", { unique: false });
        }
        if (!db.objectStoreNames.contains("kv")) {
          db.createObjectStore("kv", { keyPath: "key" });
        }
      };
    });
  }

  function seedIfEmpty() {
    return new Promise(function (resolve, reject) {
      var t = _db.transaction("orders", "readwrite");
      var st = t.objectStore("orders");
      var r = st.count();
      r.onsuccess = function () {
        if (r.result > 0) {
          resolve(false);
          return;
        }
        var now = Date.now();
        var sample = [
          {
            id: "OTC-DEMO-8F3A9C",
            side: "buy",
            fiatCode: "CNY",
            coinCode: "USDT",
            fiat: 100000,
            coin: 13820,
            price: 7.243,
            merchant: "商家 A",
            status: "paying",
            label: "待付款",
            step: 3,
            createdAt: now - 3600000,
            updatedAt: now - 120000,
          },
          {
            id: "OTC-DEMO-12AB01",
            side: "buy",
            fiatCode: "CNY",
            coinCode: "USDT",
            fiat: 50000,
            coin: 6910,
            price: 7.235,
            merchant: "商家 B",
            status: "done",
            label: "已完成",
            step: 5,
            createdAt: now - 86400000,
            updatedAt: now - 80000000,
          },
        ];
        var pending = sample.length;
        sample.forEach(function (o) {
          var pr = st.put(o);
          pr.onsuccess = function () {
            pending -= 1;
            if (pending === 0) resolve(true);
          };
          pr.onerror = function () {
            reject(pr.error);
          };
        });
      };
      r.onerror = function () {
        reject(r.error);
      };
    });
  }

  var readyPromise;

  function ready() {
    if (readyPromise) return readyPromise;
    readyPromise = openDb().then(function () {
      return seedIfEmpty();
    });
    return readyPromise;
  }

  function getKv(key) {
    return ready().then(function () {
      return new Promise(function (resolve, reject) {
        var t = _db.transaction("kv", "readonly");
        var r = t.objectStore("kv").get(key);
        r.onsuccess = function () {
          resolve(r.result ? r.result.value : null);
        };
        r.onerror = function () {
          reject(r.error);
        };
      });
    });
  }

  function setKv(key, value) {
    return ready().then(function () {
      return new Promise(function (resolve, reject) {
        var t = _db.transaction("kv", "readwrite");
        var r = t.objectStore("kv").put({ key: key, value: value });
        r.onsuccess = function () {
          resolve(true);
        };
        r.onerror = function () {
          reject(r.error);
        };
      });
    });
  }

  function getOrder(id) {
    return ready().then(function () {
      return new Promise(function (resolve, reject) {
        var r = _db.transaction("orders", "readonly").objectStore("orders").get(id);
        r.onsuccess = function () {
          resolve(r.result || null);
        };
        r.onerror = function () {
          reject(r.error);
        };
      });
    });
  }

  function getAllOrders() {
    return ready().then(function () {
      return new Promise(function (resolve, reject) {
        var r = _db.transaction("orders", "readonly").objectStore("orders").getAll();
        r.onsuccess = function () {
          resolve(r.result || []);
        };
        r.onerror = function () {
          reject(r.error);
        };
      });
    });
  }

  function putOrder(order) {
    return ready().then(function () {
      if (typeof window !== "undefined" && window.NxOtcCurrency) {
        window.NxOtcCurrency.normalizeOrder(order);
      }
      order.updatedAt = Date.now();
      if (!order.createdAt) order.createdAt = order.updatedAt;
      return new Promise(function (resolve, reject) {
        var r = _db.transaction("orders", "readwrite").objectStore("orders").put(order);
        r.onsuccess = function () {
          resolve(order);
        };
        r.onerror = function () {
          reject(r.error);
        };
      });
    });
  }

  function addAiMessage(role, text, meta) {
    return ready().then(function () {
      var row = { role: role, text: text, ts: Date.now(), meta: meta || null };
      return new Promise(function (resolve, reject) {
        var r = _db.transaction("ai_messages", "readwrite").objectStore("ai_messages").add(row);
        r.onsuccess = function () {
          row.id = r.result;
          resolve(row);
        };
        r.onerror = function () {
          reject(r.error);
        };
      });
    });
  }

  function getAiMessages() {
    return ready().then(function () {
      return new Promise(function (resolve, reject) {
        var r = _db.transaction("ai_messages", "readonly").objectStore("ai_messages").getAll();
        r.onsuccess = function () {
          var list = r.result || [];
          list.sort(function (a, b) {
            return (a.ts || 0) - (b.ts || 0);
          });
          resolve(list);
        };
        r.onerror = function () {
          reject(r.error);
        };
      });
    });
  }

  function clearAiMessages() {
    return ready().then(function () {
      return new Promise(function (resolve, reject) {
        var r = _db.transaction("ai_messages", "readwrite").objectStore("ai_messages").clear();
        r.onsuccess = function () {
          resolve(true);
        };
        r.onerror = function () {
          reject(r.error);
        };
      });
    });
  }

  window.NxOtcStore = {
    ready: ready,
    getKv: getKv,
    setKv: setKv,
    getOrder: getOrder,
    getAllOrders: getAllOrders,
    putOrder: putOrder,
    addAiMessage: addAiMessage,
    getAiMessages: getAiMessages,
    clearAiMessages: clearAiMessages,
  };
})();
