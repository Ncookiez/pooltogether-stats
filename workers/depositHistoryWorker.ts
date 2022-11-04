
// Function to react to incoming messages:
onmessage = (event) => {

  // Initializations:
  const chains: Chain[] = ['eth', 'poly', 'avax', 'op'];
  let data: DepositHistoryEventData | undefined = event.data;
  let allDeposits: DepositData[] = [];

  // Adding Deposits:
  chains.forEach(chain => {
    if(data?.selectedChains[chain]) {
      data.deposits[chain].forEach(deposit => {
        if(data && deposit.timestamp) {
          allDeposits.push({ ...deposit, chain });
        }
      });
    }
  });

  postMessage(allDeposits.sort((a, b) => (b.timestamp as number) - (a.timestamp as number)));

  // Resetting Memory:
  data = undefined;
  allDeposits = [];

}