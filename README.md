# diffusion2017vis

This visualization project enable users to explore and inspect policy diffusion patterns. It's a project of [PICSO lab](https://picsolab.github.io/). Check out demo [here](http://picso.org:50005/).

## setup

Clone the repository.

```shell
https://github.com/chukunx/diffusion2017vis
cd diffusion2017vis
```

### frontend

The frontend is powered by [Backbone.js](http://backbonejs.org/), [D3.js](https://d3js.org/) `v3.5.16`, [Bootstrap](http://getbootstrap.com/docs/3.3/) `v3.3.7`, [webpack](https://webpack.github.io/) `v2.2.1`, and other tools.

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

### backend and database

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
    SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://[your_database_user_name]:[your_database_password]@localhost:3306/diffusion2017vis'
    SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, 'db_repository')
    
    # set to False to disable database logs in console
    SQLALCHEMY_ECHO = True
    ```

4. Start the server.

    Start the server by executing `/server.py`.

Everything should be ready now, check out http://localhost:50005 in your browser.

## collaborate

There are two major branches, `master` and `dev`. `dev` is the main branch for development, and it is merged into `master` when a stable version is ready. 

It would be great if following rules are kept: 

- Always checkout a branch locally from `dev` to work on;
- Always comment your commit with a brief summary;
- Always prefix commit message with one of these types:
    + feature: for adding, updating features;
    + data: for generating data, processing database operations;
    + fix: for bug fixing;
    + config: for modification on configuration files;
    + minor: for all other modifications.




