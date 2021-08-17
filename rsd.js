/**
 * A Ráckevei–Soroksári-Duna interaktív vízisport-térképe
 *
 * (C) 2021 Bakó Tamás & Mátyás Gede, ELTE Eötvös Loránd University, Budapest
 *
 * This program is free software; you can redistribute it and/or modify it under the terms 
 * of the GNU General Public License as published by the Free Software Foundation; 
 * either version 2 of the License, or (at your option) any later version.
 */
 
//Stílus az ikonoknak
var helyIkon = L.icon({
    iconUrl: 'imagemap/location.png',
    iconSize: [40, 40]
});

var hotelIkon = L.icon({
    iconUrl: 'imagemap/hotel.png',
    iconSize: [40, 40], popupAnchor: [0, -10], tooltipAnchor: [10, 0]
});

var etteremIkon = L.icon({
    iconUrl: 'imagemap/etterem.png',
    iconSize: [40, 40], popupAnchor: [0, -10], tooltipAnchor: [10, 0]
});

var cshIkon = L.icon({
    iconUrl: 'imagemap/csh.png',
    iconSize: [40, 40], popupAnchor: [0, -10], tooltipAnchor: [10, 0]
});

var strandIkon = L.icon({
    iconUrl: 'imagemap/strand.png',
    iconSize: [40, 40], popupAnchor: [0, -10], tooltipAnchor: [10, 0]
});

var vmIkon = L.icon({
    iconUrl: 'imagemap/vm.png',
    iconSize: [40, 40], popupAnchor: [0, -10], tooltipAnchor: [10, 0]
});

var szoborIkon = L.icon({
    iconUrl: 'imagemap/szobor.png',
    iconSize: [40, 40], popupAnchor: [0, -10], tooltipAnchor: [10, 0]
});

var limanyIkon = L.icon({
    iconUrl: 'imagemap/limany.png',
    iconSize: [40, 40]
});

var fkmIkon = L.icon({
    iconUrl: 'imagemap/fkm.png',
    iconSize: [40, 40]
});

var kotelezomegallasIkon = L.icon({
    iconUrl: 'imagemap/kotelezomegallas.png',
    iconSize: [40, 40]
});

var kompIkon = L.icon({
    iconUrl: 'imagemap/komp.png',
    iconSize: [40, 40]
});

var felsovezetekIkon = L.icon({
    iconUrl: 'imagemap/felsovezetek.png',
    iconSize: [40, 40]
});	

var tiloskikotniIkon = L.icon({
    iconUrl: 'imagemap/felsovezetek.png',
    iconSize: [40, 40]
});	

//Objektumtípusokhoz megjelenő név
var dName={
    limany: 'limány',
    
    allohajo: 'állóhajó',
    steg: 'stég',
    
    nad: 'nád',
    sas: 'sás'
}

function displayName(t) {
    return dName[t]||t;
}

//Térkép objektum
var map = L.map('terkep_helye',{
    maxZoom: 20,
    //maxBounds: [[47.479872, 18.936847],[46.992220, 19.136007]]
}).setView([47.43421, 19.08799], 17);

//Rétegsorrend
map.createPane('novenyzetpane');
map.getPane('novenyzetpane').style.zIndex = 220;
map.createPane('parttipusokpane');
map.getPane('parttipusokpane').style.zIndex = 225;
map.createPane('kikotohelypane');
map.getPane('kikotohelypane').style.zIndex = 230;	

//Maptiler vector tile réteg: háttértérkép
var gl = L.mapboxGL({
    attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
    //style: 'https://api.maptiler.com/maps/38f29785-a56d-4c2b-83e8-fbb072cd44a1/style.json?key=0t17Kubt2gQetLAE415b'
    style: 'https://api.maptiler.com/maps/40b1d6d8-b613-4fa2-b62a-8972acd989a4/style.json?key=0t17Kubt2gQetLAE415b'
}).addTo(map);

//Google műholdkép réteg
var googleSat = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});

