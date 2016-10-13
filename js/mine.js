console.log('mine.js loaded')

var miner = miner || admin.miner

web3.eth.filter("pending").watch(function () {
  if (web3.eth.hashrate > 0) return;

  console.log("===== Pending transactions! Looking for next block... =====");
  miner.start();
});

web3.eth.filter("latest").watch(function () {
  if (pendingTransactions() && rich()) return
  
  console.log("===== No transactions left. Stopping miner... =====");
  miner.stop();
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

function rich() {
  var balance = web3.eth.getBalance(web3.eth.accounts[0])
  var balanceInEther = web3.fromWei(balance, 'ether')
  console.log('Account has', balanceInEther, 'ethther')
  return balanceInEther.greaterThan(100)
}

miner.start()