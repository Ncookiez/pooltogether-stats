
// Function to react to incoming messages:
onmessage = (event) => {

  // Initializations:
  const chains: Chain[] = ['eth', 'poly', 'avax', 'op'];
  const data: DelegationHistoryEventData = event.data;
  const allDelegations: DelegationFundedData[] = [];

  // Adding Delegations:
  chains.forEach(chain => {
    if(data.selectedChains[chain]) {
      data.delegations[chain].forEach(delegation => {
        if(delegation.timestamp && delegation.timestamp >= data.minTimestamp && delegation.timestamp <= data.maxTimestamp) {
          allDelegations.push({ ...delegation, chain });
        }
      });
    }
  });

  postMessage(allDelegations.sort((a, b) => (b.timestamp as number) - (a.timestamp as number)));
}