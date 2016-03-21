/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var es = angular.module('es', ['ngRoute']);


var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, true);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        //var parentElement = document.getElementById(id);
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');
        //
        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');
        //
        //console.log('Received Event: ' + id);
    }
};



es.config(['$compileProvider', '$routeProvider', '$locationProvider', function($compileProvider, $routeProvider, $locationProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
    $routeProvider
        .when('/', {
            templateUrl: 'views/welcome.html',
            controller: 'Welcome'
        })
        .when('/test', {
            templateUrl: 'listen-and-repeat.html',
            controller: 'listenAndRepeat',
            controllerAs: 'lar'
        })
        .when('/Dashboard', {
            templateUrl: 'dashboard.html',
            controller: 'listenAndRepeat',
            controllerAs: 'lar'
        }).otherwise({ redirectTo: '/' });

    $locationProvider.html5Mode(true);
}]);

es.controller('Welcome', ['$scope', '$location', function ($scope, $location) {
    $scope.$on('$viewContentLoaded', function(event) {
        setTimeout(function(){
            //$location.path('/Dashboard');
            //$scope.$apply();
        }, 2000);

    });
}]);

es.controller('listenAndRepeat', ['$scope', function ($scope) {
    $scope.templateUrl = "src='dashboard.html'";
    $scope.$on('$viewContentLoaded', function(event) {
        setTimeout(function(){
            //$.mobile.changePage($('#dashboard'), { transition : 'flip' });
            Waves.attach('.ui-btn');
            Waves.init();
            Waves.attach('.ui-btn-raised', '.func-list li');
        }, 2000);
//                $(document).on('click', '.ui-btn', function(){
//                    $.mobile.changePage($('#dashboard'), { transition : 'flip' });
//                });
    });
}]);

app.initialize();