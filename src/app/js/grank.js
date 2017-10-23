// [SimRank](http://dl.acm.org/citation.cfm?id=775126): a measure of structural-context similarity

(function(factory) {

    // This section follows Backbone.js style

    // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
    // We use `self` instead of `window` for `WebWorker` support.
    var root = (typeof self == 'object' && self.self === self && self) ||
        (typeof global == 'object' && global.global === global && global);

    // Set up SimRank appropriately for the environment. Start with AMD.
    if (typeof define === 'function' && define.amd) {
        define(['mathjs', 'exports'], function(math, exports) {
            // Export global even in AMD case in case this script is loaded with
            // others that may still expect a global Backbone.
            root.GRank = factory(root, exports, math);
        });

        // Next for Node.js or CommonJS. jQuery may not be needed as a module.
    } else if (typeof exports !== 'undefined') {
        var math = require('mathjs');
        factory(root, exports, math);

        // Finally, as a browser global.
    } else {
        root.GRank = factory(root, {}, root.math);
    }

})(function(root, GRank, math) {

    // Graph class
    let Graph = GRank.Graph = function() {
        // default iteration number to run
        this._ITER = 2;

        // default constant value
        this._C = 0.8;

        // default lambda
        this._lambda = 0.5;

        // length of result set
        this._TOP = 5;
    }

    // Graph prototype
    Graph.prototype = Object.create({

        // setup nodelist and nodeMap that map node to its index
        nodes(nodes) {
            this.nodeList = nodes;
            this.nodeMap = new Map();
            nodes.forEach((node, index) => {
                this.nodeMap.set(node, index);
            });
            this._size = nodes.length;
            return this;
        },

        // setup nodeList
        edges(edges) {
            this.edgeList = edges;
            return this;
        },

        // retrieve node index by nodeName
        indexOf(nodeName) {
            return this.nodeMap.get(nodeName);
        },

        // create graph in adjacent matrix based on edges
        // 1 at graph(i, j) represents an edge from nodeList[i] to nodeList[j]
        init() {
            let _self = this;
            this.graph = math.eye(_self._size);
            this.edgeList.forEach(edge => {
                let indicies = [_self.indexOf(edge.source), _self.indexOf(edge.target)],
                    original = _self.graph.get(indicies);
                _self.graph.set(indicies, original + 1);
            });
            return this;
        },

        // retrieve a column from `matrix` by `index`
        getCol(matrix, index) {
            let _self = this,
                range = math.range(0, _self._size),
                indices = [];
            try {
                indices = matrix.subset(math.index(range, index)).toArray().reduce((a, b) => a.concat(b));
            } finally {
                return indices;
            }
        },

        getRow(matrix, index) {
            let _self = this,
                range = math.range(0, _self._size),
                indices = [];
            try {
                indices = matrix.subset(math.index(index, range)).toArray()[0];
            } finally {
                return indices;
            }
        },

        compute(is, js, type) {
            let tail = 0;

            for (let m = 0; m < this._size; m++) {
                if (is[m] === 0) {
                    continue;
                }
                for (let n = 0; n < this._size; n++) {
                    if (js[n] === 0) {
                        continue;
                    }
                    tail += this[type].get([m, n])
                }
            }
            return tail;
        },

        // compute similarity value for node nodeList[i] and nodeList[j]
        computeSimrank(i, j, C) {
            let _self = this;

            // similarity value of a node to itself is 1
            if (i === j) {
                return 1;
            }

            // retrieve a column as Array from graph specified by column `index`
            // row index of 1's in the array are indicies of source nodes linking to nodeList[index]
            let ini = this.getCol(_self.graph, i),
                inj = this.getCol(_self.graph, j),
                sumInI = math.sum(ini),
                sumInJ = math.sum(inj);

            // if either nodeList[i] or nodeList[j] does not linked to by any node sim(i, j) is 0
            if (sumInI === 1 || sumInJ === 1) {
                return 0;
            }

            return C / (sumInI * sumInJ) * this.compute(ini, inj, "simrank");
        },

        computePrank(i, j, C, lambda) {
            let _self = this;

            // similarity value of a node to itself is 1
            if (i === j) {
                return 1;
            }

            let ini = this.getCol(_self.graph, i),
                inj = this.getCol(_self.graph, j),
                oui = this.getRow(_self.graph, i),
                ouj = this.getRow(_self.graph, j),
                sumInI = math.sum(ini),
                sumInJ = math.sum(inj),
                sumOuI = math.sum(oui),
                sumOuJ = math.sum(ouj);

            let prefixI = 0,
                prefixO = 0;

            if (sumInI !== 1 && sumInJ !== 1) {
                prefixI = C * lambda / (sumInI * sumInJ);
            }

            if (sumOuI !== 1 && sumOuJ !== 1) {
                prefixO = C * (1 - lambda) / (sumOuI * sumOuJ);
            }

            return prefixI * this.compute(ini, inj, "prank") + prefixO * this.compute(oui, ouj, "prank");
        },

        // compute similarity matrix using P-Rank
        doPrank(attrs) {
            let _self = this,
                _attr = attrs || {},
                _iter = _attr.iter || this._ITER,
                _C = _attr.C || this._C,
                _lambda = _attr.lambda || this._lambda;

            this.prank = math.zeros(_self._size, _self._size);
            while (_iter-- > 0) {
                // update entire prank matrix
                for (let i = 0; i < this._size; i++) {
                    for (let j = 0; j < this._size; j++) {
                        this.prank.set([i, j], this.computePrank(i, j, _C, _lambda));
                    }
                }
            }
            return this;
        },

        // set pre-computed matrix
        setPrank(prankMatrix) {
            this.prank = prankMatrix.isMatrix ? prankMatrix : math.matrix(prankMatrix);
            return this;
        },

        // compute similarity matrix using SimRank
        doSimrank(attrs) {
            let _self = this,
                _attr = attrs || {},
                _iter = _attr.iter || this._ITER,
                _C = _attr.C || this._C;

            this.init();
            this.simrank = math.zeros(_self._size, _self._size);
            while (_iter-- > 0) {
                // update entire simrank matrix
                for (let i = 0; i < this._size; i++) {
                    for (let j = 0; j < this._size; j++) {
                        this.simrank.set([i, j], this.computeSimrank(i, j, _C));
                    }
                }
            }
            return this;
        },

        // retrieve similary nodes of `nodeName`
        getSimilarNodes(type, nodeName, top) {
            let _self = this,
                index = this.nodeMap.get(nodeName),
                simValues = this.getCol(this[type], index),
                result = [],
                _top = top || this._TOP;

            simValues.forEach((sim, i) => {
                if (sim !== 0 && _self.nodeList[i] !== nodeName) {
                    result.push({
                        name: _self.nodeList[i],
                        value: sim
                    });
                }
            });
            let length = result.length;
            if (length !== 0) {
                result = result.sort(_self.compare(a => a.value));
            }
            return result.slice(0, length < _top ? length : _top);
        },

        getInNodes(nodeName) {
            let inNodeList = this.getCol(this.graph, this.nodeMap.get(nodeName));
            return this.getNameList(inNodeList, nodeName);
        },

        getOutNodes(nodeName) {
            let outNodeList = this.getRow(this.graph, this.nodeMap.get(nodeName));
            return this.getNameList(outNodeList, nodeName);
        },

        getNameList(indexList, nodeName) {
            let nameList = [];
            indexList.forEach((count, index) => {
                if (count !== 0 && this.nodeList[index] !== nodeName) {
                    nameList.push({
                        name: this.nodeList[index],
                        value: count
                    });
                }
            });
            return nameList;
        },

        // comparator to sort nodes
        compare(getter) {
            return function(a, b) {
                let va = getter(a),
                    vb = getter(b);
                if (va > vb) {
                    return -1;
                } else if (va < vb) {
                    return 1;
                } else {
                    return 0;
                }
            }
        },
        echo() {
            console.log(this);
        }
    });

    return GRank;
});