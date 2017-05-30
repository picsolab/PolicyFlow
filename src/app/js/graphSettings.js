const GraphSettings = {
    // policy view settings
    p: {
        margin: {
            top: 20,
            left: 35,
            right: 25,
            bottom: 10,
            xPadding: 0.7, // horizontal padding between rects
            yPadding: 1, // vertical padding between rects
            xOuterPadding: 0.1,
            textXShift: 0, // adjust horizontal distance between text and rect
            textYShift: 10 // adjust vertical distance between text and rect
                // modify .text-tip in style.css to adjust text style
        },
        size: {
            width: 250,
            height: 600
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
            top: 10,
            left: 15
        },
        size: {
            width: 850,
            height: 600,
            barWidth: 100,
            pathWidth: 600,
            circleHeight: 100,
            thickness: [5, 10],
            circle: [5, 10]
        },
        multiplier: {

        },
        config: {

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

    // bar view settings
    b: {

    },

    // network view settings
    n: {

    }
}

module.exports = GraphSettings;