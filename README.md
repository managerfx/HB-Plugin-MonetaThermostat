# HB-Plugin-MonetaThermostat


## Features
- Expone one _thermostat sensor_ for each zone at home
- Expone a _temperature sensor_ for external temperature
- Expone a _presence sensor_ to check if thermostat is in status "At Home" / "Out Home"

## Plugin Configuration 
If you choose to configure this plugin directly instead of using the Homebridge Configuration webUI, you'll need to add the platform to your `config.json` in your home directory inside `.homebridge`.
```
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
**For most people, I recommend using Homebridge Configuration web UI to configure this plugin rather than doing so directly. It's easier to use for most users, especially newer users, and less prone to typos, leading to other problems. This plugin has a custom webUI built on top of the Homebridge webUI framework that should simplify feature configuration, and make them more accessible to users.**
