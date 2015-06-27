




/*
     FILE ARCHIVED ON 22:16:17 Dec 5, 2010 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 1:55:56 Jun 27, 2015.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
if (!window['SW']) {
    var SW = {};
}

document.observe('dom:loaded', function () {
    SW.TOPSEARCH.initListeners();
});

SW.TOPSEARCH =
{
    initListeners: function()
    {
        if ($('shapewaysSearch')) {
          $('shapewaysSearch').observe('focus', SW.TOPSEARCH.handleFocus);
          $('shapewaysSearch').observe('blur', SW.TOPSEARCH.handleBlur);
        }
    },

    handleFocus: function()
    {
        var el = $('shapewaysSearch');

        if (el.defaultValue == $F(el)) {
            el.value = "";
        }

        new Effect.Morph(el.up('div'), {
            style: 'width: 300px;'
        });
    },

    handleBlur: function()
    {
        var el = $('shapewaysSearch');

        el.up('div').setStyle({
            'width': '110px'
        });
    }
}