var apiUrl = 'http://english.deverway.com/api';
/* Build HTML5 Audio Player */
var esPlayer = new Audio();
esPlayer.playButton = '.es-player .player-play';
esPlayer.pauseButton = '.es-player .player-pause';
esPlayer.currentLoad = '.es-player .player-current-load';
esPlayer.fullLoad = '.es-player .player-rail';
esPlayer.progress = '.es-player .player-progress';
esPlayer.lyric = [];
esPlayer.loop = true;

esPlayer.setSource = function (url) {
    if (!url) {
        url = '';
        esPlayer.src = url;
    } else {
        var hasConnection = false;
        try {
            if(navigator.network.connection.type == Connection.NONE){
                hasConnection = false;
            } else {
                hasConnection = true;
            }
        } catch (e){

        }

        if(hasConnection){
            esPlayer.src = url;
			// Save file to device if not exists
			try {
				var filePath = cordova.file.externalDataDirectory+url.split('/mp3/')[1];
				window.resolveLocalFileSystemURL(filePath, function(file) {}, 
				function(){
					app.downloadMedia(url);
				});
			} catch(e){}
			
        } else {
			// If not has connection, using stored local file
            try {
                var filePath = cordova.file.externalDataDirectory+url.split('/mp3/')[1];
                window.resolveLocalFileSystemURL(filePath, function(){
					esPlayer.src = filePath;
				},
				function(){
					esPlayer.src = url;
					app.downloadMedia(url);
				});
            } catch (e){
                esPlayer.src = url;
            }
        }
    }

    esPlayer.lyric = [];
}

esPlayer.setLyric = function (lyric) {
    esPlayer.lyric = lyric;
}

esPlayer.setState = function (state) {
    if (state == 'play') {
        $(esPlayer.playButton).hide();
        $(esPlayer.pauseButton).show();
    } else if (state == 'pause') {
        $(esPlayer.pauseButton).hide();
        $(esPlayer.playButton).show();
    }
}

esPlayer.changeUiState = function (currentTime) {
    durationTime = esPlayer.duration;
    timeRemain = Math.round(durationTime - currentTime);
    minuteRemain = '00' + Math.floor(timeRemain / 60);
    secondRemain = '00' + Math.round(timeRemain % 60);
    // Change progress bar
    $('.es-player .player-time').text(minuteRemain.slice(-2) + ':' + secondRemain.slice(-2));
    progress = Math.round((currentTime / durationTime) * 100);
    $('.es-player .player-current-load').css({'width': progress + '%'});

    // Change lyric
    if (esPlayer.lyric.length > 0) {
        lyricIndex = esPlayer.lyric.indexOf(Math.ceil(currentTime).toString());
        if (lyricIndex >= 0) {
            $(document).find('.dictation-content p.active').removeClass('active');
            activeLyric = $(document).find('.dictation-content p').eq(lyricIndex);
            activeLyricPosition = activeLyric.offset().top;
            activeLyricHeight = activeLyric.height();
            windowScroll = $(window).scrollTop() + $(window).height();
            if (windowScroll - activeLyricPosition - activeLyricHeight <= 100) {
                $('html, body').animate({
                    scrollTop: activeLyricPosition - $('.ui-header-fixed').height()
                }, 1000);
            }
            activeLyric.addClass('active');
        }
    }
}

$(document).on('click', esPlayer.progress, function (event) {
    offset = $(this).offset();
    mouseX = event.pageX - $('body').offset().left;
    seekToPosition = mouseX - offset.left;
    seekToPercent = seekToPosition / $(esPlayer.fullLoad).width();
    seekToTime = esPlayer.duration * seekToPercent;

    //Audio buffer not working properly in current version, so we can temporary disable buffer check
    if (esPlayer.buffered.length > 0) {
        if (seekToTime <= esPlayer.buffered.end(esPlayer.buffered.length - 1))
            esPlayer.currentTime = seekToTime;
    } else {
        esPlayer.currentTime = seekToTime;
    }

});

$(document).on('click', esPlayer.playButton, function () {
    if (esPlayer.duration) {
        esPlayer.play();
        esPlayer.setState('play');
    }
});

$(document).on('click', esPlayer.pauseButton, function () {
    esPlayer.pause();
    esPlayer.setState('pause');
});

