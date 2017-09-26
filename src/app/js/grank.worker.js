let GRank = require('./grank.js');
/**
 * Web Worker that runs PRank in a separate thread.
 */

// respond to messages from the main thread
self.onmessage = function(e) {
    let graph = new GRank.Graph();
    graph.nodes(e.data.nodes)
        .edges(e.data.edges)
        .doPrank();

    // post result to main thread
    self.postMessage({
        prank: graph.prank.valueOf()
    });
};