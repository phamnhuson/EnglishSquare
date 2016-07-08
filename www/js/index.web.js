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
    }
    esPlayer.src = url;
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
        $.get('http://english.deverway.com/api/dictation/level/all', function (response) {
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
        $.get('http://english.deverway.com/api/pronunciation/lession/all', function (response) {
            window.localStorage.setItem('pronunciations', JSON.stringify(response.pronunciations));
        });
    },
    getPronunciationData: function () {
        return JSON.parse(window.localStorage.getItem('pronunciations'));
    },
    writeStoryData: function () {
        $.get('http://english.deverway.com/api/story/lession/all', function (response) {
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
        $.get('http://english.deverway.com/api/word/all', function (response) {
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
    }
}

/* Build AngularJS App */
var player;
var es = angular.module('es', ['ngRoute', 'ngSanitize', 'ngAnimate', 'ngTouch']).run(function ($rootScope) {
    $rootScope.closeApp = false;
    $rootScope.loadingPage = true;
    database.writeDictationData();
    database.writePronunciationData();
    database.writeStoryData();
    database.writeWordData();
}).run(function ($rootScope, $location, $http, $templateCache) {
    $rootScope.pageClass = 'page-animate';
    $rootScope.screen = 'Dashboard';

    $rootScope.changeScreen = function(screen){
        $rootScope.screen = screen;
    }

    //$rootScope.dictations = database.getDictationData();
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        //$rootScope.loadingPage = true;
    });
    $rootScope.$on("$viewContentLoaded", function (event, next, current) {
        initCss();
        //$rootScope.loadingPage = false;
    });
    //var tag = document.createElement('script');
    //
    //tag.src = "https://www.youtube.com/iframe_api";
    //var firstScriptTag = document.getElementsByTagName('script')[0];
    //firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    $http.get('views/listen-and-repeat.html', { cache: $templateCache });

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
        document.addEventListener('deviceready', this.onDeviceReady, true);
        Waves.init();
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        navigator.splashscreen.hide();
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

es.controller('Dashboard', ['$rootScope', '$scope', '$location', '$animate', function ($rootScope, $scope, $location, $animate) {

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

es.controller('listenAndRepeat', ['$rootScope', '$scope', '$http', '$location', 'dictationService', '$animate', '$templateCache', function ($rootScope, $scope, $http, $location, dictationService, $animate, $templateCache) {

    $scope.levels = [1, 2, 3, 4];
    //$scope.dictations = $rootScope.dictations;
    $scope.dictations = database.getDictationData();
    $scope.$on('$viewContentLoaded', function (event) {
        $scope.dictations = database.getDictationData();
        //$scope.loadDictationLevel(dictationService.getState().level);
        //$('body').animate({scrollTop: dictationService.getState().scroll}, 1);
    });

    $scope.assignDictation = function (dictation) {
        dictationService.addLession(dictation);
        dictationService.setState({level: dictation.level, scroll: $('body').scrollTop()});
        $location.path('/dictation');
    }

    $scope.loadDictationLevel = function (level) {
        if (level > 0 && level <= 4) {
            $scope.level = level;
            $('body').animate({scrollTop:0}, 1);
        }
    }

    $scope.limit = 15;
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

}]);

es.controller('Dictation', ['$scope', '$location', '$http', '$routeParams', '$sce', 'dictationService', '$animate', function ($scope, $location, $http, $routeParams, $sce, dictationService, $animate) {

    $animate.on('enter', $('body'),
        function callback(element, phase) {
            initCss();
        }
    );

    $scope.trustAsHtml = $sce.trustAsHtml;
    $scope.$on('$viewContentLoaded', function (event) {
        $('body').animate({scrollTop:0}, 1);
        lession = dictationService.getLession();
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

    var setLession = function (story) {
        lession = story;
    }

    var getLession = function () {
        return lession;
    }

    return {
        addLession: setLession,
        getLession: getLession
    };
});

es.controller('englishStories', ['$scope', '$http', '$location', 'storyService', '$animate', function ($scope, $http, $location, storyService, $animate) {
    $scope.limit = 15;

    $scope.$on('$viewContentLoaded', function (event) {
        $scope.stories = database.getStoryData();
    });

    $scope.assignStory = function (story) {
        storyService.addLession(story);
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

}]);

es.controller('Story', ['$scope', '$location', '$http', '$routeParams', '$sce', 'storyService', '$animate', function ($scope, $location, $http, $routeParams, $sce, storyService, $animate) {

    $scope.trustAsHtml = $sce.trustAsHtml;
    $scope.$on('$viewContentLoaded', function (event) {
        $scope.lession = storyService.getLession();
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

es.controller('Pronunciation', ['$scope', '$http', '$location', 'pronunciationService', '$animate', function ($scope, $http, $location, pronunciationService, $animate) {

    $scope.lessions = database.getPronunciationData();

    $scope.assignLession = function (lession) {
        pronunciationService.addLession(lession);
        $location.path('/pronunciation-lession');
    }
}]);

es.controller('pronunciationLession', ['$scope', '$location', '$http', '$routeParams', '$sce', 'pronunciationService', '$animate', function ($scope, $location, $http, $routeParams, $sce, pronunciationService, $animate) {
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
    });

    $scope.loadPronunciationSection = function (section) {
        if(!firstLoad){
            $('body').animate({
                scrollTop: tabStaticTop-tabStaticHeight
            }, 1000);
        }

        $scope.activeSection = section;
    }

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
}]);

/* Word Section */
es.controller('Words', ['$scope', '$location', '$http', '$routeParams', '$sce', 'storyService', '$animate', function ($scope, $location, $http, $routeParams, $sce, storyService, $animate) {
    $scope.limit = 20;
    $scope.trustAsHtml = $sce.trustAsHtml;
    $scope.$on('$viewContentLoaded', function (event) {
        $scope.words = database.getWordData();
    });

    $scope.loadMoreWords = function(){
        $scope.limit += 20;
    }

    $(window).off().on('scroll', function() {
        if($(window).scrollTop() >= $(document).height()-$(window).height()-100) {
            if($location.path()=='/words' && $scope.limit < $scope.words.length){
                $scope.loadMoreWords();
                $scope.$apply();
            }
        }
    });

}]);

/* Word Bricks Section */
es.controller('wordBricks', ['$scope', '$location', '$http', '$routeParams', '$sce', 'storyService', '$animate', function ($scope, $location, $http, $routeParams, $sce, storyService, $animate) {
    $scope.bricks = [];
    $scope.currentWord = null;
    var currentBricks = null;
    $scope.currentIndex = null;
    $scope.finish = false;

    $scope.$on('$viewContentLoaded', function (event) {
        $scope.words = database.getWordData();
        $scope.buildWall();
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

            if(currentBricks.length == 0){
                $('.brick-wall .brick').removeClass('disabled');
                $scope.showResult();
            }
        }
    }

    $scope.showResult = function(){
        $scope.finish = true;
    }

}]);

app.initialize();

function initCss() {
    //$(document).find('.ui-page-header-fixed').css({'padding-top': $(document).find('.ui-header-fixed').height()});
}


