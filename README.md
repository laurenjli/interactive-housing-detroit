# interactive-housing-detroit

Like many other metropolitan cities, Detroit suffers from derelict properties decaying from years of abandonment and disuse. Abandoned buildings often lower the values of surrounding properties and are linked to increased rates of crime. The city of Detroit has several methods of combatting blight and vacant buildings: monetary violations, demolitions, and sales of publically-owned land.

Blight tickets are fines issued to property owners for infractions regarding the maintenance of their property’s exterior. Detroit issues tens of thousands of blight tickets every year.

To maintain publically-owned blighted and abandoned land, Detroit has one of the largest demolitions programs in the country. The city spends tens of millions of dollars each year to demolish thousands of buildings.

Detroit Land Bank Authority is a public agency and the city’s largest landowner with a number of vacant lots and abandoned houses. The DLBA sounds land from its inventory through a number of programs, notably the Side Lot Sales, Own It Now, and Auctions programs.

You can explore the concentration of blight, demolitions, and public land sales over the past several years in the dashboard. 

# Access
You can access the dashboard at [here](https://laurenjli.github.io/interactive-housing-detroit/).

# Data
The data used for this dashboard is available on the [Detroit Open Data Portal](https://data.detroitmi.gov/).

The primary data sets used are listed below. The datasets were downloaded and parsed for the dashboard in January 2019.

[Blight violations](https://data.detroitmi.gov/Property-Parcels/Blight-Violations/ti6p-wcg4)


[Completed Demolitions](https://data.detroitmi.gov/Property-Parcels/Detroit-Demolitions/rv44-e9di)


[Side Lot Sales](https://data.detroitmi.gov/Property-Parcels/Side-Lot-Sales/mfsk-uw55)


[Auctions](https://data.detroitmi.gov/Property-Parcels/DLBA-Auctions-Closed/tgwk-njih)


[Own It Now Sales](https://data.detroitmi.gov/Property-Parcels/Own-It-Now-Sales/pyf3-v3vc)


[Detroit City Council Districts](https://data.detroitmi.gov/Government/City-Council-Districts/4vse-9zps)


[Detroit Neighborhoods](https://data.detroitmi.gov/Government/Detroit-Neighborhoods/5mn6-ihjv)

# Methodology

Mapping points: Latitude and longitude are provided in the Blight Violations, Demolitions, and Land sales datasets.

Summary Council District: The Land Sales and Demolitions datasets provided a Council District field that was used to summarize data by region. The Blight Violations dataset does not provide this information. A st_intersection (R, sf package) was used with a shapefile containing Council District information to match to points in the Blight Violation dataset in a relatively consistent way.

Summary by Neighborhood: Note that neighborhoods are very fluid boundaries and within the Neighborhood data set there are multiple old and new neighborhoods. The dropdown uses new neighborhood names but as this dataset spans several years, there may be some discrepancies. 

The land sales and demolitions datasets provided a Neighborhood field that was used to summarize data by region.  The Blight Violations dataset does not provide this information. An intersection with neighborhood polygons was tested, but it led to inconsistent matches between blight tickets and neighborhood regions due to the small polygons and multiple crossovers between old and new neighborhoods. As a result, when the user chooses to view by Neighborhood, there will not be a bar chart summary for blight violations. 

# Pipeline

index.html: contains overall HTML wrapper for the dashboard 
script.js: contains code to populate and control the dashboard buttons, charts, and map
main.css: contains CSS styling dashboard layout and themes

To access the files, you can clone this repository. If you use a development http server (such as live-server) you can run the dashboard locally. You can also access the dashboard [here](https://laurenjli.github.io/interactive-housing-detroit/).