// batimetria színei
var colors=[
    { d: 5, c: 'rgb(1,87,155)' },
    { d: 4, c: 'rgb(2,109,189)' },
    { d: 3, c: 'rgb(5,115,213)' },
    { d: 2.5, c: 'rgb(11,128,235)' },
    { d: 2, c: 'rgb(18,149,244)' },
    { d: 1.5, c: 'rgb(41,182,246)' },
    { d: 1, c: 'rgb(79,195,247)' },
    { d: 0.6, c: 'rgb(129,212,250)' },
    { d: 0.4, c: 'rgb(179,229,252)' },
    { d: 0.2, c: 'rgb(235,245,254)' }
]
function depthcolor(d) {
    for (var i=0;i<colors.length;i++)
        if (d>=colors[i].d)
            return colors[i].c;
    return 'rgb(240,248,254)';
}
var t0=new Date()
// RSD vízmélység vector tile réteg
var vl=L.vectorGrid.protobuf('depthtiles/{z}/{x}/{y}.pbf', {
    maxZoom: 20,
    maxNativeZoom: 15,
    interactive: true,
    vectorTileLayerStyles: {
        depth: function(p,z) {
            return {
                weight: 0,
                fillColor: depthcolor(parseFloat(p.ELEVATION)),
                fillOpacity: 1,
                fill: true
            }
        }
    }
}).addTo(map);
vl.setZIndex(5);
vl.bindPopup(f=>'vízmélység '+f.properties.NAME+' m');

//Rétegkezelő
var alap = {'Térkép': gl, 'Műhold': googleSat};
//var fedveny = {'Kiötőhelyek': kikotohely};
var retegkezelo = L.control.layers(alap).addTo(map);

//geoJSON réteg: Növényzet
fetch('layers/rsdNovenyzet.geojson').then(r=>r.json()).then(function(data) {
var novenyzet = L.geoJSON(data, { pane: 'novenyzetpane',
    style: function(feature) {
        switch (feature.properties.tipus) {
            case 'hinar': return {color: "#B8FFEC", fillOpacity: 0.2, opacity: 0.5,};
            case 'nad': return {color: "#BFF8C7", fillOpacity: 1, opacity: 0.5,};
        }
    }
}).addTo(map).bindTooltip(l=>displayName(l.feature.properties.tipus));
// TODO: tooltip a mutatónál nyíljon meg.
/*novenyzet.eachLayer(function(l) {
    l.on('mouseover',function(e){
        e.target.setTooltip(displayName(l.feature.properties.tipus));
    })
});*/
retegkezelo.addOverlay(novenyzet, 'Növényzet');
});

//geoJSON réteg: Hidak
fetch('layers/rsdHidak.geojson').then(r=>r.json()).then(function(data) {
var hidak = L.geoJSON(data, {
    style: function(feature) {
        switch (feature.properties.tipus) {
            case 'kozlekedes': return {color: "#FFFFFF", opacity: 1, weight: 8,};
            case 'kozmuvezetek': return {color: "#FFFFFF", opacity: 0.8,  weight: 2,};
            case 'komp': return {color: "#0046b8", opacity: 0.5,  weight: 2, dashArray: [2, 6,],};
            case 'felsovezetek': return {color: "#000000", opacity: 0.5,  weight: 2, dashArray: [2, 6,],};
        }
    }
}).addTo(map);
});

//geoJSON réteg: Parttípusok
fetch('layers/rsdParttipusok.geojson').then(r=>r.json()).then(function(data) {
var parttipusok = L.geoJSON(data, { pane: 'parttipusokpane',
    style: function(feature) {
        switch (feature.properties.tipus) {
            case 'lankas': return {color: "#EBE4A9", opacity: 1, weight: 5,};
            case 'meredek': return {color: "#BBB393", opacity: 1,  weight: 5,};
            case 'alamosott': return {color: "#BBB393", opacity: 1,  weight: 5, dashArray: [8, 10,],};
            case 'felhanyt': return {color: "#BFBFBF", opacity: 1,  weight: 5, dashArray: [8, 10,],};
            case 'lejtos': return {color: "#7F7F7F", opacity: 1,  weight: 5, dashArray: [8, 10,],};
            case 'fuggoleges': return {color: "#404040", opacity: 1,  weight: 5, dashArray: [8, 10,],};
            case 'javitott': return {color: "#5B9BD5", opacity: 1, weight: 5,};
        }
    }
}).addTo(map);
retegkezelo.addOverlay(parttipusok, 'Partvonal');
});

