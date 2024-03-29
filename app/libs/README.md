# Third party libraries

## libs

`./netinf/`: modified netinf. 

- To invoke the `netinf` from python, the modified `netinf` executable takes cascade from stdin and pipe the network to stdout. Please refer `./netinf/ReadMe.txt` or `./netinf/netinf.cpp` for usage.

`./snap/`: full snap package from [GitHub](https://github.com/snap-stanford/snap), **required** to compile modified netinf.

`./netinf/linux/`: [download](http://snap.stanford.edu/netinf/netinf.tgz) cpp implementation for Linux/Windows

`./netinf_macos/`: [download](http://snap.stanford.edu/netinf/netinf-macos.tgz) cpp implementation for macOS

`./simrank`: cloned from [littleq0903/simrank](https://github.com/littleq0903/simrank)

## notes

### compile modified netinf

To start with, make sure you're under `/app/libs/`.

1. compile `snap`

    ```shell
    # clone snap repository
    git clone https://github.com/snap-stanford/snap

    # make
    cd snap && make
    ```

2. compile modified `netinf`

    ```shell
    # make sure you're now at /app/libs/netinf/
    cd ../netinf

    # mac
    g++ -std=c++98 -Wall -Wno-unknown-pragmas -O3 -DNDEBUG -DNOMP -o netinf netinf.cpp cascnetinf.cpp ../snap/snap-core/Snap.o -I../snap/snap-core -I../snap/snap-adv -I../snap/glib-core -I../../snap-exp

    # ubuntu
    g++ -std=c++98 -Wall -Wno-unknown-pragmas -O3 -DNDEBUG -DNOMP -o netinf netinf.cpp cascnetinf.cpp ../snap/snap-core/Snap.o -I../snap/snap-core -I../snap/snap-adv -I../snap/glib-core -I../../snap-exp -lrt -lgomp

    # make sure the executable is provided with execute permission 
    chmod +x netinf
    ```

#### refs

Intermediate and Advanced Software Carpentry - Day3: [Wrapping C/C++ for Python](http://intermediate-and-advanced-software-carpentry.readthedocs.io/en/latest/c++-wrapping.html)

AutoWIG: Automatic Wrapper and Interface Generator: [examples](http://autowig.readthedocs.io/en/stable/examples/index.html)

Boost.Python [homepage](http://www.boost.org/) ,[documentation](http://www.boost.org/doc/libs/1_64_0/) and [tutorial](http://www.boost.org/doc/libs/1_64_0/libs/python/doc/html/tutorial/index.html)

Extending Python with C or C++ official [documentation](https://docs.python.org/2/extending/extending.html)

Wrapping C++ code with python (manually) from [stackoverflow](https://stackoverflow.com/questions/43387112/wrapping-c-code-with-python-manually)

how to make python load dylib on osx from [stackoverflow](https://stackoverflow.com/questions/2488016/how-to-make-python-load-dylib-on-osx)

`ctypes` official [documentation](https://docs.python.org/2.7/library/ctypes.html)

### zss

Tree edit distance using the [Zhang Shasha algorithm](http://www.grantjenks.com/wiki/_media/ideas:simple_fast_algorithms_for_the_editing_distance_between_tree_and_related_problems.pdf) (an [overview slide](http://www.inf.unibz.it/dis/teaching/ATA/ata7-handout-1x1.pdf), another [paper](http://research.cs.queensu.ca/TechReports/Reports/1995-372.pdf)) on [GitHub](https://github.com/timtadh/zhang-shasha).

### snap

>Stanford Network Analysis Platform ([SNAP](http://snap.stanford.edu/snap/index.html)) is a general purpose, high performance system for analysis and manipulation of large networks. SNAP is written in C++ and it scales to massive graphs with hundreds of millions of nodes and billions of edges.

Source code on [GitHub](https://github.com/snap-stanford/snap). Full document can be found at [here](http://snap.stanford.edu/snap/doc.html). Example applications for advanced SNAP functionality are available
in the examples directory and described [here](http://snap.stanford.edu/snap/description.html).

[Graphviz](http://www.graphviz.org/) and [GnuPlot](http://www.gnuplot.info/) are needed.

### NETINF

>**NETINF** infers a who-copies-from-whom or who-repeats-after-whom network of news media sites and blogs using the [MemeTracker](http://memetracker.org/) dataset.

#### refs

- [About](http://snap.stanford.edu/netinf/#about) Inferring Networks of Diffusion and Influence


