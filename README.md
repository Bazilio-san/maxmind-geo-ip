# Maxmind GeoIP

Getting geolocation information by IP address.

Automatic update of the GeoIP database

```typescript
import { IMaxMindOptions, startGeoIP } from 'maxmind-geo-ip';

export const maxMindOptions: IMaxMindOptions = {
  licenseKey: '-= license key =-', // See: https://support.maxmind.com/hc/en-us/sections/1260801610490-Manage-my-License-Keys
  maxItemsInCache: 10000, // https://www.npmjs.com/package/maxmind
  updateSchedule: '0 0 * * 3,6' //  At 00:00 on Wednesday and Saturday // See: https://support.maxmind.com/hc/en-us/articles/4408216129947
};

const geoIp = await startGeoIP(maxMindOptions);
if (geoIp) {
  const result = geoIp.lookupEx('103.100.173.193', 'en');
  console.log(result)
}

/*
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
*/
```
