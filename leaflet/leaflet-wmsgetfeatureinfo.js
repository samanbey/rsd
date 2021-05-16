/**
 * leaflet-wmsgetfeatureinfo.js
 *
 * Handler L.WmsGetFeatureInfo
 * Displays feature info for L.TileLayer.WMS layers
 * 
 * methods:
 *     - setLayers(layers): set which layers to query.
 *              layers: a L.TileLayer.WMS object or an array of them. 
 *              without using setLayers, all wms layers of the map will be queried
 * 
 * MIT License
 * Copyright (c) 2020 Gede Mátyás
 * 
 */

L.WmsGetFeatureInfo=L.Handler.extend({   

    addHooks: function() {
        this._map.on('click',this._getInfo,this);
    },
    removeHooks: function() {
        this._map.off('click',this._getInfo,this);
    },
    initialize: function(map) {
        this._map=map;
        // enable it by default
        this.enable();
    },
    
    // set which layers to query 
    setLayers: function(layers) {
        this._wmsgfilayers=layers;
        // transform layers to array if it is not one
        if (!Array.isArray(this._wmsgfilayers))
            this._wmsgfilayers=[this._wmsgfilayers];
    },
    
    // click event handler 
    _getInfo: function(e) {
        console.log(e);
        var li=0;
        var text='';
        var ql=this._wmsgfilayers;
        var map=this._map;
        // if no layers were specified, find all WMS layers
        if (!ql||!ql[0]) {
            ql=[];
            for (var l in map._layers)
                if (map._layers[l].wmsParams)
                    ql.push(map._layers[l]);           
        }
        // if still no layers, return with warning
        if (ql.length==0) {
            console.warn('WMSGetFeatureInfo: No queryable layers!');
            return;
        }
        fetchNext();
        
        // recursive function fetching all queryable layers
        function fetchNext() {
            var ll=e.latlng; // click position as latLng
            var cr=ql[li]._crs.project(ll); // click position in map projection units
            // prepare getfeatureinfo request params based on wms getmap params
            var params=Object.assign({}, ql[li].wmsParams);
            params.request="GetFeatureInfo";
            params.info_format="text/html";
            params.bbox=[cr.x,cr.y,cr.x+1,cr.y+1];
            params.width=params.height=2;
            params.x=params.y=0;
            params.query_layers=params.layers;
            // build url from params
            var url=ql[li]._url;
            for (o in params) {
                url+=(url.indexOf('?')>-1)?'&':'?';
                url+=o+'='+params[o];
            }
            // fetch url
            fetch(url).then(function(r){ return r.text(); }).then(function(t) {
                text+=t;
                li++;
                if (li<ql.length)
                    fetchNext(); // fetch next if there are more layers
                else if (text!='') // display popup otherwise
                    L.popup()
                        .setLatLng(ll)
                        .setContent(text)
                        .openOn(map);
                else // or console info if the response was empty
                    console.info('WMSGetFeatureInfo: no feature info at position '+ll);
            })
        }
    }  
});