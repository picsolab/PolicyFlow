# PolicyFlow

### What is Policyflow?
PolicyFlow is a visual interactive system for exploring the time-evolving patterns of policy adoption. Our tool especially serves as a comprehensive tool to help overview of US state policies over 50 states. Our tool includes: 

* 764 state policies spanning over 300 years (1691-2017)
* Those policies encompass legislations that had a great impact in history, such as medicare, abortion ban or gun control
* 18,000 policy adoption cases, each of which consists of (state, year, policy) (See the [link](https://dataverse.harvard.edu/dataverse/spid) for details about the dataset)


### What can you do with PolicyFlow?
<h1 align="center">
	<img src="https://www.dropbox.com/s/36ls7nz2lqlzyb7/policyflow-github-figure.png?raw=1" alt="PolicyFlow">
	<br>
</h1>
*(Left) Initial view of the system, (Right) system highlight

1. **Overview**: provides the underlying policy diffusion network of states as shown in (a) (colored by regions) inferred from the trajectory of policy adoptions
2. **Context**: helps users explore a context of an interest by adjusting categorical and topical, temporal and geospatial (shown with the resulting network in (c) from multiple filters)
3. **Structural details**: allows a highlight of specific structural details in the inferred relationships (in (d))
4. **Assessment**: supports to compare and evaluate the inferred general pattern for multiple policies against actual adoption cases for a policy (
5. **Socio-economic attributes**: allow users to analyze how such state attributes such as total population, minority diversity, citizen ideology, etc may be correlated to the influence of states.

(More detailed introduction can be found in the introductory video via [here]())

### Reference
Ahn, Y., & Lin, Y. R. (2020). PolicyFlow: Interpreting Policy Diffusion in Context. ACM Transactions on Interactive Intelligent Systems (TiiS), 10(2), 1-23.

### Setup

Clone the repository.

```shell
https://github.com/chukunx/diffusion2017vis
cd diffusion2017vis
```

#### frontend

The frontend is running on [Backbone.js](http://backbonejs.org/), [D3.js](https://d3js.org/) `v3.5.16` and `v4.2.2`, [Bootstrap](http://getbootstrap.com/docs/3.3/) `v3.3.7`, [webpack](https://webpack.github.io/) `v2.2.1`, and other tools.

1. Install dependencies, with [`npm`](https://www.npmjs.com/get-npm) do:

    ```shell
    npm install
    ```

2. Build

- For development, do:

    ```shell
    npm run dev
    ```

    By this, `webpack` will watch all file changes, and automatically pack `js` and resource files to `/app/static/`, template files to `/app/templates/`.

- For deployment, do:

    ```shell
    npm run build
    ```

    By this, `webpack` will minify the code bundle to reduce loading time. And it won't watch for changes.

3. Notes

    - `webpack` config files can be found through `/webpack.config.js`;
    - To look into or modify packing process, please refer to config files under `/config/`;
    - Topojson files under `/src/data/` is generated from census [shapfiles](https://www.census.gov/geo/maps-data/data/cbf/cbf_state.html), please refer to [geo map](./data/README.md#geo-map) for details.

#### backend and database

The backend is powered by [Flask](http://flask.pocoo.org/). To begin with, make sure you are under `/app/`.

1. Install dependencies.

    You may want to create an [`virtualenv`](https://virtualenv.pypa.io/en/stable/) for this app, or `pip install` all dependencies directly.

    ```shell
    # create virtual env
    virtualenv env
    
    # activation
    source env/bin/activate
    
    # install dependencies
    pip install -r requirements.txt
    ```

2. Compile the netinf executable.

    Please refer to notes [here](./app/libs/README.md) to compile the executable. This step is **required**.

3. Dump and connect to database.

    A dump file is required to setup a database at localhost. 

    Then config Flask's access to database by create a config file named `_config.py` under `/app/` with following content:

    ```python
    import os
    basedir = os.path.abspath(os.path.dirname(__file__))

    # supposing "diffusion2017vis" as the database schema name, 3306 as its port
    SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://[your_database_user_name]:[your_database_password]@localhost:3306/policyflow'
    SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, 'db_repository')
    SQLALCHEMY_TRACK_MODIFICATIONS = True
    # set to False to disable database logs in console
    SQLALCHEMY_ECHO = False
    ```

4. Start the server.

    Start the server by executing `/server.py`.

Everything should be ready now, check out http://localhost:9001 in your browser.
