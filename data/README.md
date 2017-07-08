# Testing space

A workspace to run some data manipulations.


## Database change logs

### 20170708

For potential requirement on displaying policy description, add `policy_description` column to TABLE `pilocy`, with identical values to `policy_name` for now.

Script: `./scripts/migrate_0708_add_policy_description.sql`
Dump: run the script on previous dump file

### 20170707

584 of new policy added, 170 of overlapping old policy found, and 12601 of cascaded inserted.

Script: `./scripts/migrate_0707_add_policies.sql`
Dump: `./backup/diffusion2017vis_20170707.sql`

### 20170401

The initiating version, please refer to `v1.0` specification documentation.

Script & Dump: `./backup/diffusion2017vis_20170706.sql`


## Raw data

### Models

[Inferring Networks of Diffusion and Influence](https://arxiv.org/pdf/1006.0234.pdf ), and it's [implementation](https://github.com/flinder/NetworkInference) with R interface.

### Data sources

[Persistent Policy Pathways: Inferring Diffusion Networks in the American States](http://scholar.colorado.edu/cgi/viewcontent.cgi?article=1001&context=psci_facpapers), and their [implementation](https://github.com/dssg/policy_diffusion ) as well as [data](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/A1GIMB).

### Notes

The details of all policies and their categories are introduced by Boehmke and Skinner in appendix of [State Policy Innovativeness Revisited](http://myweb.uiowa.edu/fboehmke/Papers/boehmke-skinner2012preprint.pdf) 