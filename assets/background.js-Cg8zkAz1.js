import { A as AppInstaller, i as idb_get, a as idb_update, b as idb_insert, c as idb_delete, d as idb_create_store } from './fn-_EFmrpIG.js';
import './LsConfig-Bo_nWYsW.js';
import './_commonjsHelpers-Dc8z98SR.js';

const getTableCount = async (db_, dbName)=>{
    return new Promise((resolve,reject) => {
      if (db_ == null) {
        return reject()
      }
      var size = 0;
      // db_ = event.target.result
      var transaction = db_.transaction([dbName])
        .objectStore(dbName)
        .openCursor();
  
      transaction.onsuccess = function(event){
          var cursor = event.target.result;
          if(cursor){
              cursor.value;
              // var json = JSON.stringify(storedObject)
              size += 1; //json.length
              cursor.continue();
          }
          else {
            resolve(size);
          }
      }.bind(undefined);
      transaction.onerror = function(err){
          reject("error in " + dbName + ": " + err);
      };
    })
  };
  const getTableSize = async (db_, dbName)=>{
    return new Promise((resolve,reject) => {
      if (db_ == null) {
        return reject()
      }
      var size = 0;
      // db_ = event.target.result
      var transaction = db_.transaction([dbName])
        .objectStore(dbName)
        .openCursor();
  
      transaction.onsuccess = function(event){
          var cursor = event.target.result;
          if(cursor){
              var storedObject = cursor.value;
              var json = JSON.stringify(storedObject);
              size += json.length;
              cursor.continue();
          }
          else {
            resolve(size);
          }
      }.bind(undefined);
      transaction.onerror = function(err){
          reject("error in " + dbName + ": " + err);
      };
    })
  };

const listeningTabIds = {};
let port = null; // This is the port used to communicate to the native host
const hostName = "com.cristminix.llfetcher";
function changeToActiveIcon(tabId) {
    if (typeof tabId === "undefined") {
        // If programmer forgot to pass the tabId, return early.
        console.warn('Must pass a tabId to changeToActiveIcon');
        return
    }

    chrome.action.setIcon({
        path: {
            19: '/extension/images/v-pink-19.png',
            38: '/extension/images/v-pink-38.png'
        },
        tabId: tabId
    });
}

function changeToInactiveIcon(tabId) {
    if (typeof tabId === "undefined") {
        // If programmer forgot to pass the tabId, return early.
        console.warn('Must pass a tabId to changeToInactiveIcon');
        return
    }

    chrome.action.setIcon({
        path: {
            19: '/logo/disabled/icon-19.png',
            38: '/logo/disabled/icon-38.png'
        },
        tabId: tabId
    });
}

function stopListening(tabId) {
    if (typeof tabId === "undefined") {
        // If programmer forgot to pass the tabId, return early.
        console.warn('Must pass a tabId to stopListening');
        return
    }
    delete listeningTabIds[tabId];
    changeToInactiveIcon(tabId);
    console.log('Will stop automatically reloading tab', tabId);
}

function startListening(tabId) {
    if (typeof tabId === "undefined") {
        // If programmer forgot to pass the tabId, return early.
        console.warn('Must pass a tabId to startListening');
        return
    }
    listeningTabIds[tabId] = tabId;
    changeToActiveIcon(tabId);
    console.log('Will start reloading tab', tabId, 'on relevant Vim events.');
}

try{
    chrome.action.onClicked.addListener(function(tab) {
        const tabId = tab.id;
        if (listeningTabIds[tabId]) {
            stopListening(tabId);
        } else {
            startListening(tabId);
        }
    });
}catch(e){
    console.log(e);
}


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // This gets fired twice, first where changeInfo.status is "loading" and
    // the second when changeInfo.status is "complete". We only need to
    // react to the first.
    if (changeInfo.status === 'loading' && listeningTabIds[tabId]) {
        startListening(tabId);
    }
});
async function sendNativeMessageAsync(message, callback) {
    // console.log(message)
    // let encoder = new TextEncoder()
    // const msgBa = encoder.encode(message).toString()
    // console.log(msgBa)
    
    return new Promise((resolve, reject) => {
        const onMessageCallback = (response) => {
            resolve(response);
            callback(response);
            port.onMessage.removeListener(onMessageCallback);
        };
        try{
            port.onMessage.addListener(onMessageCallback);
            port.postMessage(message);

        }catch(e){
            reject(e);
        }
        
    })
}

function onNativeMessage(eventName) {
    console.log('Event page got native message from host:', eventName);
    switch (eventName) {
        case 'reload':
            Object.keys(listeningTabIds).forEach(function(tabId) {
                tabId = parseInt(tabId);
                console.log('Found listening tab id', tabId);
                chrome.tabs.reload(tabId, null, function() {
                    console.log('Reloading tab id', tabId);
                    // Check if we're listening to this tab, and change the
                    // icon if so. We probably are still listening, but
                    // currently manual user refreshes aren't handled.
                    if (listeningTabIds[tabId]) {
                        startListening(tabId);
                    }
                });
            });
            break
    }
}

