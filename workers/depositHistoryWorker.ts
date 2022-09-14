
// Function to react to incoming messages:
onmessage = (event) => {

  // Initializations:
  const chains: Chain[] = ['eth', 'poly', 'avax', 'op'];
  const data: DepositHistoryEventData = event.data;
  const allDeposits: DepositData[] = [];

  // Adding Deposits:
  chains.forEach(chain => {
    if(data.selectedChains[chain]) {
      data.deposits[chain].forEach(deposit => {
        if(deposit.timestamp && deposit.timestamp >= data.minTimestamp && deposit.timestamp <= data.maxTimestamp) {
          allDeposits.push({ ...deposit, chain });
        }
      });
    }
  });

  postMessage(allDeposits.sort((a, b) => (b.timestamp as number) - (a.timestamp as number)));
}