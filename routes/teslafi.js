const fs = require('fs');

module.exports = async (ctx) => {
  ctx.body = JSON.parse(fs.readFileSync('/mnt/teslafi_firmware.json'));
};