//geoJSON réteg: Kikötőhelyek
var kikotohely;
fetch('layers/rsdKikotohelyek.geojson').then(r=>r.json()).then(function(data) {
kikotohely = L.geoJSON(data, { pane: 'kikotohelypane',
    style: function(feature) {
        switch (feature.properties.tipus) {
            case 'steg': return {color: "#CC99FF", fillOpacity: 1, opacity: 1,};
            case 'ponton': return {color: "#F69BFD", fillOpacity: 1, opacity: 1,};
            case 'magassteg': return {color: "#000000", fillColor: "#CC99FF", fillOpacity: 1, opacity: 0.5,};
            case 'allohajo': return {color: "#7F6387", fillOpacity: 1, opacity: 1,};
            case 'molo': return {color: "#D9D9D9", fillOpacity: 1, opacity: 1,};
            case 'rom': return {color: "#000000", fillOpacity: 0, opacity: 0.5,};
        }
    }
})
.addTo(map).bindTooltip(l=>displayName(l.feature.properties.tipus));
retegkezelo.addOverlay(kikotohely, 'Kikötőhelyek');
});

//geoJSON réteg: Alappont
var alappontIkonok={
    'fkm': fkmIkon,
    'limany': limanyIkon,
    'tablakomp': kompIkon,
    'tablamegallas': kotelezomegallasIkon,
    'tablatiloskikotni': tiloskikotniIkon,
    'tablavezetek': felsovezetekIkon
}
/*fetch('layers/rsdAlappont.geojson').then(r=>r.json()).then(function(data) {
var alappont = L.geoJSON(data, {
    pointToLayer: function(f,ll) {
        return L.marker(ll,{icon: alappontIkonok[f.properties.tipus]})
    }
})
.bindTooltip(function (layer)
    {return String(layer.feature.properties.nev)},
    {permanent: false, opacity: 0.9}
)
.addTo(map);
retegkezelo.addOverlay(alappont, 'Alappontok');
});*/

var x=new XMLHttpRequest();
x.open('get','layers/rsdAlappont.geojson',false);
x.send();
// válasz értelmezése
var valasz=JSON.parse(x.responseText);
L.geoJSON(valasz,{
        pointToLayer: function (f, ll) {
            if (f.properties.nev>0)
                return L.marker(ll, {icon: L.icon({iconUrl:svgIcon(f.properties.nev),iconSize:[32,32],iconAnchor:[16,16]})});
            else
                return L.marker(ll,{icon: alappontIkonok[f.properties.tipus]})
        }
}).addTo(map).bindTooltip(l=>displayName(l.feature.properties.tipus));

function svgIcon(text) {
    return 'data:image/svg+xml;utf8,'+escape('<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect x="0" y="0" rx="10" ry="10" width="40" height="32" style="fill: #00000050; stroke: none;"/><text x="10" y="22" style="font-family:arial;font-size:20px;fill:white;">'+text+'</text></svg>')
}

//geoJSON réteg: Poi
var poi,poidata;
fetch('layers/rsdPoi.geojson').then(r=>r.json()).then(function(data) {
    poidata=data;
    poi = L.geoJSON(data, {
        pointToLayer: function(f,ll) {
            return L.marker(ll,{icon: getIconPoi(f.properties.tipus)})
        }
    })
    .bindPopup(function (layer)
        {return String(
            "<b>" + layer.feature.properties.nev + "</b>" + "<br>" +
            (layer.feature.properties.nyitva?"Nyitvatartás: " + layer.feature.properties.nyitva + "<br>":"") +
            (layer.feature.properties.telefon?"Telefonszám: " + layer.feature.properties.telefon + "<br>":"") +
            (layer.feature.properties.email?"E-mail: " + layer.feature.properties.email + "<br>":"") +
            (layer.feature.properties.web?'Weboldal: <a target="_blank" href="'+layer.feature.properties.web+'">' + layer.feature.properties.web + "</a><br/>":"") +
            (layer.feature.properties.megjegyzes?"<span style='background-color:PaleTurquoise;'>" + layer.feature.properties.megjegyzes + "</span>":"")
            )
        },
        //{permanent: false, opacity: 0.9}
    )
    .bindTooltip(function (layer)
        {return String(layer.feature.properties.nev)},
        {permanent: false, opacity: 0.9, direction: 'right'}
    )
    .addTo(map);
    retegkezelo.addOverlay(poi, 'Helyek');
    
    var hintlist = document.getElementById('javaslatok');
    var hintlayer = poi.getLayers();
    hintlist.innerHTML='';
    for (var i=0; i < hintlayer.length; i++) {
        var name = hintlayer[i].feature.properties['nev'];
        hintlist.innerHTML+='<option value="'+name+'"/>';
    }
    //console.log(poidata);
});		

