"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
// Function to react to incoming messages:
onmessage = function (event) {
    // Initializations:
    var chains = ['eth', 'poly', 'avax', 'op'];
    var data = event.data;
    var allDeposits = [];
    // Adding Deposits:
    chains.forEach(function (chain) {
        if (data.selectedChains[chain]) {
            data.deposits[chain].forEach(function (deposit) {
                if (deposit.timestamp && deposit.timestamp >= data.minTimestamp && deposit.timestamp <= data.maxTimestamp) {
                    allDeposits.push(__assign(__assign({}, deposit), { chain: chain }));
                }
            });
        }
    });
    postMessage(allDeposits.sort(function (a, b) { return b.timestamp - a.timestamp; }));
};
