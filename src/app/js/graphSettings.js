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

    // bar view settings
    b: {

    },

    // network view settings
    n: {

    }
}

module.exports = GraphSettings;