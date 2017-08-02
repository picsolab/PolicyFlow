# Testing space

A workspace to run some data manipulations.


## Database change logs


### 20170801

Create table `policy_text` for policy description text.

Script: `./script/migrate_0801_add_policy_text_table.sql`

Dump: same to the previous

### 20170708

For potential requirement on displaying policy description, add `policy_description` column to TABLE `pilocy`, with identical values to `policy_name` for now.

Script: `./scripts/migrate_0708_add_policy_description.sql`

Dump: run the script on previous dump file

### 20170707

Totally, there are 755 policies in this dataset. All adoptions by either state from {'DC' 'GU', 'PR', 'VI'} are removed before insert to database. 151 policies are affected by this rule. Specially, policy `healthcareconsentact1982` is removed since it contains only 'VI'.

584 of new policy added, 170 of overlapping old policy found, and 12601 of cascaded inserted.

By appending the new dataset, the total number of policy becomes 773, with 18696 adoptions from all 50 states.

some stats on `len(description)`:

mode: 33, median: 46, mean: 53, max: 222

Script: 

- update database schema: `./scripts/migrate_0707_add_policies.sql`

- append new data to database: `./scripts/migrate.py`

Dump: `./backup/diffusion2017vis_20170707.sql`

### 20170401

The initiating version, please refer to `v1.0` specification documentation.

>189 policies, 6196 adoptions.

Script & Dump: `./backup/diffusion2017vis_20170706.sql`


## Raw data

### geo map

#### data manipulation

convert shapefiles to topojson: 

download the shape file from [census](https://www.census.gov/geo/maps-data/data/cbf/cbf_state.html)

with tools:

```
# brew install gdal
npm install shapefile -g
npm install topojson -g
npm install ndjson-cli -g
```

do:

```shell
# convert to geojson with gdal
# ogr2ogr -f "GeoJSON" states.geo.json ../raw/cb_2016_us_state_5m/cb_2016_us_state_5m.shp

# convert shapefiles to topojson
shp2json -n [input .shp with .shx and .dbf in same directory] | ndjson-reduce 'p.features.push({type: "Feature", properties: {id: d.properties.STUSPS, gid: d.properties.GEOID}, geometry: d.geometry}), p' '{type: "FeatureCollection", features: []}' | geo2topo states=- > [output]

# Unify and simplify
toposimplify -P 0.1 ./app/data/states.topo.json -o ./app/data/states.p1.topo.json
```

move topojson files to `/app/static/data/states.topo.json`

shapefiles can also be found at [Census.gov › Geography › Maps & Data › Cartographic Boundary Shapefiles](https://www.census.gov/geo/maps-data/data/tiger-cart-boundary.html), and so much pregenerated map data can be found at [Mapzen](https://mapzen.com/data/borders/), 
[jgoodall](https://github.com/jgoodall/us-maps), [mbostock for v3](https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/us.json), and [us-atlas for v4](https://unpkg.com/us-atlas@1/us/10m.json)

Census Bureau-designated regions and divisions from [wikipedia](https://en.wikipedia.org/wiki/List_of_regions_of_the_United_States#Census_Bureau-designated_regions_and_divisions), [state-wise abbrivation list](https://en.wikipedia.org/wiki/List_of_U.S._state_abbreviations), [list contains abbrivation](http://researchertools.blogspot.com/2012/09/excel-file-with-us-states-abbreviations.html) and [pdf from census](https://www2.census.gov/geo/pdfs/maps-data/maps/reference/us_regdiv.pdf)


#### refs.

[GeoJSON spec](http://geojson.org/geojson-spec.html), and [RFC 7946](https://tools.ietf.org/html/rfc7946).

### NETINF

#### Models

[Inferring Networks of Diffusion and Influence](https://arxiv.org/pdf/1006.0234.pdf ), and it's [implementation](https://github.com/flinder/NetworkInference) with R interface.

#### Data sources

[Persistent Policy Pathways: Inferring Diffusion Networks in the American States](http://scholar.colorado.edu/cgi/viewcontent.cgi?article=1001&context=psci_facpapers), and their [implementation](https://github.com/dssg/policy_diffusion ) as well as [data](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/A1GIMB).

#### Notes

The details of all policies and their categories are introduced by Boehmke and Skinner in appendix of [State Policy Innovativeness Revisited](http://myweb.uiowa.edu/fboehmke/Papers/boehmke-skinner2012preprint.pdf) 