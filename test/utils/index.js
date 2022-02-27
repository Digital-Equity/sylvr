const web3 = require("web3");

function hashAddressArray(owners) {
  let hex = "0x";
  hex += owners.map((address) => address.substr(2, 40)).join("");
  let hash = web3.utils.hexToBytes(hex);
  return hash;
}


module.exports = {
  hashAddressArray
}