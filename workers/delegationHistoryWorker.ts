
// Function to react to incoming messages:
onmessage = (event) => {

  // Initializations:
  const chains: Chain[] = ['eth', 'poly', 'avax', 'op'];
  let data: DelegationHistoryEventData | undefined = event.data;
  let allDelegations: DelegationFundedData[] = [];

  // Adding Delegations:
  chains.forEach(chain => {
    if(data?.selectedChains[chain]) {
      data.delegations[chain].forEach(delegation => {
        if(data && delegation.timestamp) {
          allDelegations.push({ ...delegation, chain });
        }
      });
    }
  });

  postMessage(allDelegations.sort((a, b) => (b.timestamp as number) - (a.timestamp as number)));

  // Resetting Memory:
  data = undefined;
  allDelegations = [];

}