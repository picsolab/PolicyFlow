# Testing space

A workspace to run some data manipulations.


## Database change logs

### 20170829

backup.

Dump: `./backup/diffusion2017vis_20170829.sql`

### 20170825

create `policy_similarity` table.

Script:

- ddl: `./scripts/migrate_0825_add_policy_similarity_table.sql`


### 20170817

update improved policy LDA clusters: add `policy_lda_3`;

Script: 

- update `policy`: `./scripts/migrate_0817_update_policy_ldas.sql`


### 20170812

update policy LDA clusters. 6 clusters for the first layer, 10 clusters for the second layer. Terms for each cluster are presented at `./raw/lda_term/0/lda_term_*.txt`.

Script:

- update `policy`: `./scripts/migrate_0812_update_policy_ldas.sql`

- computation: `./scripts/textLDA.py`


### 20170807

update major topics and add lda labels to `policy`

All 773 policies have been altered according to the newest data. According to output log: 464 policies are updated with new major topic, the others are labeled as 98: Unknown. Within these "Unknown"s, 290 policies that are found in the data set haven't been labeled as any major topic, 19 policies are from old data set that do not have new major topic assigned.

Policies from {Agriculture(2), Defense(1), Foreign Trade(1), Immigration(2), Public Lands(2), Technology(1)} are removed due to insufficiency in amount to calculate network.

Script:

- update schema: `./scripts/migrate_0807_add_lda_n_update_subject.sql`

- update subject id: `./scripts/migrate.py -o u`

Dump: `./backup/diffusion2017vis_20170807.sql`

topics in new data are as follow.

```
>>> df.majortopic.unique().describe()
                       counts  freqs
categories
Macroeconomics              1   0.05
Civil Rights                1   0.05
Health                      1   0.05
Agriculture                 1   0.05
Labor                       1   0.05
Education                   1   0.05
Environment                 1   0.05
Energy                      1   0.05
Immigration                 1   0.05
Transportation              1   0.05
Law and Crime               1   0.05
Social Welfare              1   0.05
Housing                     1   0.05
Domestic Commerce           1   0.05
Defense                     1   0.05
Technology                  1   0.05
Foreign Trade               1   0.05
Government Operations       1   0.05
Public Lands                1   0.05
NaN                         1   0.05
```

code book:

```
{
    "Macroeconomics": { "id": 1, "valid": 1 },
    "Civil Rights": { "id": 2, "valid": 1 },
    "Health": { "id": 3, "valid": 1 },
    "Agriculture": { "id": 4, "valid": 1 },
    "Labor": { "id": 5, "valid": 1 },
    "Education": { "id": 6, "valid": 1 },
    "Environment": { "id": 7, "valid": 1 },
    "Energy": { "id": 8, "valid": 1 },
    "Immigration": { "id": 9, "valid": 1 },
    "Transportation": { "id": 10, "valid": 1 },
    "Law and Crime": { "id": 12, "valid": 1 },
    "Social Welfare": { "id": 13, "valid": 1 },
    "Housing": { "id": 14, "valid": 1 },
    "Domestic Commerce": { "id": 15, "valid": 1 },
    "Defense": { "id": 16, "valid": 1 },
    "Technology": { "id": 17, "valid": 1 },
    "Foreign Trade": { "id": 18, "valid": 1 },
    "International Affairs": { "id": 19, "valid": 1 },
    "Government Operations": { "id": 20, "valid": 1 },
    "Public Lands": { "id": 21, "valid": 1 },
    "Arts and Entertainment": { "id": 23, "valid": 0 },
    "Government Administration": { "id": 24, "valid": 0 },
    "Weather": { "id": 26, "valid": 0 },
    "Fires": { "id": 27, "valid": 0 },
    "Sports": { "id": 29, "valid": 0 },
    "Death Notices": { "id": 30, "valid": 0 },
    "Religion": { "id": 31, "valid": 0 },
    "Other": { "id": 99, "valid": 0 },
    "Unknown": { "id": 98, "valid": 1 }
}
```

```
updated: 464, unknown: 290, raw: 19
```


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