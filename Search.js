'use strict';

(function ($) {
 
    var globalResponse, 
        ret = [],
        moduleList = [],
        moduleListAux = [],
        currentModule,
        apiKey,
        
        // Function to process the JSON returned
        processRow = function (row) {
            var image = '/album.png',
                obj;

            if (
                undefined !== row.image && row.image instanceof Array &&
                    row.image.length > 0
            ) {
                image = row.image[undefined !== row.image[1] ? 1 : 0]['#text'];
            }

            if ('artist' === currentModule) {
                row.artist = row.name;
            }

            obj = {
                data: row.artist + ' - ' + row.name,
                value: 'artist' === currentModule ? row.name : row.artist + ' - ' + row.name,
                category: currentModule,
                artist: row.artist,
                musicTitle: row.name,
                lastfm: row.url
            };

            obj.label = '<div class="cover"><img src="' + image +
                '"/></div> <div class="description"><span>' + obj.value +
                '</span></div>';


            return obj;
        };
        
    function callbackAutocomplete(data) {
        var aux = null,
            acData;

        if (null !== data && undefined !== data.results) {
            if (undefined !== data.results.albummatches) {
                acData = data.results.albummatches.album;
                currentModule = 'album';
            } else if (undefined !== data.results.trackmatches) {
                acData = data.results.trackmatches.track;
                currentModule = 'track';
            } else if (undefined !== data.results.artistmatches) {
                acData = data.results.artistmatches.artist;
                currentModule = 'artist';
            }

            aux = $.map(acData, processRow, 'json');

            if (null !== aux) {
                ret = ret.concat(aux);
                moduleListAux.push(currentModule);
            }
        }

        // Only call globalResponse when all the modules have checked-in.
        if (moduleListAux.length === moduleList.length) {
            moduleListAux = [];
            globalResponse(ret);
            ret = [];
        }
    }

    function acError() {
        $.bootstrapMessageAuto(
            $.i18n._('Error loading suggestions. Please, try reloading your browser.'),
            'error'
        );
    }

    function openAutocomplete() {
        $('.ui-autocomplete').addClass(0 === $('#userId').length ? 'ui-autocomplete-logout' : 'ui-autocomplete-login');
    }

    $.widget("custom.lfmSearch", $.ui.autocomplete, {
        _renderMenu: function (ul, items) {
            var that = this,
                currentCategory = "";
            $.each(items, function (index, item) {
                if (item.category !== currentCategory) {
                    var t = item.category.charAt(0).toUpperCase() + item.category.slice(1) + 's';
                    ul.append("<li class='ui-autocomplete-category " + item.category + "'>" + t + "</li>");
                    currentCategory = item.category;
                }
                that._renderItemData(ul, item);
            });
        }
    });

    $.ui.autocomplete.prototype._renderItem = function (ul, row) {
        var a = $('<li></li>')
            .data('item.autocomplete', row)
            .append('<a>' + row.label + '</a>')
            .appendTo(ul)
            .addClass(row.category);
        return a;
    };

    $.fn.lfmComplete = function (options) {
        var bindOption = {
            messages: {
                noResults: ''
            },
            open: openAutocomplete,
            source: function(request, response) {
                var baseUrl = window.location.protocol + '//ws.audioscrobbler.com/2.0/',
                    key,
                    optionSet;

                for (key in moduleList) {
                    if (['artist', 'album', 'track'].indexOf(moduleList[key]) >= 0) {
                        globalResponse = response;
                        optionSet = {
                            method: moduleList[key] + ".search",
                            api_key: apiKey,
                            limit: 5,
                            format: 'json'
                        };
                        optionSet[moduleList[key]] = request.term;
                        $.get(baseUrl, optionSet, callbackAutocomplete, 'json').error(acError);
                    }
                }
            }
        };

        // Evaluate options.callback
        if (null !== options && undefined !== options.callback && 'function' === typeof options.callback) {
            bindOption.select = bindOption.change = options.callback;
        }

        // Evaluate options.modules
        if (
            null !== options && undefined !== options.modules &&
                'object' === typeof options.modules &&
                options.modules instanceof Array
        ) {
            moduleList = options.modules;
        } else {
            moduleList = [];
        }

        // Evaluate options.apiKey
        if (null !== options && undefined !== options.apiKey && 'string' === typeof options.apiKey) {
            apiKey = options.apiKey;
        }

        this.lfmSearch(bindOption);
    };

}(jQuery));