esPlayer.addEventListener('canplay', function () {
    currentTime = this.currentTime;
    this.changeUiState(currentTime);
});

esPlayer.addEventListener('timeupdate', function () {
    currentTime = this.currentTime;
    this.changeUiState(currentTime);
});

esPlayer.addEventListener('ended', function () {
    currentTime = 0;
    this.changeUiState(currentTime);
    esPlayer.setState('pause');
});

/* LocalStorage Database */
var database = {
    writeDictationData: function () {
        $.get(apiUrl+'/dictation/level/all', function (response) {
            //Convert data to array of object to use filter
            var dictationsArray = {};
            for(var level in response.dictations) {
                dictationsArray[level] = [];
                for(var i in response.dictations[level]) {
                    dictationsArray[level].push(response.dictations[level][i]);
                }
            }
            window.localStorage.setItem('dictations', JSON.stringify(dictationsArray));
        });
    },
    getDictationData: function () {
        return JSON.parse(window.localStorage.getItem('dictations'));
    },
    writePronunciationData: function () {
        $.get(apiUrl+'/pronunciation/lession/all', function (response) {
            window.localStorage.setItem('pronunciations', JSON.stringify(response.pronunciations));
        });
    },
    getPronunciationData: function () {
        return JSON.parse(window.localStorage.getItem('pronunciations'));
    },
    writeStoryData: function () {
        $.get(apiUrl+'/story/lession/all', function (response) {
            //Convert data to array of object to use filter
            var storiesArray = [];
            for(var i in response.stories) {
                storiesArray.push(response.stories[i]);
            }
            window.localStorage.setItem('stories', JSON.stringify(storiesArray));
        });
    },
    getStoryData: function () {
        return JSON.parse(window.localStorage.getItem('stories'));
    },
    writeWordData: function () {
        $.get(apiUrl+'/word/all', function (response) {
            //Convert data to array of object to use filter
            var wordsArray = [];
            for(var i in response.words) {
                wordsArray.push(response.words[i]);
            }
            window.localStorage.setItem('words', JSON.stringify(wordsArray));
        });
    },
    getWordData: function () {
        return JSON.parse(window.localStorage.getItem('words'));
    },
    writeIdiomData: function () {
        $.get(apiUrl+'/idiom/all', function (response) {
            //Convert data to array of object to use filter
            var idiomsArray = [];
            for(var i in response.idioms) {
                idiomsArray.push(response.idioms[i]);
            }
            window.localStorage.setItem('idioms', JSON.stringify(idiomsArray));
        });
    },
    getIdiomData: function () {
        return JSON.parse(window.localStorage.getItem('idioms'));
    },
    writeUserData: function(data){
        window.localStorage.setItem('user', JSON.stringify(data));
    },
    readUserData: function(){
        return JSON.parse(window.localStorage.getItem('user'));
    },
    syncUserData: function(data){
        $.post(apiUrl+'/user/sync/'+data.uuid, data);
        database.writeUserData(data);
    }
}

/* Build AngularJS App */
var player;
var es = angular.module('es', ['ngRoute', 'ngSanitize', 'ngTouch']).run(function ($rootScope) {
    $rootScope.closeApp = false;
    $rootScope.loadingPage = true;

    $.get(apiUrl+'/info/data', function (response) {
        if(!database.getDictationData() || response.hasData == true){
            database.writeDictationData();
            $rootScope.dictations = database.getDictationData();
        }
        if(!database.getPronunciationData() || response.hasData == true){
            database.writePronunciationData();
        }
        if(!database.getStoryData() || response.hasData == true){
            database.writeStoryData();
        }
        if(!database.getWordData() || response.hasData == true){
            database.writeWordData();
            $rootScope.words = database.getWordData();
        }
        if(!database.getIdiomData() || response.hasData == true){
            database.writeIdiomData();
        }
    });

    $rootScope.dictations = database.getDictationData();
    $rootScope.words = database.getWordData();
}).run(function ($rootScope, $location, $http, $templateCache, $window) {
    //$rootScope.pageClass = 'page-animate';
    ////$rootScope.dictations = database.getDictationData();
    $rootScope.$on("$routeChangeSuccess", function (event, next, current) {
        //$rootScope.loadingPage = true;
        //$('body').append('<div class="page-trans-overlay"></div>');
        //$('body').find('.ui-page').css({'opacity': 1});
        //console.log('ok');
        hideLeftMenu();
		$(window).off('scroll');
    });
    $rootScope.$on("$viewContentLoaded", function (event, next, current) {
        //$('body').find('.ui-page').css({'opacity': 1});
        //console.log('ok');
        
    });

    $rootScope.goBack = function(){
        $window.history.back();
    }

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        if($('#leftpanel').is(':visible') == true){
            hideLeftMenu();
            //event.preventDefault();
        }
    });

});

