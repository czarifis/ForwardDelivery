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


    $.ajax({
        url: 'http://earthquake.usgs.gov/earthquakes/feed/geojsonp/2.5/week',
        dataType: 'jsonp',
        jsonpCallback: 'eqfeed_callback'
    })
        .done(
        function(response, text_status, jq_xhr) {
//            quakes = parseQuakes(response);
//            createSummary(quakes);
//            createMapMarkers(map, quakes);
//            createTableRows(quakes);
        });

    map = createMap();
//    var checkboxes = createCheckboxes();

    var trucks = [];
    for (var i = 0; i < TRUCKS_NO; i++) {

        var mm = createRandomTruck(i);
        trucks.push(mm);

    }
    createTruckList(trucks);
    createMapMarkers(map, trucks);
}





var createDeliveries = function(j){

    var ret = {
        delivery_id: j,
        recipient: 'The White House',
        //...

        scheduled_time: '14:19',
        delivered_time: '14:19',
        item_title: 'item title'+j,
        item_description: 'blahBlahBlah'
    };
    return ret;
};

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



function parseQuakes(response) {
    var quakes = [];

    $.each(response.features, function(i, feature) {
        var quake = {};
        quake.id = feature.id;
        quake.time = new Date(new Number(feature.properties.time));
        quake.place = feature.properties.place;
        quake.latitude = feature.geometry.coordinates[1];
        quake.longitude = feature.geometry.coordinates[0];
        quake.magnitude = feature.properties.mag;
        quakes.push(quake);
    });
    return quakes;
}

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
    var map = new google.maps.Map(div, map_options);
    return map;
}

function createCheckboxes() {
    for (var i=0; i<ranges; i++) {
        $('#checkboxes').append('<input type="checkbox" checked="checked"></input><br />');
    }

    $.each($('#checkboxes input'), function(i, checkbox) {
        var date = getPreviousDay(i);
        $(checkbox)
            .after('&nbsp;' + moment.utc(date).format('MMM DD'))
            .bind('change', null, function() {
                if (this.checked) {
                    selectDate(date);
                } else {
                    unselectDate(date);
                }
            });
    });

    return $('#checkboxes input').toArray();
}

function createSummary(quakes) {
    $('#shown_count').text(quakes.length);
    $('#total_count').text(quakes.length);
}

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

function createTableRows(quakes) {
    $.each(quakes, function(i, quake) {
        $('#table_rows').append(
                '<tr id="row-' + quake.id + '">' +
                '<td>' + quake.magnitude + '</td>' +
                '<td>' + quake.place + '</td>' +
                '<td style="white-space: nowrap">' + getTimeString(quake.time) + '</td>' +
                '<td>' + quake.latitude + '</td>' +
                '<td>' + quake.longitude + '</td>' +
                '</tr>'
        );

        quake.row = $('#row-' + quake.id).get(0);
    });
}
//
//<ion-item class="item">
//
//    <div class="item item-text-wrap">
//        <div class="row">
//            <div class="col">truck.truck_key</div>
//            <div class="col">delivery.delivery_id</div>
//            <div class="col">delivery.scheduled_time</div>
//            <div class="col">delivery.delivered_time</div>
//            <div class="col">delivery.item_title</div>
//        </div>
//    </div>
//</ion-item>

function createTruckList(trucks){
    $.each(trucks, function(i, truck) {
        for(var k =0; k<truck.all_deliveries.length;k++) {
            var delivery = truck.all_deliveries[k];
            $('#table_rows').append(
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
        }

    });
}


function selectDate(date) {
    $.each(quakes, function(i, quake) {
        if (isSameDay(quake.time, date)) {
            quake.marker.setMap(map);
            $(quake.row).show();
        }
    });

    var shown_count = 0;
    $.each(quakes, function(i, quake) {
        if (quake.marker.getMap() !== null) {
            shown_count++;
        }
    });
    $('#shown_count').text(shown_count);
}

function unselectDate(date) {
    $.each(quakes, function(i, quake) {
        if (isSameDay(quake.time, date)) {
            quake.marker.setMap(null);
            $(quake.row).hide();
        }
    });

    var shown_count = 0;
    $.each(quakes, function(i, quake) {
        if (quake.marker.getMap() !== null) {
            shown_count++;
        }
    });
    $('#shown_count').text(shown_count);
}

function isSameDay(x, y) {
    return  x.getUTCFullYear()  === y.getUTCFullYear()  &&
        x.getUTCMonth()     === y.getUTCMonth() &&
        x.getUTCDate()      === y.getUTCDate();
}

function getPreviousDay(day) {
    return new Date(Date.now() - day * ms_per_day);
}

function getTimeString(time) {
    return moment.utc(time).format('MMM DD HH:mm:ss');
}

function getForeColor(magnitude) {
    return  (magnitude < 2.0) ?  colors[0] :
        (magnitude < 3.0) ?  colors[1] :
            (magnitude < 4.0) ?  colors[2] :
                (magnitude < 5.0) ?  colors[3] :
                    (magnitude < 6.0) ?  colors[4] :
                        (magnitude < 7.0) ?  colors[5] :
                            colors[6];
}


