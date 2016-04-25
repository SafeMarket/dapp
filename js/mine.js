console.log('mine.js loaded')

var miner = miner || admin.miner

web3.eth.filter("pending").watch(function () {
  if (miner.hashrate > 0) return;

  console.log("===== Pending transactions! Looking for next block... =====");
  miner.start(1);
});

web3.eth.filter("latest").watch(function () {
  if (pendingTransactions()) return
  
  console.log("===== No transactions left. Stopping miner... =====");
  miner.stop(1);
});

function pendingTransactions(){
  if (web3.eth.pendingTransactions === undefined || web3.eth.pendingTransactions === null) {
    return txpool.status.pending || txpool.status.queued;
  }
  else if (typeof web3.eth.pendingTransactions === "function")  {
    return web3.eth.pendingTransactions().length > 0;
  }
  else {
    return web3.eth.pendingTransactions.length > 0 || web3.eth.getBlock('pending').transactions.length > 0;
  }
};