function getIconPoi(tipus) {
    return	tipus == 'hotel' ? hotelIkon:
            tipus == 'etterem' ? etteremIkon:
            tipus == 'csh' ? cshIkon:
            tipus == 'strand' ? strandIkon:
            tipus == 'vm' ? vmIkon:
            tipus == 'szobor' ? szoborIkon:
            szoborIkon;
}

//geoJSON réteg: Középvonal
var kvkoord;
var kozepvonal;
fetch('layers/rsdVonal.geojson').then(r=>r.json()).then(function(data) {
    kozepvonal = L.geoJSON(data, {
        style: function(feature) {
            return {color: "#ff2222", fillOpacity: 1, opacity: 0.5,};
        }
    })//.addTo(map);
    //retegkezelo.addOverlay(kozepvonal, 'Középvonal');
    kvkoord=kozepvonal.getLayers()[0].feature.geometry.coordinates[0];
    //console.log(kvkoord)
});

//Rétegsorrend

function layerOrder() {
    kikotohely.eachLayer(function (layer) {
    layer.setZIndexOffset(2000);
    });
    novenyzet.eachLayer(function (layer) {
    layer.setZIndexOffset(1000);
    });
}


//Tartózkodási hely
var locmarker = null;
var loccircle;

function onLocationFound(e) {
    closeAll();
    document.getElementById('helyesgomb').style.display="flex";
    document.getElementById('helygomb').style.display="none";

    var radius = e.accuracy / 2;
    var loc = e.latlng

    if (locmarker == null) {
        locmarker=L.marker(loc, {icon: helyIkon}).on('click', delLocation).addTo(map);
        loccircle=L.circle(loc, radius).addTo(map);
    }
    else{
        locmarker.setLatLng(loc);
        loccircle.setLatLng(loc);
        loccircle.setRadius(radius);
    }
}

function onLocationError(e) {
    alert(e.message);
}

function getLocationLeaflet() {
    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);

    map.locate({setView: true, maxZoom: 16});
}

function delLocation() {
    map.removeLayer(locmarker);
    map.removeLayer(loccircle);
    locmarker = null;
    loccircle = null;

    document.getElementById('helyesgomb').style.display="none";
    document.getElementById('helygomb').style.display="flex";
}

//Kezdőpont
function locateHome() {
    map.setView([47.434214, 19.087993], 17);
    closemenu();
}

//Áttekintőtérkép megnyitása
function showOverview() {
    closeAll();
    document.getElementById('attekintoterkep').style.display="block";
    document.getElementById('attekintobezaras').style.display="flex";
    document.getElementById('attekintomegnyitas').style.display="none";
}

//Áttekintőtérkép bezárása
function hideOverview() {
    document.getElementById('attekintoterkep').style.display="none";
    document.getElementById('attekintobezaras').style.display="none";
    document.getElementById('attekintomegnyitas').style.display="flex";
}

//Áttekintőtérkép ugrás
function kvassayzsilip() {
    map.setView([47.461359, 19.071478], 15);
    hideOverview();
}

function pesterzsebet() {
    map.setView([47.429929, 19.090537], 15);
    hideOverview();
}

function csepel() {
    map.setView([47.404673, 19.103524], 15);
    hideOverview();
}

function soroksar() {
    map.setView([47.394158, 19.109147], 15);
    hideOverview();
}

function dunaharaszti() {
    map.setView([47.359229, 19.078669], 15);
    hideOverview();
}