var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        //document.addEventListener("backbutton", this.backKeyDown, false);
        Waves.init();
    },
    backKeyDown: function(){
        hideLeftMenu();
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        //navigator.splashscreen.hide();
        //alert(database.readUserData());
        //window.localStorage.setItem('user', null);

        // Create Admob ads
        createAds();

        if(!database.readUserData()){
            $.get(apiUrl+'/user/info/'+device.uuid, function(response){
                if(response.code == 'ERR405'){
                    $.post(apiUrl+'/user/register/'+device.uuid,
                        {'os': device.platform, 'os_version': device.version},
                        function(response){
                            if(response.code == 'OK'){
                                database.writeUserData(response.user[0]);
                            }
                        }
                    );
                } else if(response.code == 'OK') {
                    database.writeUserData(response.user[0]);

                }
            });
        } else {
            database.syncUserData(database.readUserData());
        }
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        //var parentElement = document.getElementById(id);
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');
        //
        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');
        //
        //console.log('Received Event: ' + id);
    },
    downloadMedia: function(url) {
        try {
            var fileTransfer = new FileTransfer();
            var filePath = cordova.file.externalDataDirectory+url.split('/mp3/')[1];
            var uri = encodeURI(url);

            fileTransfer.download(
                uri,
                filePath,
                function(entry) {
                    //alert(entry.toURL());
                },
                function(error) {
                    window.resolveLocalFileSystemURL(filePath, function(file) {
                        file.remove();
                    });
                },
                true
            );
        } catch (e){

        }

    }
};

es.config(['$compileProvider', '$routeProvider', '$locationProvider', function ($compileProvider, $routeProvider, $locationProvider) {

    //$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
    //$locationProvider.html5Mode({
    //    enabled: true,
    //    requireBase: false
    //});
    $routeProvider
        .when('/', {
            templateUrl: 'views/dashboard.html',
            controller: 'Dashboard'
        })
        .when('/listen-and-repeat', {
            templateUrl: 'views/listen-and-repeat.html',
            controller: 'listenAndRepeat'
        })
        .when('/dictation', {
            templateUrl: 'views/dictation.html',
            controller: 'Dictation'
        })
        .when('/pronunciation', {
            templateUrl: 'views/pronunciation.html',
            controller: 'Pronunciation'
        })
        .when('/pronunciation-lession', {
            templateUrl: 'views/pronunciation-lession.html',
            controller: 'pronunciationLession'
        })
        .when('/english-stories', {
            templateUrl: 'views/english-stories.html',
            controller: 'englishStories'
        })
        .when('/story', {
            templateUrl: 'views/story.html',
            controller: 'Story'
        })
        .when('/words', {
            templateUrl: 'views/words.html',
            controller: 'Words'
        })
        .when('/word-bricks', {
            templateUrl: 'views/word-bricks.html',
            controller: 'wordBricks'
        })
        .when('/ranking/:type', {
            templateUrl: 'views/ranking.html',
            controller: 'Ranking'
        })
        .when('/quiz-underscores', {
            templateUrl: 'views/underscores.html',
            controller: 'Underscores'
        })
        .when('/about', {
            templateUrl: 'views/about.html',
            //controller: 'Underscores'
        })
        .otherwise({redirectTo: '/'});
}]);


es.controller('Welcome', ['$rootScope', '$scope', '$location', function ($rootScope, $scope, $location) {
    $scope.$on('$viewContentLoaded', function (event) {
        if ($rootScope.closeApp) {
            navigator.app.exitApp();
        } else {
            $rootScope.closeApp = true;
            setTimeout(function () {
                $location.path('/dashboard');
                $scope.$apply();
            }, 2000);
        }

    });
}]);

