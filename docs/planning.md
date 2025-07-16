# local flitsmeister

localfm is a small local app you can run on your machine that lets you import your GDPR data export from flitsmeister and showcase all of the data in a nice way.

It is similar to https://discordpackage.com/ and spotify package explorer but for flitsmeister.

## Features

- Import your flitsmeister data from an export (zip file)
- Load the data in a nice way
- Manage different imports from different dates and view them seperately.

## Flitsmeister data export

Exporting the flitsmeister data requires the user manually going to https://account.flitsmeister.com/ and export their data there.

After a short minute wait it will provide a zip file for download.

### Structure

it contains a readme with the following content:

```md
This zip file contains all data associated to the email address of the account you have requested the right to inspect.

 - user.csv: Contains all data/settings directly related to your account.
 - trips.json: All your trip registration data.
 - products.json: Subscription linked to your account. For example Flitsmeister PRO.
 - vehicles.json: All known vehicles.
 - statistics.json: All your app usage statistics.
 - marketing.json: All attributes and events that are tracked for marketing purposes regarding your account and/or email address.
 - payments.json: All your payments.
 - reports.json: All locations of reports and ratings. If dates are missing we dont know when it happened.
```

## Rendering the data

The data contains a polyline which we should be able to render using mapbox.
