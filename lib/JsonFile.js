const fs = require('fs');
const zlib = require('zlib');
const crypto = require('crypto');

const pathBase = '/data';

module.exports = class {
  constructor(path, key, id) {
    if (!fs.existsSync(pathBase + path)) fs.mkdirSync(pathBase + path, { recursive: true });

    if (key && id) {
      const md5 = crypto.createHash('md5');
      const hash = md5.update(key).digest('hex');
      this.id = id;
      this.hash = hash;
      this.file = `${pathBase}${path}/${hash}_${id}.json.gz`;
    }
  }

  setPath(path, hash, id) {
    this.id = id;
    this.hash = hash;
    this.file = `${pathBase}${path}/${hash}_${id}.json.gz`;
  }

  exists() {
    return fs.existsSync(this.file);
  }

  load() {
    try {
      if (!fs.existsSync(this.file)) return null;
      const data = fs.readFileSync(this.file);
      return JSON.parse(zlib.unzipSync(data).toString());
    } catch(e) {
      console.error(e);
    }
  }

  save(data) {
    try {
      data = zlib.gzipSync(JSON.stringify(data));
      fs.writeFileSync(this.file, data);
    } catch(e) {
      console.error(e);
    }
  }
}