es.controller('Dashboard', ['$rootScope', '$scope', '$location', function ($rootScope, $scope, $location) {
    $scope.$on("$viewContentLoaded", function(){
        showAds();
    });

    $scope.$on("$destroy", function(){
        hideAds();
    });
}]);

/* Dictation Section */
es.factory('dictationService', function () {
    var lession;
    var state = {level: 1, scroll: 0};

    var setLession = function (dictation) {
        lession = dictation;
    }

    var getLession = function () {
        return lession;
    }

    var setState = function (value) {
        state = value;
    }

    var getState = function () {
        return state;
    }

    return {
        addLession: setLession,
        getLession: getLession,
        setState: setState,
        getState: getState
    };
});

es.directive("repeatEnd", function(){
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            if (scope.$last) {
                scope.$eval(attrs.repeatEnd);
            }
        }
    };
});

es.controller('listenAndRepeat', ['$rootScope', '$scope', '$http', '$location', 'dictationService', '$templateCache', function ($rootScope, $scope, $http, $location, dictationService, $templateCache) {

    $scope.levels = [1, 2, 3, 4];

    $scope.loadDictationLevel = function (level) {
        if (level > 0 && level <= 4) {
            $scope.level = level;
            $('body').animate({scrollTop:0}, 1);
        }
    }

    $scope.$on('$viewContentLoaded', function (event) {
        $scope.dictations = database.getDictationData();
        $scope.loadDictationLevel(dictationService.getState().level);
        $('body').animate({scrollTop: dictationService.getState().scroll}, 1);
        showAds();
    });

    $scope.assignDictation = function (dictation) {
        dictationService.addLession(dictation);
        dictationService.setState({level: dictation.level, scroll: $('body').scrollTop()});
        $location.path('/dictation');
    }

    $scope.limit = 40;
    $scope.loadMoreDictations = function(){
        $scope.limit = $scope.limit+15;
    }

    $(window).off().on('scroll', function() {
        if($(window).scrollTop()+$(window).height() >= $(document).height()-20) {
            if($location.path()=='/listen-and-repeat' && $scope.limit < $scope.dictations[$scope.level].length){
                $scope.loadMoreDictations();
                $scope.$apply();
            }
        }
    });

    $scope.$on("$destroy", function(){
        hideAds();
    });
}]);

es.controller('Dictation', ['$scope', '$location', '$http', '$routeParams', '$sce', 'dictationService', function ($scope, $location, $http, $routeParams, $sce, dictationService) {

    $scope.trustAsHtml = $sce.trustAsHtml;
    $scope.$on('$viewContentLoaded', function (event) {
        $('body').animate({scrollTop:0}, 1);
        lession = dictationService.getLession();
        esPlayer.loop = true;
        esPlayer.setSource(lession.file);
        esPlayer.setLyric(lession.lyric_time);
        $scope.title = lession.title;
        $scope.content = lession.content;
    });

    $scope.$on('$destroy', function (event) {
        esPlayer.pause();
        esPlayer.setSource(null);
    });

}]);

/* Story Section */
es.factory('storyService', function () {
    var lession;
    var state = {limit: 15, scroll: 0};

    var setLession = function (story) {
        lession = story;
    }

    var getLession = function () {
        return lession;
    }

    var setState = function (value) {
        state = value;
    }

    var getState = function () {
        return state;
    }

    return {
        addLession: setLession,
        getLession: getLession,
        setState: setState,
        getState: getState
    };
});

es.controller('englishStories', ['$scope', '$http', '$location', 'storyService', function ($scope, $http, $location, storyService) {
    $scope.limit = storyService.getState().limit;

    $scope.$on('$viewContentLoaded', function (event) {
        $scope.stories = database.getStoryData();
        $('body').animate({scrollTop: storyService.getState().scroll}, 1);
        showAds();
    });

    $scope.assignStory = function (story) {
        storyService.addLession(story);
        storyService.setState({limit: $scope.limit, scroll: $('body').scrollTop()});
        $location.path('/story');
    }

    $scope.loadMoreStories = function(){
        $scope.limit = $scope.limit+30;
    }

    $(window).off().on('scroll', function() {
        if($(window).scrollTop() >= $(document).height()-$(window).height()-100) {
            if($location.path()=='/english-stories' && $scope.limit < $scope.stories.length){
                $scope.loadMoreStories();

                $scope.$apply();
            }
        }
    });

    $scope.$on("$destroy", function(){
        hideAds();
    });

}]);

