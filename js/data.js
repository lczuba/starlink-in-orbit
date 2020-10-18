const data = [
    {
        name: 'Starlink Satellites',
        display: false,
        color: '#00ff00',
        url: '../data/starlink.txt',
        satellites: [],
    },
    {
        name: 'Galileo Satellites',
        display: false,
        color: '#00ff00',
        url: '../data/galileo.txt',
        satellites: [],
    },
    {
        name: 'Weather Satellites',
        display: true,
        color: '#00ff00',
        url: '../data/weather.txt',
        satellites: [],
    },
    {
        name: 'GEO Protected Zone Objects',
        display: false,
        color: '#00ff00',
        url: '../data/geo.txt',
        satellites: [],
    },
    {
        name: 'Intelsat Satellites',
        display: false,
        color: '#00ff00',
        url: '../data/intelsat.txt',
        satellites: [],
    },
    {
        name: 'COSMOS 2251 Debris',
        display: false,
        color: '#00ff00',
        url: '../data/cosmos.txt',
        satellites: [],
    },
    {
        name: 'Space Stations',
        display: false,
        color: '#00ff00',
        url: '../data/stations.txt',
        satellites: [],
    },
]

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
             return data[n];
        })
};

function getNumberOfGroupsSatellites() {
    return data.length;
}

export {getGroupSatelite, getNumberOfGroupsSatellites};