function dunavarsany() {
    map.setView([47.312870, 19.035241], 15);
    hideOverview();
}

function majoshaza() {
    map.setView([47.271276, 18.990162], 15);
    hideOverview();
}

function szigetszentmarton() {
    map.setView([47.227191, 18.967657], 15);
    hideOverview();
}

function rackeve() {
    map.setView([47.159151, 18.948833], 15);
    hideOverview();
}

function domsod() {
    map.setView([47.095805, 18.997219], 15);
    hideOverview();
}

function tassizsilip() {
    map.setView([47.036923, 18.979255], 15);
    hideOverview();
}

//Navigáció
var aPont = null
var bPont = null
var aPontVonalon = null
var bPontVonalon = null
var tav, utvonal, pl
var exit = false

//A pont
function aPontLerakas(e) {
    if (exit) 
        return;
    
    var location = e.latlng;
    if (aPont == null) {
        aPontVonalonKoord = L.GeometryUtil.closest(map, kozepvonal.getLayers()[0], location);
        if (map.distance(aPontVonalonKoord,location)>200) {
            alert('A pont túl messze van a vízparttól!');
            return;
        }
        aPont = new L.marker(location).addTo(map);
        console.log(aPontVonalonKoord);
        aPontVonalon = new L.marker(aPontVonalonKoord)//.addTo(map);
        document.getElementById('kezdopontcimke').style.display="none";
        document.getElementById('vegpontcimke').style.display="block";
        map.off('click',aPontLerakas);
        map.on('click', bPontLerakas);
    }
}

function aPontKijeloles(e) {
    if (exit) {
        return;
    }
    vl.unbindPopup();
    map.on('click', aPontLerakas);
    document.getElementById('kezdopontcimke').style.display="block";
    document.getElementById('xutvonaltervgomb').style.display="flex";
    document.getElementById('utvonaltervgomb').style.display="none";
    document.getElementById('xutvonalfelso').style.display="block";
    document.getElementById('utvonalfelso').style.display="none";
    closeAll();
}

//B pont
var lefele;
function bPontLerakas(e) {
    if (exit) {
        return;
    }
    var location = e.latlng
    if (bPont == null) {
        bPontVonalonKoord = L.GeometryUtil.closest(map, kozepvonal.getLayers()[0], location);
        if (map.distance(bPontVonalonKoord,location)>200) {
            alert('A pont túl messze van a vízparttól!');
            return;
        }
        bPont = new L.marker(location).addTo(map);
        bPontVonalon = new L.marker(bPontVonalonKoord)//.addTo(map);
    }
    map.off('click',bPontLerakas);
    vl.bindPopup(f=>'vízmélység '+f.properties.NAME+' m');
    if (aPontVonalon.getLatLng().lat>bPontVonalon.getLatLng().lat) {
        // A-B eszak-del
        var kp=aPont.getLatLng(), kpv=aPontVonalon.getLatLng();
        var vp=bPont.getLatLng(), vpv=bPontVonalon.getLatLng();
        lefele=true;
    }
    else {
        // A-B del-eszak
        var vp=aPont.getLatLng(), vpv=aPontVonalon.getLatLng();
        var kp=bPont.getLatLng(), kpv=bPontVonalon.getLatLng();
        lefele=false;
    }
    utvonal=[kp,kpv];
    // i-t addig növeljük, míg az i. pontja a kv-nak már nincs északabbra a kpv-nél
    for(var i=0;kvkoord[i][1]>kpv.lat&&i<kvkoord.length;i++);
    // i-t tovább növeljük, amíg északabbra vagyunk a vpv-től, és közben minden i. pontot beteszünk az útvonalba
    for(;kvkoord[i][1]>vpv.lat&&i<kvkoord.length;i++)
        utvonal.push(L.latLng(kvkoord[i].slice().reverse()));
    utvonal.push(vpv);
    utvonal.push(vp);
    pl=L.polyline(utvonal,{color:'#c55a5a'}).addTo(map);
    pontostav=L.GeometryUtil.length(utvonal);
    tav=(Math.round(L.GeometryUtil.length(utvonal)/10))/100;
    
    document.getElementById("tavolsag").innerHTML = tav;
    document.getElementById('vegpontcimke').style.display="none";
    document.getElementById('utvonaladatok').style.display="flex";
    idokiszamitas();
}