es.controller('Story', ['$scope', '$location', '$http', '$routeParams', '$sce', 'storyService', function ($scope, $location, $http, $routeParams, $sce, storyService) {

    $scope.trustAsHtml = $sce.trustAsHtml;
    $scope.$on('$viewContentLoaded', function (event) {
        $scope.lession = storyService.getLession();
        $('body').animate({scrollTop:0}, 1);
        esPlayer.loop = true;
        esPlayer.setSource($scope.lession.file);
    });

    $scope.$on('$destroy', function (event) {
        esPlayer.pause();
        esPlayer.setSource(null);
    });

}]);

/* Pronunciation Section */
es.factory('pronunciationService', function () {
    var lession;

    var setLession = function (unit) {
        lession = unit;
    }

    var getLession = function () {
        return lession;
    }

    return {
        addLession: setLession,
        getLession: getLession
    };
});

es.controller('Pronunciation', ['$scope', '$http', '$location', 'pronunciationService', function ($scope, $http, $location, pronunciationService) {

    $scope.lessions = database.getPronunciationData();

    $scope.assignLession = function (lession) {
        pronunciationService.addLession(lession);
        $location.path('/pronunciation-lession');
    }

    $scope.$on("$viewContentLoaded", function(){
        showAds();
    });

    $scope.$on("$destroy", function(){
        hideAds();
    });

}]);

es.controller('pronunciationLession', ['$scope', '$location', '$http', '$routeParams', '$sce', 'pronunciationService', function ($scope, $location, $http, $routeParams, $sce, pronunciationService) {
    var tabStaticTop = $('.pronunciation-sections').offset().top;
    var tabStaticHeight = $('.pronunciation-sections').height();
    var headerHeight = $('.ui-header-fixed').height();
    var firstLoad = true;

    $scope.trustAsResourceUrl = $sce.trustAsResourceUrl;
    $scope.trustAsHtml = $sce.trustAsHtml;

    $scope.$on('$viewContentLoaded', function (event) {
        lession = pronunciationService.getLession();
        $scope.title = lession.title;
        $scope.video = 'https://www.youtube.com/embed/' + lession.video + '?rel=0&amp;showinfo=0&fs=1';
        $scope.sections = lession.sections;
        $scope.loadPronunciationSection(0);
        firstLoad = false;
		$(window).scroll(function () {
			if($('.pronunciation-sections').length > 0){
				if ($('body').scrollTop() + headerHeight >= tabStaticTop) {
					$('.pronunciation-sections').addClass('fixed').css({'top': headerHeight + 'px'});
					$('.section-content').css({'margin-top': tabStaticHeight+'px'});
				} else {
					$('.pronunciation-sections').removeClass('fixed');
					$('.section-content').css({'margin-top': 0});
				}
			}
		});
    });

    $scope.loadPronunciationSection = function (section) {
        if(!firstLoad){
            $('body').animate({
                scrollTop: tabStaticTop-tabStaticHeight
            }, 1000);
        }

        $scope.activeSection = section;
    }
}]);

/* Word Section */
es.controller('Words', ['$scope', '$location', '$http', '$routeParams', '$sce', 'storyService', function ($scope, $location, $http, $routeParams, $sce, storyService) {
    $scope.limit = 20;
    $scope.trustAsHtml = $sce.trustAsHtml;
    $scope.$on('$viewContentLoaded', function (event) {
        $scope.words = database.getWordData();
    });

    $scope.loadMoreWords = function(){
        $scope.limit += 20;
    }

    $scope.searching = function(){
        $("html, body").animate({ scrollTop: 0 }, 100);
    }

    $(window).off().on('scroll', function() {
        if($(window).scrollTop() >= $(document).height()-$(window).height()-100) {
            if($location.path()=='/words' && $scope.limit < $scope.words.length){
                $scope.loadMoreWords();
                $scope.$apply();
            }
        }
    });

    $scope.speak = function(url){
        esPlayer.loop = false;
        esPlayer.setSource(url);
        esPlayer.play();
    }

}]);

