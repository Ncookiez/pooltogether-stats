"use strict";
// Function to react to incoming messages:
onmessage = function (event) {
    // Initializations:
    var data = event.data;
    var draws = {
        eth: { data: [] },
        poly: { data: [] },
        avax: { data: [] },
        op: { data: [] }
    };
    // Formatting Draws:
    data.forEach(function (entry) {
        var draw = entry.draw;
        var timestamp = parseInt(entry.timestamp);
        var result = [];
        entry.result.forEach(function (player) {
            var chain;
            if (player.n === '1') {
                chain = 'eth';
            }
            else if (player.n === '3') {
                chain = 'poly';
            }
            else if (player.n === '4') {
                chain = 'avax';
            }
            else if (player.n === '6') {
                chain = 'op';
            }
            if (chain) {
                var wallet = player.a;
                var claimable = player.c.map(function (prize) { return parseInt(prize); });
                var dropped = player.u.map(function (prize) { return parseInt(prize); });
                var avgBalance = player.g;
                result.push({ chain: chain, wallet: wallet, claimable: claimable, dropped: dropped, avgBalance: avgBalance });
            }
        });
        var ethResults = result.filter(function (entry) { return entry.chain === 'eth'; });
        var polyResults = result.filter(function (entry) { return entry.chain === 'poly'; });
        var avaxResults = result.filter(function (entry) { return entry.chain === 'avax'; });
        var opResults = result.filter(function (entry) { return entry.chain === 'op'; });
        draws.eth.data.push({ draw: draw, timestamp: timestamp, result: ethResults });
        draws.poly.data.push({ draw: draw, timestamp: timestamp, result: polyResults });
        draws.avax.data.push({ draw: draw, timestamp: timestamp, result: avaxResults });
        draws.op.data.push({ draw: draw, timestamp: timestamp, result: opResults });
    });
    postMessage(draws);
    // Resetting Memory:
    data = [];
    draws = { eth: { data: [] }, poly: { data: [] }, avax: { data: [] }, op: { data: [] } };
};