function idokiszamitas() {
    var sebesseg = document.querySelector('input[name = "hajotipus"]:checked').value;
    var evezestempo = document.getElementById("slider").value/10;
    var ido
    if (lefele) {
        ido = Math.round(pontostav/sebesseg*evezestempo/60*0.9);
    } else {
        ido = Math.round(pontostav/sebesseg*evezestempo/60);
    }

    document.getElementById("idotartam").innerHTML = ido
    console.log(tav);
    console.log(evezestempo);
    console.log(sebesseg);
    console.log(ido);		
}	

function openHajourlap() {
    document.getElementById('hajourlapablak').style.display="block";
}

function closeHajourlap() {
    document.getElementById('hajourlapablak').style.display="none";
}

function hajonev(nev) {
    console.log(nev);
    document.getElementById('hajourlapmegnyitas').innerHTML=nev;
}

function kilepes() {
    exit = true;
    document.getElementById('kezdopontcimke').style.display="none";
    document.getElementById('vegpontcimke').style.display="none";
    document.getElementById('xutvonaltervgomb').style.display="none";
    document.getElementById('utvonaltervgomb').style.display="flex";
    document.getElementById('xutvonalfelso').style.display="none";
    document.getElementById('utvonalfelso').style.display="block";
    document.getElementById('utvonaladatok').style.display="none";
    document.getElementById('hajourlapablak').style.display="none";
    if (aPont) {
        map.removeLayer(aPont);
        map.removeLayer(aPontVonalon);
    }
    if (bPont) {
        map.removeLayer(bPont);
        map.removeLayer(bPontVonalon);
    }
    if (utvonal) {
        map.removeLayer(utvonal);
        map.removeLayer(pl);
    }
    aPont = null;
    bPont = null;
    aPontVonalon = null;
    bPontVonalon = null;
    utvonal = null;
    pl = null;
    //location = null;
    aPontVonalonKoord = null;
    kilepesutan();
    map.off('click')
}

function kilepesutan() {
    exit = false;
    
}

/*function bPontKijeloles(e) {
    map.on('click', bPontLerakas);
}*/

//menu megnyitas
function openmenu() {
    closeAll();
    document.getElementById('oldalsav').style.cssText="height: calc(100vh - 5px); width: 100vw; display: flex;"
    document.getElementById('menubezarasgomb').style.display="block";
    document.getElementById('menugomb').style.display="none";
    document.getElementById('container').style.cssText="width: 260px; left: 12px; background-color: #eeeeee; box-shadow: none;";
    document.getElementById('location').style.display="block";
    document.getElementById('location').style.display="block";

    document.getElementById('jelmagyarazatmegnyitas').style.display="flex";
    document.getElementById('nevjegymegnyitas').style.display="flex";
    document.getElementById('egyebgomb').style.display="none";

    var x = document.getElementsByClassName('menuelemszoveg');
    var i;
    for (i = 0; i < x.length; i++) {
        x[i].style.display="block";
    }
}

//menu bezaras
function closemenu() {
    document.getElementById('oldalsav').style.width="";
    document.getElementById('oldalsav').style.height="";
    document.getElementById('oldalsav').style.display="";
    document.getElementById('menubezarasgomb').style.display="none";
    document.getElementById('menugomb').style.display="block";
    document.getElementById('container').removeAttribute('style');
    document.getElementById('location').style.display="none";

    document.getElementById('jelmagyarazatmegnyitas').style.display="none";
    document.getElementById('nevjegymegnyitas').style.display="none";
    document.getElementById('egyebgomb').style.display="block";

    var x = document.getElementsByClassName('menuelemszoveg');
    var i;
    for (i = 0; i < x.length; i++) {
        x[i].style.display="none";
    }
}

//Jelmagyarázat megnyitás
function openLegend() {
    closeAll();
    document.getElementById('jelmagyarazat').style.display="block";
    document.getElementById('terkep_helye').style.filter="blur(5px)";
    document.getElementById('jelmagyarazatmegnyitas').style.display="none";
    document.getElementById('jelmagyarazatbezaras').style.display="flex";
    document.getElementById('nevjegymegnyitas').style.display="none";
}