let reconnectAttempt = 0;
let reconnectTimer = null;
function onDisconnected() {
    const errorMessage = chrome.runtime.lastError?.message || 'Yerel istemci bağlantısı kesildi.';
    console.warn('Native Messaging bağlantısı kesildi:', errorMessage);
    port = null;
    if (reconnectTimer !== null) return;
    const delay = Math.min(30000, 1000 * Math.pow(2, Math.min(reconnectAttempt, 5)));
    reconnectAttempt += 1;
    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect();
    }, delay);
}

function connect() {
    if (port) return;
    try {
        port = chrome.runtime.connectNative(hostName);
        port.onMessage.addListener((message) => {
            reconnectAttempt = 0;
            onNativeMessage(message);
        });
        port.onDisconnect.addListener(onDisconnected);
        console.log("Native Messaging bağlantısı başlatıldı:", hostName);
    } catch (error) {
        port = null;
        console.warn('Yerel istemciye bağlanılamadı:', error?.message || error);
        onDisconnected();
    }
}

const installer = new AppInstaller();
installer.isFreshIstall().then((freshInstall) => {
  console.log("fresh install", freshInstall);
});
let conn = null;
const insert_csidb = async (records) => await idb_insert("csidb", records, conn);
const get_csidb = async (dbName) => await idb_get("csidb", dbName, conn);
const update_csidb = async (record) => await idb_update("csidb", record, conn);
const insert_prxCache = async (records) => await idb_insert("prxCache", records, conn);
const get_prxCache = async (key) => await idb_get("prxCache", key, conn);
const update_prxCache = async (record) => await idb_update("prxCache", record, conn);
const delete_prxCache = async (key, clear = false) => await idb_delete("prxCache", key, clear, conn);
const create_idb_store = async () => {
  conn = await idb_create_store([
    { name: "prxCache", keyPath: "key" },
    { name: "csidb", keyPath: "dbName" },
    { name: "userdata", keyPath: "key" }
  ]);
};
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { name, data, key } = request;
  if (name.match(/^nm\./)) {
    const cmd = name.replace(/^nm\./, "");
    sendNativeMessageAsync({ cmd, data }, (response) => {
      sendResponse(response);
    });
  } else if (name === "content.cookie.set") {
    const key2 = "uCookies";
    chrome.cookies.getAll({ domain: "www.linkedin.com" }).then((cookies) => {
      const requiredCookieNames = new Set(["li_at", "JSESSIONID"]);
      const requiredCookies = cookies.filter((cookie) => requiredCookieNames.has(cookie.name));
      const record = { key: key2, content: requiredCookies };
      idb_get("userdata", record.key, conn).then((existingRec) => {
        if (existingRec) {
          console.log(`Update existing userdata rec:${existingRec.key}`);
          idb_update("userdata", record, conn);
        } else {
          console.log(`insert userdata:${record.key}`);
          idb_insert("userdata", record, conn);
        }
      });
    });
    sendResponse(request);
  } else if (name === "csidb.select") {
    get_csidb(data.dbName).then((item) => {
      sendResponse(item);
    });
  } else if (name === "csidb.commit") {
    if (data.records) {
      const { records } = data;
      const record = records[0];
      get_csidb(record.dbName).then((existingRec) => {
        if (existingRec) {
          console.log(`Update csidb existing rec:${existingRec.dbName}`);
          update_csidb(record);
        } else {
          console.log(`insert csidb:${record.dbName}`);
          insert_csidb(records);
        }
      });
    }
  } else if (name === "prxCache.clear") {
    delete_prxCache(null, true).then((size) => {
      sendResponse(size);
    });
  } else if (name === "prxCache.count") {
    getTableCount(conn, "prxCache").then((size) => {
      sendResponse(size);
    });
  } else if (name === "prxCache.size") {
    getTableSize(conn, "prxCache").then((size) => {
      sendResponse(size);
    });
  } else if (name === "prxCache.get") {
    get_prxCache(data.key).then((item) => {
      sendResponse(item);
    });
  } else if (name === "prxCache.create") {
    create_idb_store();
  } else if (name === "prxCache.update") {
    if (data.records) {
      const { records } = data;
      update_prxCache(records[0]);
    }
  } else if (name === "prxCache.insert") {
    if (data.records) {
      const { records } = data;
      const record = records[0];
      get_prxCache(record.key).then((existingRec) => {
        if (existingRec) {
          console.log(`Update existing rec:${existingRec.key}`);
          update_prxCache(record);
        } else {
          console.log(`insert prxCache:${record.key}`);
          insert_prxCache(records);
        }
      });
    }
  } else if (name === "prxCache.delete") {
    if (data.key) {
      delete_prxCache(data.key);
    }
  } else if (request.action === "activateTab") {
    const { url, optionPageBaseUrl } = request;
    chrome.tabs.query(
      { url: `${chrome.runtime.getURL(`${optionPageBaseUrl}options.html`)}*` },
      function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.update(activeTab.id, { active: true });
        chrome.tabs.update(activeTab.id, { url });
      }
    );
  }
  return true;
});
create_idb_store();
connect();
