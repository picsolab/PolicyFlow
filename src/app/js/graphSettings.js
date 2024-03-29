const css_variables = require('!css-variables-loader!../css/variables.css');
const GraphSettings = {
    // policy network settings
    pn: {
        margin: {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50
        },
        size: {
            width: 500,
            height: 500
        },
        multiplier: {},
        config: {}
    },
    
    // new diffusion view settings
    f: {
        size: {
            width: 800,
            height: 560,
            mainWidth: 650,
            mainHeight: 650,
            upperPaneHeight: 30,
            rightPaneWidth: 50,
            timeLineHeight: 30
        },
        margin: {
            timeLineBottom: 5
        },
        padding: 210,
        config: {
            smoothness: 0.35
        }
    },

    // policy view settings
    p: {
        margin: {
            top: 20,
            left: 35,
            right: 25,
            bottom: 20,
            xPadding: 0.7, // horizontal padding between rects
            yPadding: 1, // vertical padding between rects
            xOuterPadding: 0.1,
            textXShift: 0, // adjust horizontal distance between text and rect
            textYShift: 10 // adjust vertical distance between text and rect
                // modify .text-tip in style.css to adjust text style
        },
        size: {
            width: 270,
            height: 585
        },
        multiplier: {

        },
        config: {
            xMaxTick: 5,
            yMaxTick: 10
        }
    },

    // diffusion view settings
    d: {
        margin: {
            top: 25,
            left: 15,
            bottom: 25,
            right: 10,
            yLabelTransform: "translate(5,0) rotate(90)",
            xLabel: -12
        },
        size: {
            // width: 850,
            // height: 600,
            barWidth: 70,
            barHeight: 650,
            pathWidth: 700,
            pathHeight: 650,
            labelWidth: 30,
            labelHeight: 650,
            circleWidth: 700,
            circleHeight: 100,
            thickness: [5, 10],
            circle: [3, 10],
            rect: [0, 70], // barWidth
            rectHeight: 2
        },
        multiplier: {
            snapshot: 0.25,
            text: 7
        },
        config: {
            transitionTime: 1500
        }

    },

    // geo view setings
    g: {
        margin: {
            top: 40,
            left: 10,
            bottom: 10,
            right: 10,
            legendXShift: 650,
            legendTickPadding: 2
        },
        size: {
            mapHeight: 580,
            mapWidth: 940,
            legendWidth: 200,
            legendHeight: 10,
            legendTickSize: 13
        },
        multiplier: {

        },
        config: {
            legendTickNumber: 5,
            regionColorMap: {
                "northeast": css_variables["--color-a"],
                "midwest": css_variables["--color-b"],
                "south": css_variables["--color-c"],
                "west": css_variables["--color-d"]
            }
        }
    },

    // arc view settings
    a: {
        size: {
            width: 850,
            height: 600
        },
        margin: {
            margin: 20,
            spacing: 16,
            arcThickness: 1.5,
            textYShift: 15,
            arrowYShift: 10
        },
        multiplier: {
            outMin: 2.5,
            outMax: 10
        },
        transitionTime: 2500,
        nodeY: 380,
    },

    // policy trend view settings
    t: {
        margin: {
            top: 10,
            left: 50,
            right: 10,
            bottom: 50
        },
        size: {
            width: 2200,
            height: 100
        },
        multiplier: {},
        config: {
            yTickNumber: 4
        }
    },

    // network view settings
    n: {
        margin: {
            top: 10,
            left: 10,
            bottom: 10,
            right: 10,
            labelXShift: 2,
            legendYShift: 15,
            legendTextShift: 3,
            collisionMargin: 8
        },
        size: {
            height: 450,
            width: 500,
            legendWidth: 120
        },
        multiplier: {

        },
        config: {
            circleSizeDefault: 6,
            circleSizeRange: [6, 18],
            animationSwitch: true
        }
    },

    // ring view settings
    r: {
        margin: {
            top: 10,
            left: 10,
            bottom: 10,
            right: 10,
            tShiftX: 10,
            tShiftY: 10
        },
        size: {
            height: 500,
            width: 500,
            r: 250
        },
        multiplier: {

        },
        config: {}
    },

    // policy plot view settings
    pp: {
        margin: {
            top: 10,
            left: 10,
            bottom: 10,
            right: 10,
            tShiftX: 10,
            tShiftY: 10
        },
        size: {
            height: 300,
            width: 500,
        }
    }
}

module.exports = GraphSettings;