//Jelmagyarázat bezárás
function closeLegend() {
    document.getElementById('jelmagyarazat').style.display="none";
    document.getElementById('terkep_helye').style.filter="none";
    //document.getElementById('jelmagyarazatmegnyitas').style.display="flex";
    document.getElementById('jelmagyarazatbezaras').style.display="none";
    document.getElementById('jelmagyarazatmegnyitas').style.display="none";
}

//Névjegy megnyitás
function openCredits() {
    closeAll();
    document.getElementById('nevjegy').style.display="block";
    document.getElementById('terkep_helye').style.filter="blur(5px)";
    document.getElementById('nevjegymegnyitas').style.display="none";
    document.getElementById('nevjegybezaras').style.display="flex";
    document.getElementById('jelmagyarazatmegnyitas').style.display="none";
}

//Névjegy bezárás
function closeCredits() {
    document.getElementById('nevjegy').style.display="none";
    document.getElementById('terkep_helye').style.filter="none";
    //document.getElementById('nevjegymegnyitas').style.display="flex";
    document.getElementById('nevjegybezaras').style.display="none";
    document.getElementById('nevjegymegnyitas').style.display="none";
}

//Minden elem elrejtése
function closeAll() {
    closemenu();
    closeLegend();
    closeCredits();
    hideOverview();
    kereseslapbezaras();
}

//⛅Időjárás
//forrás: https://www.studytonight.com/post/how-to-build-a-weather-app-using-javascript-for-complete-beginners
//feltételek: https://openweathermap.org/weather-conditions

const api = '44303e3c256ecf2d7c4046440d28f4ae';
const iconImg = document.getElementById('weather-icon');
const loc = document.querySelector('#location');
const tempC = document.querySelector('.c');
const desc = document.querySelector('.desc');


// weather data
/*var weatherQueryTiming = setInterval(weatherQuery, 5000);
function weatherQuery() {

    var kozeppont = L.latLng(map.getCenter());
    var kplon = kozeppont.lng;
    var kplat = kozeppont.lat;
    
    console.log(kozeppont);
    console.log(kplon);
    console.log(kplat);

    var base = `https://api.openweathermap.org/data/2.5/weather?lat=${kplat}&lon=${kplon}&appid=${api}&units=metric`;

    // Using fetch to get data
    fetch(base)
        .then((response) => {
        return response.json();
        })
        .then((data) => {
        const { temp } = data.main;
        const place = data.name;
        const { description, icon } = data.weather[0];
        const iconUrl = `imagemap/weather/${icon}.png`;
        //console.log(iconUrl);
        // Interacting with DOM to show data
        iconImg.src = iconUrl;
        loc.textContent = `${place}`;
        desc.textContent = `${description}`;
        tempC.textContent = `${temp.toFixed(0)} °C`;
        });
};*/

//KERESÉS
function kereseslapmegnyitas() {
    closeAll();
    kilepes();
    document.getElementById('kereses').style.display="grid";

    if (window.innerHeight > window.innerWidth){
        document.getElementById('keresestarto').style.cssText="height: auto; width: calc(100vw - 30px); top: 7px; left: 7px; padding: 8px; border-radius: 12px; background-color: #ffffff44; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0px 0px 15px #3534342d;";
    } else {
        document.getElementById('keresestarto').style.cssText="height: auto; width: 300px; padding: 8px; border-radius: 12px; background-color: #ffffff44; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0px 0px 15px #3534342d;";
    };
    
    document.getElementById('sav').style.cssText="margin-top: 12px; align-self: center; width: 80%; background-color: #00000033; box-shadow: none; border: 1px solid #ffffff55; color: white;";
    document.getElementById('keresomezo').style.display="block";
    document.getElementById("keresomezo").focus();
    document.getElementById('keressgomb').style.display="block";
    document.getElementById('keresesvissza').style.display="block";

    var x = document.getElementsByClassName('helykitolto');
    var i;
    for (i = 0; i < x.length; i++) {
        x[i].style.display="none";
    }
};

