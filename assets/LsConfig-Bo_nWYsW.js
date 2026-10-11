// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation.
    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);

    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }
  }

  return getRandomValues(rnds8);
}

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
}

function unsafeStringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}

const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
const native = {
  randomUUID
};

function v4(options, buf, offset) {
  if (native.randomUUID && true && !options) {
    return native.randomUUID();
  }

  options = options || {};
  const rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  return unsafeStringify(rnds);
}

/**
 * localStorage
 * key value serialized Config
 * */
class LsConfig {
  config_key = null
  data = null

  constructor(config_key) {
    this.config_key = config_key;
    this.init();
  }

  init() {
    if (!this.config_key) {
      config_key = `ls_config_${v4()}`;
    }
    this.getData();
  }

  /**
   * set unique config key for localStorage key
   * */
  setConfigKey(key) {
    this.config_key = key;
  }
  /**
   * get data by key
   * */
  getData(key) {
    try {
      this.data = JSON.parse(localStorage[this.config_key]);
    } catch (e) {
      if (!this.data) {
        this.data = {};
      }
    }
    if (!key) return this.data

    if (!this.data[key]) return null

    return this.data[key]
  }
  /**
   * set data by key
   * */
  setData(key, value) {
    this.data[key] = value;
    localStorage[this.config_key] = JSON.stringify(this.data);
  }
}

class ChromeLsConfig {
  config_key = null
  data = null

  constructor(config_key) {
    this.config_key = config_key;
    this.init();
  }

  init() {
    if (!this.config_key) {
      config_key = `ls_config_${v4()}`;
    }
    this.getData();
  }

  /**
   * set unique config key for localStorage key
   * */
  setConfigKey(key) {
    this.config_key = key;
  }
  /**
   * get data by key
   * */
  async getData(key) {
    let usingChromeStorage = false;
    try {
      const data = await chrome.storage.local.get(this.config_key);
      this.data = data[this.config_key] || {};
      usingChromeStorage = true;
    } catch (e) {
      if (!this.data) {
        this.data = {};
      }
    }
    if(!usingChromeStorage){
      try {
        this.data = JSON.parse(localStorage[this.config_key]);
      } catch (e) {
        if (!this.data) {
          this.data = {};
        }
      }
    }
    // console.log(this.data)
    if (!key) return this.data

    if (typeof this.data[key] === "undefined") return null

    return this.data[key]
  }
  /**
   * set data by key
   * */
  async setData(key, value) {
    let usingChromeStorage = false;

    this.data[key] = value;
    try{
      const lsData = {};
      lsData[this.config_key] = this.data;
      await chrome.storage.local.set(lsData);
      usingChromeStorage = true;
    }catch(e){

    }
    if(!usingChromeStorage){
      try {
        this.data[key] = value;
        localStorage[this.config_key] = JSON.stringify(this.data);
      } catch (e) {
       
      }
    }
    
  }
}

export { ChromeLsConfig as C, LsConfig as L, v4 as v };
