const data = [
    {
        name: 'Starlink Satellites',
        display: false,
        color: '#00ff00',
        url: '../data/starlink.txt',
    },
    {
        name: 'Galileo Satellites',
        display: false,
        color: '#00ff00',
        url: '../data/galileo.txt',                                                  
    },
    {
        name: 'Weather Satellites',
        display: true,
        color: '#00ff00',
        url: '../data/weather.txt',
    },
    {
        name: 'GEO Protected Zone Objects',
        display: false,
        color: '#00ff00',
        url: '../data/geo.txt',    
    },
    {
        name: 'Intelsat Satellites',
        display: false,
        color: '#00ff00',
        url: '../data/intelsat.txt',
    },
    {
        name: 'COSMOS 2251 Debris',
        display: false,
        color: '#00ff00',
        url: '../data/cosmos.txt',
    },
    {
        name: 'Space Stations',
        display: false,
        color: '#00ff00',
        url: '../data/stations.txt',
    },
]

const handler = {
    get(target, key) {
        // console.log(`get value from: ${key}`);
        return target[key];
    },

    set(target, key, value) {
        console.log(`set value ${value} to: ${key}`);
       
        if(key === 'display') {
            target[key] = value;
            target.satellites.forEach(satellite => {
                satellite.display = target[key];
            });
            return true;
        }
        else {
            return Reflect.set(...arguments);
        }
    }
}

async function loadFile(url) {
    const req = await fetch(url)
    return req.text();
}

function parseData(text) {
    const data = [];
    text = text.split('\n');
    for(let i = 0; i < text.length;) {
        data.push([text[i], text[i+1], text[i+2]]);
        i = i+3;
    }
    return data;
}

function getGroupSatelite(n) {
    return loadFile(data[n].url)
        .then(parseData)
        .then(tleData => {
            data[n].tle = tleData;
            const objProxy = new Proxy(data[n], handler);
            return objProxy;
        })
};

function getNumberOfGroupsSatellites() {
    return data.length;
}

export { getGroupSatelite, getNumberOfGroupsSatellites };