/* Word Bricks Section */
es.controller('wordBricks', ['$scope', '$location', '$http', '$routeParams', '$sce', function ($scope, $location, $http, $routeParams, $sce) {
    $scope.bricks = [];
    $scope.currentWord = null;
    var currentBricks = null;
    $scope.currentIndex = null;
    $scope.finish = false;

    $scope.words = database.getWordData();
    $scope.idioms = database.getIdiomData();

    $scope.user = database.readUserData();

    $scope.$on('$viewContentLoaded', function (event) {
        $scope.buildWall();
        showAds();
    });

    $scope.$on("$destroy", function(){
        hideAds();
    });

    $scope.buildWall = function(){
        wallHeight = 15;
        bricks = [];
        selectedWords = [];
        while (bricks.length < wallHeight){
            wordIndex = Math.floor(Math.random() * ($scope.words.length));
            if($.inArray(wordIndex, bricks) < 0){
                bricks.push(wordIndex);
            }
        }
        for (i = 0; i<bricks.length; i++){
            selectedWords.push($scope.words[bricks[i]]);
        }

        $scope.bricks = selectedWords;
        currentBricks = angular.copy(selectedWords);
        $scope.currentIndex = Math.floor(Math.random() * (wallHeight));
        $scope.currentWord = currentBricks[$scope.currentIndex];
        $scope.finish = false;
    }

    $scope.breakBrick = function(event, word){
        if($scope.currentWord.word == word){
            $(event.target).addClass('disabled');
            currentBricks.splice($scope.currentIndex, 1);
            $scope.currentIndex = Math.floor(Math.random() * (currentBricks.length));
            $scope.currentWord = currentBricks[$scope.currentIndex];
            $scope.user.score1 = parseInt($scope.user.score1)+1;
            if(currentBricks.length == 0){
                $('.brick-wall .brick').removeClass('disabled');
                $scope.showResult();
            }
        } else {
            $scope.user.score1 = parseInt($scope.user.score1)-1;
        }
    }

    $scope.showResult = function(){
        $scope.finish = true;
        idiomIndex = Math.floor(Math.random() * ($scope.idioms.length));
        $scope.idiom = $scope.idioms[idiomIndex];
        database.syncUserData($scope.user);
    }

}]);

