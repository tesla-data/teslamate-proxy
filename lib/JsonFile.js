const fs = require('fs');
const zlib = require('zlib');
const crypto = require('crypto');

const pathBase = process.env.SERVERLESS ? '/mnt' : '/tmp';

module.exports = class {
  constructor(path, key, carId) {
    try { fs.mkdirSync(pathBase + path, { recursive: true }); } catch (e) { }

    const md5 = crypto.createHash('md5');
    this.file = `${pathBase}${path}/${md5.update(key).digest('hex')}_${carId}.json.gz`;
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