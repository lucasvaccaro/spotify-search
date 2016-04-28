/* global angular */
var API_URL = 'https://api.spotify.com/v1/';
var DIR_INCLUDE = 'include/';

var TAB_ARTISTS = 0;
var TAB_ALBUMS = 1;
var TAB_TRACKS = 2;

angular.module('SpotifySearch', ['ngAnimate', 'ngTouch', 'ui.bootstrap'])
.controller('SearchController', function($http, $sce) {
    this.currentData = null;
    this.loading = true;

    this.tabs = [{
        title: 'Artists',
        endpoint: 'artists',
        list: DIR_INCLUDE + 'tab' + TAB_ARTISTS + '.html',
        file: 'artist.html',
        active: true
    }, {
        title: 'Albums',
        endpoint: 'albums',
        list: DIR_INCLUDE + 'tab' + TAB_ALBUMS + '.html',
        file: 'album.html'
    }, {
        title: 'Tracks',
        endpoint: 'tracks',
        list: DIR_INCLUDE + 'tab' + TAB_TRACKS + '.html',
        file: 'track.html'
    }];

    this.setArtistsList = function(query) {
        $http.get(API_URL + 'search?type=artist&q=' + query).success(function(data) {
            this.tabs[TAB_ARTISTS].content = data.artists.items;
        }.bind(this));
    };

    this.setAlbumsList = function(query) {
        $http.get(API_URL + 'search?type=album&q=' + query).success(function(data) {
            this.tabs[TAB_ALBUMS].content = data.albums.items;
        }.bind(this));
    };

    this.setTracksList = function(query) {
        $http.get(API_URL + 'search?type=track&q=' + query).success(function(data) {
            this.tabs[TAB_TRACKS].content = data.tracks.items;
        }.bind(this));
    };

    this.setDataList = function(index, searchString) {
        this.loading = true;

        // Get current tab
        var active = index;
        for (var i = 0; i < this.tabs.length; i++) {
            this.tabs[i].content = null;
            if (index == undefined) {
                if (this.tabs[i].active) {
                    active = i;
                }
            }
            else {
                this.tabs[i].active = (i == index);
            }
        }

        // Get input query
        var query = '';
        if (searchString != undefined) {
            query = encodeURIComponent(searchString);
        }
        if (query == '') {
            query = 'a*';
        }

        // Call respective function
        if (active == TAB_ARTISTS) {
            this.setArtistsList(query);
        }
        else if (active == TAB_ALBUMS) {
            this.setAlbumsList(query);
        }
        else if (active == TAB_TRACKS) {
            this.setTracksList(query);
        }

        this.loading = false;
    };

    this.setCurrentData = function(endpoint, id, file) {
        this.loading = true;
        $http.get(API_URL + endpoint + '/' + id).success(function(data) {
            this.currentData = {
                file: DIR_INCLUDE + file,
                data: data
            };
            this.loading = false;
        }.bind(this));
    };

    this.goBack = function() {
        this.currentData = null;
    };
})
.controller('ArtistsController', function($http, $scope) {
    /*Artist data provided by the search controller*/
    $scope.init = function(artistData) {
        $scope.artistData = artistData;
    }
})
.directive('albunsList', function() {
    return {
        restrict: 'E',
        templateUrl: DIR_INCLUDE + 'templates/albums-list.html',
        scope: {
            artistId: '@'
        },
        controller:  function($scope, $http) {
            if ($scope.artistId) {
                $http.get(API_URL + 'artists/' + $scope.artistId + '/albums?market=US').success(function(data) {
                    $scope.albums = data.items;
                });
            }
        }
    }
})
.directive('topTracksList', function() {
    return {
        restrict: 'E',
        templateUrl: DIR_INCLUDE + 'templates/top-tracks-list.html',
        scope: {
            artistId: '@'
        },
        controller:  function($scope, $http) {
            if ($scope.artistId) {
                $http.get(API_URL + 'artists/' + $scope.artistId + '/top-tracks?country=US').success(function(data) {
                    $scope.tracks = data.tracks;
                });
            }
        }
    }
})
.filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);
