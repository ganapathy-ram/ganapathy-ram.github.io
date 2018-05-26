(function ($) {
    'use strict';

    function handleChoice(e, ui) {
        var d = ui.item;

        if (null !== d) {
            $('#value').html(d.value);
            $('#category').html(d.category);
            $('#artist').html(d.artist);
            $('#musicTitle').html(d.musicTitle);
            $('#label').html('<pre>' + d.label + '</pre>');
            $('#data').html(d.data);
            $('#lastfm').html((d.url);
        }
    }

    function bindLastFMSearch() {

        var bindOptions = {
            callback: handleAutocompleteChoice,
            modules: [],
            apiKey: '8adb316a07333f1049cf0bf5d6e2f5d1'
        };

        // See what modules, among ['artist', 'album', 'track'], are checked.
        var modules = [];
        $('.music-type').each(function(key, value) {
            if ($(this).is(':checked')) {
                modules.push($(this).attr('id'));
            }
        });
        bindOptions.modules = modules;

        // if lfmAutocomplete is already placed, remove it.
        if ($('#search').data('custom-lfmAutocomplete')) {
            $('#search').lfmAutocomplete("destroy");
            $('#search').removeData('custom-lfmAutocomplete');
        }

        // bind autocomplete.
        $('#search').lfmComplete(bindOptions);
    }

    $(document).ready(function() {
        $('.music-type').on('change', function(e) {
            // rebind lfmAutocomplete when checkbox items changes.
            bindLastFMSearch();
        });

        // First time it binds lfmAutocomplete.
        bindLastFMSearch();
    });
}(jQuery));