
// Function to react to incoming messages:
onmessage = (event) => {

  // Initializations:
  let data: ExplorerAPIDrawResponse[] = event.data;
  let draws: Record<Chain, { data: DrawData[] }> = {
    eth: { data: [] },
    poly: { data: [] },
    avax: { data: [] },
    op: { data: [] }
  }

  // Formatting Draws:
  data.forEach(entry => {
    const draw = entry.draw;
    const timestamp = parseInt(entry.timestamp);
    const result: DrawData['result'] = [];
    entry.result.forEach(player => {
      let chain: Chain | undefined;
      if(player.n === '1') {
        chain = 'eth';
      } else if(player.n === '3') {
        chain = 'poly';
      } else if(player.n === '4') {
        chain = 'avax';
      } else if(player.n === '6') {
        chain = 'op';
      }
      if(chain) {
        const wallet = player.a as Hash;
        const claimable = player.c.map(prize => parseInt(prize));
        const dropped = player.u.map(prize => parseInt(prize));
        const avgBalance = player.g;
        result.push({ chain, wallet, claimable, dropped, avgBalance });
      }
    });
    const ethResults: DrawData['result'] = result.filter(entry => entry.chain === 'eth');
    const polyResults: DrawData['result'] = result.filter(entry => entry.chain === 'poly');
    const avaxResults: DrawData['result'] = result.filter(entry => entry.chain === 'avax');
    const opResults: DrawData['result'] = result.filter(entry => entry.chain === 'op');
    draws.eth.data.push({ draw, timestamp, result: ethResults });
    draws.poly.data.push({ draw, timestamp, result: polyResults });
    draws.avax.data.push({ draw, timestamp, result: avaxResults });
    draws.op.data.push({ draw, timestamp, result: opResults });
  });

  postMessage(draws);

  // Resetting Memory:
  data = [];
  draws = { eth: { data: [] }, poly: { data: [] }, avax: { data: [] }, op: { data: [] } };

}