/* Underscores Section */
var currentInterval;
es.controller('Underscores', ['$scope', '$location', '$http', '$routeParams', '$sce', function ($scope, $location, $http, $routeParams, $sce) {
    $scope.idioms = database.getIdiomData();
    $scope.user = database.readUserData();

    $scope.passed = [];
    $scope.currentIndex = null;
    $scope.currentIdiom = null;
    $scope.hintLevel = 0;
    $scope.quizStart = false;

    $scope.start = function(){
        if($(document).find('#start-quiz').length > 0){
            $(document).find('#start-quiz').remove();
        }
        $scope.quizStart = true;
        idiomIndex = null;
        while (!idiomIndex || $.inArray(idiomIndex, $scope.passed) > 0){
            idiomIndex = Math.floor(Math.random() * ($scope.idioms.length));
        }

        if($scope.currentIndex != idiomIndex){
            $scope.currentIndex = idiomIndex;
            $scope.currentIdiom = $scope.idioms[idiomIndex];
            $scope.showNewQuestion();
        }
        hideAds();
        $('.quiz-answer').show();
    }

    $scope.showNewQuestion = function(){
        uds = String('_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ ').substr(0, $scope.currentIdiom.keyword.length*2);
        questionText = $scope.currentIdiom.content.replace($scope.currentIdiom.keyword, uds);
        question = '<div class="message mgt-20"><table><tr><td><img src="./img/show-question.gif"></td><td>';
        question+= '<span><b>Find the keyword</b></span><br><span>'+questionText+'</span></td></tr></table></div>';
        $('.quiz-content').append(question);
        $("html, body").animate({ scrollTop: $(document).height() }, 1000);
        currentInterval = setInterval(function(){
            $scope.showHint();
        }, 10000);
    }

    $scope.showHint = function(){
        switch ($scope.hintLevel){
            case 0:
                hint = '<div class="message mgt-20"><table><tr><td><img src="./img/show-explanation.gif"></td><td>';
                hint+= '<span><b>First hint</b></span><br><span>'+$scope.currentIdiom.explanation+'</span></td></tr></table></div>';
                break;
            case 1:
                hint = '<div class="message mgt-20"><table><tr><td><img src="./img/hint-1.gif"></td><td>';
                hint+= '<span><b>Second hint</b></span><br><span>'+$scope.makeHint()+'</span></td></tr></table></div>';
                break;
            case 2:
                randIcon = getRandomInt(1, 2);
                hint = '<div class="message mgt-20"><table><tr><td><img src="./img/hint-2-'+randIcon+'.gif"></td><td>';
                hint+= '<span><b>Third hint</b></span><br><span>'+$scope.makeHint()+'</span></td></tr></table></div>';
                break;
            default:
                $scope.finish('fail');
                return;
        }

        if($scope.hintLevel <= 2){
            $('.quiz-content').append(hint);
            $("html, body").animate({ scrollTop: $(document).height() }, 1000);
            $scope.hintLevel++;
        }
    }

    $scope.makeHint = function(){
        keyword = $scope.currentIdiom.keyword;
        hideLength = Math.floor(keyword.length/2);
        selectedPosition = [];
        while (selectedPosition.length < hideLength){
            randPosition = getRandomInt(0, keyword.length-1);
            if($.inArray(randPosition, selectedPosition) < 0){
                selectedPosition.push(randPosition);
            }
        }
        selectedPosition.forEach(function(position){
            keyword = keyword.replaceAt(position, '_');
        });
        keyword = keyword.replaceAll('_', ' _ ');
        return keyword.toUpperCase();
    }

    $scope.finish = function(result){
        clearInterval(currentInterval);
		$scope.passed.push($scope.currentIndex);
        answerText = $scope.currentIdiom.content.replace($scope.currentIdiom.keyword, '<b>'+$scope.currentIdiom.keyword.toUpperCase()+'</b>');
        randIcon = getRandomInt(1, 2);
        if(result == 'fail'){
            answer = '<div class="message mgt-20"><table><tr><td><img src="./img/fail-'+randIcon+'.gif"></td><td>';
            answer+= '<span><b>You Failed!</b></span><br><span>'+answerText+'</span><br>';
            answer+= '<span><i>('+$scope.currentIdiom.meaning+')</i></span></td></tr></table></div>';
        } else {
            answer = '<div class="message mgt-20"><table><tr><td><img src="./img/pass-'+randIcon+'.gif"></td><td>';
            answer+= '<span><b>Well done!</b></span><br><span>'+answerText+'</span><br>';
            answer+= '<span><i>('+$scope.currentIdiom.meaning+')</i></span></td></tr></table></div>';
        }
        $('.quiz-content').append(answer);
        $("html, body").animate({ scrollTop: $(document).height() }, 1000);
        $('.quiz-content').append('<div class="note">Waiting for new question (10 seconds)</div>');
        $scope.hintLevel = 0;
		
		// Clean answer area
        document.activeElement.blur();
        $('#answer-input').blur();
        $scope.keyword = '';
		if(!$scope.$$phase) {
			$scope.$apply();
		}
        $('.quiz-answer').hide();
        showAds();
		
		
        setTimeout(function(){
            $scope.start();
        }, 10000)
    }

    $scope.answer = function(answer){
        if(answer){
            if(answer == $scope.currentIdiom.keyword){
                answer = '<div class="answer"><div class="message mgt-20 correct">'+answer+'</div></div>';
                $('.quiz-content').append(answer);
                $scope.finish('pass');
				try {
					$scope.user.score2 = parseInt($scope.user.score2)+1;
					database.syncUserData($scope.user);
				} catch(e) {}
            } else {
                answer = '<div class="answer"><div class="message mgt-20 wrong">'+answer+'</div></div>';
                $('.quiz-content').append(answer);
            }
            $scope.keyword = '';
        }
    }

    $scope.$on('$destroy', function (event) {
        clearInterval(currentInterval);
        hideAds();
    });

    $scope.$on("$viewContentLoaded", function(){
        showAds();
    });

}]);

