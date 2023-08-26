# Maxmind GeoLite2 database API for geolocating ip addresses

With automatic update of the GeoLite2 database

## Usage example

```typescript
import { IMaxMindOptions, startGeoIP } from 'maxmind-geo-ip';

export const maxMindOptions: IMaxMindOptions = {
  licenseKey: '-= license key =-', // https://support.maxmind.com/hc/en-us/sections/1260801610490-Manage-my-License-Keys
  maxItemsInCache: 10000, // https://www.npmjs.com/package/maxmind See "Options"
  updateSchedule: '0 0 * * 3,6', //  At 00:00 on Wednesday and Saturday. See https://support.maxmind.com/hc/en-us/articles/4408216129947
  dbDir: './mm-db' // Default: ./maxmind-db
};

const geoIp = await startGeoIP(maxMindOptions);
if (geoIp) {
  const result = geoIp.lookupEx('103.100.173.193', 'en');
  console.log(result)
}
```

expected result:

    {
        continent: 'Asia',    
        continentCode: 'AS',  
        country: 'Indonesia',
        countryISOCode: 'ID',
        city: undefined,      
        latitude: -6.1728,    
        longitude: 106.8272,  
        postalCode: undefined,
        subdivision: undefined
    }

## Automatic update of the GeoLite2 database

**To receive database updates, you need to obtain a maxmind
[license key](https://support.maxmind.com/hc/en-us/sections/1260801610490-Manage-my-License-Keys)**.

Checking for a new version of the database and updating occurs according to the schedule specified in the `updateSchedule` parameter.   
Default: `0 0 * * 3,6` - At 00:00 on Wednesday and Saturday  

links:
- [Crontab guru](https://crontab.guru/)   
- [Download and Update Databases](https://support.maxmind.com/hc/en-us/articles/4408216129947)
