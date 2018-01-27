onmessage = function(e) {
    let nodes = e.data.nodes;

    let xScale = d4.scaleLinear()
        .range(e.data.xRange),
        yScale = d4.scaleLinear()
        .range(e.data.yRange);

    let tsne = new tsnejs.tSNE({
        dim: 2,
        perplexity: 70
    });
    tsne.initDataDist(e.data.dists);

    let forceTsne = function(alpha) {
        tsne.step();
        let pos = tsne.getSolution();

        xScale.domain(d4.extent(pos, d => d[0]));
        yScale.domain(d4.extent(pos, d => d[1]));

        nodes.forEach((d, i) => {
            d.x += alpha * (xScale(pos[i][0]) - d.x);
            d.y += alpha * (yScale(pos[i][1]) - d.y);
        });
    }

    let simulation = d4.forceSimulation(nodes)
        .force('tsne', forceTsne)
        .stop();

    for (let i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; i++) {
        postMessage({
            type: "tick",
            progress: i / n
        });
        simulation.tick();
    }

    postMessage({
        type: "end",
        nodes: nodes,
    });
};