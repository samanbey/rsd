/**
 * leaflet-wmslegend.js
 *
 * control L.control.WmsLegend
 * Displays legend for L.TileLayer.WMS layers
 * 
 * 
 * MIT License
 * Copyright (c) 2020 Gede Mátyás
 * 
 */
 
L.control.WmsLegend=L.Control.extend({
    options: { position: 'bottomleft' },
    
    initialize: function(options) {
        L.Control.prototype.initialize(options);
        var opts=options||{};
        // if layers parameter set, store it. 
        if (opts.layers) {
            this._wmslayers=opts.layers;
            if (!Array.isArray(this._wmslayers))
                this._wmslayers=[this._wmslayers];
        }
    },
    
    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.style.backgroundColor='#fff';     
        container.style.padding='5px';     
        this._legendDiv=document.createElement('div');
        this._legendDiv.innerHTML='Fetching legend...';
        var cb=document.createElement('input');
        cb.type='button';cb.style.float='right';
        cb.value='˅';cb.title="hide/show WMS legend"
        cb.onclick=function(e) {
            if (this.value=='˅') {
                this.nextElementSibling.style.display='none';
                this.value='˄';
            }
            else {
                this.nextElementSibling.style.display='';
                this.value='˅';
            }
        }
        container.appendChild(cb);
        container.appendChild(this._legendDiv)
        // refresh legend on map move and also when switching any of the wms layers on/off
        map.on('zoomend',this._refreshLegend,this);
        // fetch initial legend
        this._refreshLegend();
        // catch click events
        container.onclick=function(e) { e.stopPropagation(); }
        return container;
    },
    
    _refreshLegend: function() {
        var lDiv=this._legendDiv;
        lDiv.innerHTML='';
        // iterate over wms layers
        for (var j in this._wmslayers) {
            var wmslayer=this._wmslayers[j];
            // determine scale by measuring the projected distance of two adjacent pixels
            var p1=wms._crs.project(map.containerPointToLatLng([0, 0]));
            var p2=wms._crs.project(map.containerPointToLatLng([1, 0]));
            // distance divided by pixel size assuming 96dpi (1 px = 25.4/96 mm)
            var scale=Math.sqrt((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y))/.0002646; 
            var l=wmslayer.wmsParams.layers;
            if (l.split) l=l.split(',');
            var url=wmslayer._url;
            url+=(url.indexOf('?')>-1?'&':'?')+'SERVICE=WMS&VERSION=1.1.0&&REQUEST=GetLegendGraphic&FORMAT=image%2Fpng&SCALE='+scale;
            // iterate over the inner layers of the given wms source and append legend if there is one
            for (var i in l) {
                var im=new Image();
                im.lname=l[i];
                im.onload=function() {
                    if (this.height>5) {
                        var nd=document.createElement('div');
                        nd.innerHTML=this.lname;
                        lDiv.appendChild(nd);
                        lDiv.appendChild(this); 
                    }
                }
                im.src=url+'&layer='+l[i];
            }
        }
    }           
});

L.control.wmsLegend=function(o) {
    return new L.control.WmsLegend(o);
}