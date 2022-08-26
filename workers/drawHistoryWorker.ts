
// Function to react to incoming messages:
onmessage = (event) => {

  // Initializations:
  const chains: Chain[] = ['eth', 'poly', 'avax', 'op'];
  const data: DrawHistoryEventData = event.data;
  const allDraws: DrawData[] = [];

  // Setting Up Draw IDs:
  data.draws.eth.forEach(entry => {
    allDraws.push({ draw: entry.draw, timestamp: entry.timestamp, result: [] });
  });

  // Adding Draws:
  chains.forEach(chain => {
    if(data.selectedChains[chain]) {
      data.draws[chain].forEach((entry, i) => {
        allDraws[i].result.push(...entry.result.map(result => ({ ...result, chain })));
      });
    }
  });

  postMessage(allDraws.reverse());
}