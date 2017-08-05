var App = function () {
    var self = this;
    var univList = ['厦门大学', '集美大学', '华侨大学', '厦门理工学院'];
    var mapObj = null, places = [], isFromMarker = false;

    self.sidePanelOpen = ko.observable(true);
    self.networkError = ko.observable(false);
    self.filterString = ko.observable('');
    self.selectedMarkerId = ko.observable('');

    // If network is blocked, return error message
    self.networkError.subscribe(function () {
        setTimeout(function () {
            self.networkError(false);
        }, 5000);
    });

    // If using filterString, clean selection
    self.filterString.subscribe(function () {
        self.selectedMarkerId('');

        mapObj.infoWindow.close();
        places.forEach(function (_el) {
            _el.marker.setAnimation(null);
        });
    });

    self.placesList = ko.pureComputed(function () {
        var filterString = self.filterString();
        var selectedId = self.selectedMarkerId();

        isFilterStringChanged = false;

        return places.filter(function (el) {
            if (filterString.length > 0)
                return el.place.name.indexOf(filterString) != -1;
            else
                return true;
        }).map(function (el) {
            return {name: el.place.name, id: el.place.id, isSelected: el.place.id == selectedId};
        });
    }, self).extend({rateLimit: 200});

    // Hide marker when filtered
    self.placesList.subscribe(function () {
        var showMarkerList = self.placesList().map(function (el) {
            return el.id;
        });

        places.forEach(function (el) {
            if (showMarkerList.includes(el.place.id))
                el.marker.setVisible(true);
            else
                el.marker.setVisible(false);
        });
    });

    self.selectMarker = function (el) {
        self.selectedMarkerId(el.id);
        self.selectedMarkerId.notifySubscribers();

        places.forEach(function (_el) {
            if (_el.place.id != el.id)
                _el.marker.setAnimation(null);
        });

        if (!isFromMarker)
            places.forEach(function (_el) {
                if (_el.place.id == el.id)
                    google.maps.event.trigger(_el.marker, 'click');
            });

        isFromMarker = false;
    };

    self.togglePanel = function () {
        self.sidePanelOpen(!self.sidePanelOpen());
    };

    mapObj = (function () {
        if (!(window.google && window.google.maps)) {
            self.networkError(true);
            return null;
        }

        // Init google map object and service
        var _mapObj = {};

        _mapObj.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12
        });

        _mapObj.latLngBounds = new google.maps.LatLngBounds();

        _mapObj.geoCoder = new google.maps.Geocoder();

        _mapObj.infoWindow = new google.maps.InfoWindow({
            content: null
        });

        _mapObj.placeService = new google.maps.places.PlacesService(_mapObj.map);


        _mapObj.geoCoder.geocode({address: '厦门市'}, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                var center = results[0].geometry.location;
                // Set center to city
                _mapObj.map.setCenter(center);
                // Find universities in city
                _mapObj.placeService.nearbySearch({
                    location: center,
                    radius: 50000,
                    keyword: '艺术|医学|理工|大学',
                    rankBy: google.maps.places.RankBy.PROMINENCE
                }, function (results, status) {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        results.filter(function (res) {
                            return univList.some(function (fil) {
                                return res.name.indexOf(fil) != -1;
                            });
                        }).forEach(function (res) {
                            var marker = new google.maps.Marker({
                                position: res.geometry.location,
                                map: _mapObj.map,
                                title: res.name,
                                animation: google.maps.Animation.DROP
                            });

                            var el = {name: res.name, id: res.id};
                            google.maps.event.addListener(marker, 'click', function () {
                                this.setAnimation(google.maps.Animation.BOUNCE);
                                _mapObj.infoWindow.setContent('<h2>' + this.title + '</h2>');

                                // Fetch address using geocode
                                _mapObj.geoCoder.geocode({'latLng': this.position}, function (results, status) {
                                    if (status == google.maps.GeocoderStatus.OK) {
                                        if (results[0]) {
                                            var address = results[0].formatted_address;
                                            _mapObj.infoWindow.setContent(_mapObj.infoWindow.content + '<hr><p>' + address + '</p>');
                                        }

                                        // Fetch Wiki Data
                                        var title = this.title;
                                        var titleUniv = univList[univList.map(function (s) {
                                            return title.indexOf(s) != -1;
                                        }).indexOf(true)];

                                        JSONP({
                                            url: 'https://zh.wikipedia.org/w/api.php',
                                            data: {
                                                action: 'query',
                                                prop: 'extracts',
                                                format: 'json',
                                                explaintext: '',
                                                exintro: '',
                                                titles: titleUniv
                                            },
                                            success: function (data) {
                                                try {
                                                    var abstract = data.query.pages[Object.keys(data.query.pages)[0]].extract;
                                                    _mapObj.infoWindow.setContent(_mapObj.infoWindow.content + '<hr><p>' + abstract + '</p>');
                                                } catch (e) {
                                                }
                                            }, fail: function () {
                                                self.networkError(true);
                                            }
                                        });
                                    } else {
                                        self.networkError(true);
                                    }
                                }.bind(this));
                                _mapObj.infoWindow.open(_mapObj.map, this);

                                _mapObj.map.panTo(this.position);

                                isFromMarker = true;
                                self.selectMarker(el);
                            });

                            _mapObj.latLngBounds.extend(res.geometry.location);
                            places.push({place: res, marker: marker});
                        });

                        google.maps.event.addListener(_mapObj.infoWindow, 'closeclick', function () {
                            self.selectedMarkerId('');
                            places.forEach(function (_el) {
                                _el.marker.setAnimation(null);
                            });
                        });

                        // Adjust bounds
                        _mapObj.map.fitBounds(_mapObj.latLngBounds);
                        _mapObj.map.setCenter(_mapObj.latLngBounds.getCenter());

                        // Manually Force list recomputed
                        self.filterString.notifySubscribers();
                    } else {
                        self.networkError(true);
                    }
                });
            } else
                self.networkError(true);
        });

        return _mapObj;
    })();

    // responsive design for small device
    if (document.body.getBoundingClientRect().width < 768) {
        self.sidePanelOpen(false);
    }
};

ko.applyBindings(new App());