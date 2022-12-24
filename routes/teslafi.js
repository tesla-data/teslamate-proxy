const fs = require('fs');

module.exports = async (ctx) => {
  ctx.body = JSON.parse(fs.readFileSync('/data/teslafi_firmware.json'));
};