es.controller('Ranking', ['$scope', '$rootScope', '$route', '$location', function($scope, $rootScope, $route, $location){
    $scope.limit = 20;

    switch($route.current.params.type){
        case 'word-breakers':
            $scope.title = "Top brick breakers";
            $.get(apiUrl+'/user/ranking/brick', function (response) {
                if(response.code == 'OK'){
                    var usersArray = [];
                    for(var i in response.users) {
                        response.users[i].position = parseInt(i)+1;
                        usersArray.push(response.users[i]);
                    }
                    $scope.users = usersArray;
                    $scope.$apply();
                }
            });
            break;
        case 'underscores':
            $scope.title = "Underscores's winners";
            $.get(apiUrl+'/user/ranking/underscore', function (response) {
                if(response.code == 'OK'){
                    var usersArray = [];
                    for(var i in response.users) {
                        response.users[i].position = parseInt(i)+1;
                        usersArray.push(response.users[i]);
                    }
                    $scope.users = usersArray;
                    $scope.$apply();
                }
            });
            break;
    }

    $scope.loadMore = function(){
        $scope.limit = $scope.limit+30;
    }

    $(window).off().on('scroll', function() {
        if($(window).scrollTop() >= $(document).height()-$(window).height()-100) {
            if($location.path()=='/ranking' && $scope.limit < $scope.users.length){
                $scope.loadMore();
                $scope.$apply();
            }
        }
    });

    $scope.$on("$viewContentLoaded", function(){
        showAds();
    });

    $scope.$on("$destroy", function(){
        hideAds();
    });
}]);

es.controller('User', ['$scope', '$rootScope', '$timeout', function($scope, $rootScope, $timeout){
    $scope.user = database.readUserData();
    if(!$scope.user){
        setTimeout(function(){
            $scope.user = database.readUserData();
            $scope.$apply();
        }, 5000);
    }

    $scope.saveInfo = function(){
        $scope.editing = false;
        database.syncUserData($scope.user);
    }

    $scope.showEdit = function(){
        $scope.editing = true;
        $timeout(function() { $('#edit-user-input').focus(); });
    }

}]);

app.initialize();

function showInlineSearch(){
    $(document).find('.header-text').hide();
    $(document).find('#search-input').show().focus();
    $(document).find('.inline-search-result').show();
    $(document).find('#inline-search-open').hide();
    $(document).find('#inline-search-close').show();
}

function hideInlineSeach(){
    $(document).find('.header-text').show();
    $(document).find('#search-input').hide().val('');
    angular.element($('#search-input')).triggerHandler('input');
    $(document).find('.inline-search-result').hide();
    $(document).find('#inline-search-open').show();
    $(document).find('#inline-search-close').hide();
}

var currentScroll;

function showLeftMenu(){
    $(document).find('#leftpanel').addClass('ui-panel-open left-menu-show').removeClass('left-menu-hide').show();
    $(document).find('.menu-func').height($(window).height()-$('.nd2-sidepanel-profile').height()-100);
    $(document).find('.ui-panel-dismiss').show();
    $(document).find('.menu-content-wrapper').show();
    currentScroll = $('body').scrollTop()
    //$(document).find('.page-animate').addClass('no-scroll').height($(window).height());
}

function hideLeftMenu(){
    $(document).find('#leftpanel').removeClass('ui-panel-open left-menu-show').addClass('left-menu-hide');
    $(document).find('.menu-content-wrapper').hide();
    $(document).find('.ui-panel-dismiss').hide();
    //$(document).off('scroll touchmove mousewheel');
    //$('.page-animate').removeClass('no-scroll');
    $('body').scrollTop(currentScroll);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

String.prototype.replaceAt=function(index, char) {return this.substr(0, index) + char + this.substr(index+char.length);}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

/* Admob Setup */

var admobid = 'ca-app-pub-7721059348836288/3836248053';

function createAds(){
    if(AdMob) AdMob.createBanner( {
        //isTesting:true, //Remove this Before publishing your app
        adId:admobid,
        position:AdMob.AD_POSITION.BOTTOM_CENTER,
        autoShow:true
    }, function(){}, function(){
        AdMob.removeBanner();
    });
}

function showAds(){
	if(typeof Admob != 'undefined'){
		try {
			//AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);
			createAds();
		} catch(e){
			//AdMob.hideBanner();
			AdMob.removeBanner();
		}
	}
}

function hideAds(){
	if(typeof Admob != 'undefined'){
		try {
			//AdMob.hideBanner();
			AdMob.removeBanner();
		} catch(e){}
	}
}