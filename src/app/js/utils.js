let utils = {
    axisTimeFormat: d3.time.format.multi([
        [".%L", function(d) {
            return d.getMilliseconds();
        }],
        [":%S", function(d) {
            return d.getSeconds();
        }],
        ["%H:%M", function(d) {
            return d.getMinutes();
        }],
        ["%H:%M", function(d) {
            return d.getHours();
        }],
        ["%a %d", function(d) {
            return d.getDay() && d.getDate() != 1;
        }],
        ["%b %d", function(d) {
            return d.getDate() != 1;
        }],
        ["%B", function(d) {
            return d.getMonth();
        }],
        ["%Y", function() {
            return true;
        }]
    ]),
    generateColor: (colorStart, colorEnd, colorCount) => {
        // http://stackoverflow.com/questions/3080421/javascript-color-gradient

        // The beginning of your gradient
        var start = convertToRGB(colorStart);

        // The end of your gradient
        var end = convertToRGB(colorEnd);

        // The number of colors to compute
        var len = colorCount;

        //Alpha blending amount
        var alpha = 0.0;

        var saida = [];

        for (var i = 0; i < len; i++) {
            var c = [];
            alpha += (1.0 / len);

            c[0] = start[0] * alpha + (1 - alpha) * end[0];
            c[1] = start[1] * alpha + (1 - alpha) * end[1];
            c[2] = start[2] * alpha + (1 - alpha) * end[2];

            saida.push("#" + convertToHex(c));

        }

        return saida;

    },
    getColorMap(nodes, colorOut, colorIn) {
        // compute color list based on length of year list
        let _yearList = _.uniq(_.map(nodes, node => node.adoptedYear)).sort(),
            _colorList = this.generateColor(colorOut, colorIn, _yearList.length),
            _colorMap = {};
        _yearList.forEach((year, index) => {
            _colorMap[year] = _colorList[index];
        });
        return _colorMap;
    }
};

function hex(c) {
    var s = "0123456789abcdef";
    var i = parseInt(c);
    if (i == 0 || isNaN(c))
        return "00";
    i = Math.round(Math.min(Math.max(0, i), 255));
    return s.charAt((i - i % 16) / 16) + s.charAt(i % 16);
}

/* Convert an RGB triplet to a hex string */
function convertToHex(rgb) {
    return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
}

/* Remove '#' in color hex string */
function trim(s) { return (s.charAt(0) == '#') ? s.substring(1, 7) : s }

/* Convert a hex string to an RGB triplet */
function convertToRGB(hex) {
    var color = [];
    color[0] = parseInt((trim(hex)).substring(0, 2), 16);
    color[1] = parseInt((trim(hex)).substring(2, 4), 16);
    color[2] = parseInt((trim(hex)).substring(4, 6), 16);
    return color;
}

module.exports = utils;