function kereseslapbezaras() {
    document.getElementById('kereses').style.display="none";
    document.getElementById('sav').style.width='';
    document.getElementById('sav').style.borderRadius='';
    document.getElementById('sav').style.left='';
    document.getElementById('sav').style.top='';
    document.getElementById('sav').style.backgroundColor='';
    document.getElementById('sav').style.boxShadow='';
    document.getElementById('sav').style.color='';
    document.getElementById('sav').style.marginTop='';
    document.getElementById('sav').style.alignSelf='';
    document.getElementById('keresestarto').style.height='';
    document.getElementById('keresestarto').style.width='';
    document.getElementById('keresestarto').style.background='';
    document.getElementById('keresestarto').style.borderRadius='';
    document.getElementById('keresestarto').style.boxShadow='';
    document.getElementById('keresestarto').style.padding='';
    document.getElementById('keresestarto').style.left='';
    document.getElementById('keresestarto').style.top='';
    document.getElementById('keresomezo').style.display="none";
    document.getElementById('keressgomb').style.display="none";
    document.getElementById('keresesvissza').style.display="none";
    document.getElementById('talalatok').style.display="none";

    document.getElementById('keresomezo').value='';

    var x = document.getElementsByClassName('helykitolto');
    var i;
    for (i = 0; i < x.length; i++) {
        x[i].style.display="block";
    }
};



/*function keress() {
    var kifejezes = document.getElementById('keresomezo').value;
    var talalat = _.find(cities.locations, {'title': kifejezes});
    if (!talalat)
        window.alert('Nincs találat');
    else
        window.alert('Go to ' + talalat.url);
}*/

/*function keress() {
    var kifejezes = document.getElementById('keresomezo').value;
    var talalat = _.find(poi.features[i].properties , {'nev': kifejezes});
    var talalatkoord = talalat.properties.geometry.coordinates;
    if (!talalat)
        window.alert('Nincs találat');
    else
        map.setView(talalatkoord, 15);
    console.log(talalat);
    //console.log(kifejezes);
    console.log(poi);
};	*/


function keress() {

    var talalat;
    var talalatnev;
    var kifejezes = document.getElementById('keresomezo').value;
    for (var i=0 ; i < poidata.features.length ; i++) {
        if (poidata.features[i].properties.nev.toLowerCase() == kifejezes.toLowerCase()) {
            talalat = (poidata.features[i].geometry.coordinates);
            talalatnev = (poidata.features[i].properties.nev);
        }
    }
    if (talalat == null) {
        window.alert('Nincs találat');
    }
    else {
    var helyestalalat = talalat.reverse();
    //console.log(helyestalalat);
    map.setView(helyestalalat, 19);
    };
    
    //console.log(talalatnev);
    //console.log(talalatdoboz);
}

/*function hint(text) {
    // finds all objects on layer group 'poi' containing 'text' in 'nev' attribute
    // and puts names into 'hint' div
    var hintlist = document.getElementById('javaslatok');
    hintlist.innerHTML='';
    var t = text.toLowerCase();
    var hintlayer = poi.getLayers();
    for (var i=0; i < hintlayer.length; i++) {
        name = hintlayer[i].feature.properties['nev'];
        if (name.toLowerCase().indexOf(t)>=0) {
            hintlist.innerHTML+='<div class="hint" onclick="setSearch(\''+name+'\');clearHints();">'+name+'</div>';
        }
    }
}*/

function keresstipust(data) {
    
    document.getElementById('talalatok').style.display="block";

    var talalattabla = [];
    for (var i=0 ; i < poidata.features.length ; i++) {
        if (poidata.features[i].properties.tipus == data) {
            talalat = (poidata.features[i].geometry.coordinates);
            talalatnev = (poidata.features[i].properties.nev);
            talalattabla.push(talalatnev);
        }
    }

    //console.log(talalatnev);
    //console.log(talalattabla);

    document.getElementById('talalatlista').innerHTML = '';

    talalattabla.forEach(function (item) {
        var elem = document.createElement('li');
        talalatlista.appendChild(elem);
        elem.innerHTML += item;

        elem.onclick = function() {
            document.getElementById('keresomezo').value=elem.innerHTML;
            keress();
        }
    });

    
                    
}			
    
