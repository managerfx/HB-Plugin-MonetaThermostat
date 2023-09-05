# HB-Plugin-MonetaThermostat


## Features
- Expone one _thermostat sensor_ for each zone at home
- Expone a _temperature sensor_ for external temperature
- Expone a _presence sensor_ to check if thermostat is in status "At Home" / "Out Home"

## Configuration file example

```json
{
    "bridge": {
        ...
    },
    "accessories": [],
    "platforms": [
        ...,
        {
            "name": "Moneta Thermostat",
            "platform": "moneta-thermostat-platform",
            "accessToken": "eiayJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
            "zonesNames": ["Soggiorno", "Camera da Letto", "Cameretta"] // Optional and positional
        }
    ]
}
```
