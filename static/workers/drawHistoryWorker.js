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
    var allDraws = [];
    // Setting Up Draw IDs:
    data.draws.eth.forEach(function (entry) {
        allDraws.push({ draw: entry.draw, timestamp: entry.timestamp, result: [] });
    });
    // Adding Draws:
    chains.forEach(function (chain) {
        if (data.selectedChains[chain]) {
            data.draws[chain].forEach(function (entry, i) {
                var _a;
                (_a = allDraws[i].result).push.apply(_a, entry.result.map(function (result) { return (__assign(__assign({}, result), { chain: chain })); }));
            });
        }
    });
    postMessage(allDraws.reverse());
};
