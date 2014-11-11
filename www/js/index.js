/**
 * Created by Costas Zarifis on 11/6/14.
 */

"use strict";
var TRUCKS_NO = 100;
var DELIVERIES_NO = 40;
var colors = ['#FEF0D9', '#FDD49E', '#FDBB84', '#FC8D59', '#EF6548', '#D7301F', '#990000'];
var ms_per_day = 1000 * 60 * 60 * 24;
var quakes = [];
var map = null;

var deliver_trucks = [];


function init() {

//
//    $.ajax({
//        url: 'http://earthquake.usgs.gov/earthquakes/feed/geojsonp/2.5/week',
//        dataType: 'jsonp',
//        jsonpCallback: 'eqfeed_callback'
//    })
//        .done(
//        function(response, text_status, jq_xhr) {
//        });

    map = createMap();
    var checkboxes = createIonCheckboxes();

    var trucks = [];
    for (var i = 0; i < TRUCKS_NO; i++) {

        var mm = createRandomTruck(i);
        trucks.push(mm);

    }
    createTruckList(trucks);
    createMapMarkers(map, trucks);
    deliver_trucks = trucks;
}


/**
 * This function generates a pending delivery
 * @param j
 * @returns {{delivery_id: *, recipient: string, scheduled_time: string, delivered_time: string, item_title: string, item_description: string}}
 */

var createDeliveries = function(j){

    return {
        delivery_id: j,
        recipient: 'The White House',
        //...

        scheduled_time: '14:19',
        delivered_time: '14:19',
        item_title: 'item title'+j,
        item_description: 'blahBlahBlah'
    };
};

/**
 * This function generates a single truck with DELIVERY_NO pending deliveries
 * @param i
 * @returns {{truck_key: *, coords: {latitude: number, longitude: number}, all_deliveries: Array, pending_deliveries: Number, visible: boolean}}
 */
var createRandomTruck = function (i) {
    var lat_min = -90,
        lat_range = 90 - lat_min,
        lng_min = -180,
        lng_range = 180 - lng_min;

    var truck_key = "id";

    var deliveries = [];

    for (var k =0;k<DELIVERIES_NO;k++){

        var del = createDeliveries(k);
        deliveries.push(del);
    }

    var latitude = lat_min + (Math.random() * lat_range);
    var longitude = lng_min + (Math.random() * lng_range);
    var ret = {
        truck_key: i,
        coords: {
            latitude: latitude,
            longitude: longitude
        },
        all_deliveries: deliveries,
        pending_deliveries : deliveries.length,
        visible:true
    };
    ret[truck_key] = i;
    return ret;
};


/**
 * This variable has the ranges that will appear on the UI,
 * and will be used to incrementally maitain the results based
 * on what the user selects.
 * @type {{min: number, max: number, checked: boolean}[]}
 */
var ranges = [
    {
        min:0,
        max:10,
        checked : true
    },
    {
        min:11,
        max:50,
        checked : true
    },
    {
        min:51,
        max:100,
        checked : false
    }
];


/**
 * This function generates a map and assignes the value to a global
 * variable so that it can be used by function responsible for the
 * incremental rendering of the markers.
 * @returns {google.maps.Map}
 */

function createMap() {
    var div = $('#map_canvas').get(0);
    var map_options = {
        center: new google.maps.LatLng(0, 0),
        zoom: 2,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: true,
        panControl: false,
        scaleControl: false
    };
    map = new google.maps.Map(div, map_options);
    return map;
}

/**
 * This function generates the checkboxes with the ranges
 */
function createIonCheckboxes(){
    for (var i=0; i<ranges.length;i++){
        $('#checkboxes').append(' '+
            '<ion-item class="item">'+
                '<label class="item item-checkbox">'+
                    '<div id="in" class="checkbox checkbox-input-hidden disable-pointer-events">'+
                    '<input  type="checkbox" checked="checked"><i class="checkbox-icon"></i></input><br />'+
                    '</div>'+
//                '<span> &nbsp;6.0 - 6.9 </span>'+ //This thingy keeps the value
            '</div></label></ion-item>'
        );
    }

    $.each($('#checkboxes div'), function(i, checkbox) {
        $(checkbox)
            .after('<span> &nbsp;'+ranges[i].min+' - '+ranges[i].max+' </span>')
            .bind('change', null, function() {
                if (this.checked) {
                    filterResults(ranges[i].min,ranges[i].max);
                } else {
                    filterResults(ranges[i].min,ranges[i].max);
                }
            });
    });
}

/**
 * This function gets called every time the user clicks on a checkbox.
 * It has to incrementally maintain the results and only show the delivery
 * trucks and the pending deliveries of each truck both on the map
 * and on the list bellow the map based on the enabled/disabled checkboxes.
 *
 * @param currMin
 * @param currMax
 */
function filterResults(currMin,currMax){

    for (var k = 0; k < ranges.length; k++) {
        if((ranges[k].min === currMin)&&(ranges[k].max===currMax)){
            if(ranges[k].checked){
                ranges[k].checked = false;
            }else{
                ranges[k].checked = true;
            }

            for (var j = 0; j < deliver_trucks.length; j++) {
                if ((deliver_trucks[j].pending_deliveries >= ranges[k].min) &&
                    (deliver_trucks[j].pending_deliveries <= ranges[k].max)) {
                    deliver_trucks[j].visible = ranges[k].checked;
                    if(deliver_trucks[j].visible){
                        deliver_trucks[j].marker.setMap(map);
                        deliver_trucks[j].iitem.show();
                    }else{
                        deliver_trucks[j].marker.setMap(null);
                        deliver_trucks[j].iitem.hide();
                    }
                }
            }

        }
    }

}

/**
 * This function gets called on init. It generates the markers on the map
 * and it stores each marker in the model of each truck so that it can
 * be incrementally maintained in the future.
 * @param map
 * @param trucks
 */
function createMapMarkers(map, trucks) {

    $.each(trucks, function(i, truck) {
        truck.marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(truck.coords.latitude, truck.coords.longitude)
//            icon: {
//                path: google.maps.SymbolPath.CIRCLE,
//                scale: quake.magnitude * 1.5,
//                fillColor: getForeColor(quake.magnitude),
//                fillOpacity: 0.9,
//                strokeColor: 'pink',
//                strokeWeight: 1
//            }
        });

//        google.maps.event.addListener(quake.marker, 'click', function() {
//            info_window.content = getTimeString(quake.time);
//            info_window.open(map, quake.marker);
//        });
    });
}

/**
 * This function gets called on init. It generates the elements that appear
 * on the list bellow the map and it stores each div element in the model
 * of each truck so that it can be incrementally maintained in the future.
 * @param quakes
 */

function createTruckList(trucks){
    $.each(trucks, function(i, truck) {
        for(var k =0; k<truck.all_deliveries.length;k++) {
            if (truck.visible) {
                var delivery = truck.all_deliveries[k];
                var iitem = $('#table_rows').append(
                        '<ion-item class="item">' +
                        '<div class="item item-text-wrap">' +
                        '<div class="row">' +
                        '<div class="col">' + truck.truck_key + '</div>' +
                        '<div class="col">' + delivery.delivery_id + '</div>' +
                        '<div class="col">' + delivery.scheduled_time + '</div>' +
                        '<div class="col">' + delivery.delivered_time + '</div>' +
                        '<div class="col">' + delivery.item_title + '</div>' +
                        '</div>' +
                        '</div>' +
                        '</ion-item>'
                );
                truck.iitem = iitem;
            }
        }

    });
}

