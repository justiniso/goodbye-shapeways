




/*
     FILE ARCHIVED ON 18:52:53 Jun 19, 2012 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 1:33:54 Jun 27, 2015.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
//<div id="latest-forum-rss" class="rss-box"><ul class="rss-items"></ul></div>
//get rss feed
jQuery.ajax({
        type: "GET",
        url: "/forum/rdf.php?mode=m&basic=1&n=10&l",//n = limit, l = latest
        datatype: 'xml',
        success: function(data) {
          var count = 0,
              maxCount = 10;
          jQuery('#latest-forum-rss').append('<ul class="rss-items"></ul>');
          jQuery(data).find('item').each(function() {
            if(count < maxCount
              && jQuery(this).children('link')[0].childNodes[0] !== undefined
              && jQuery(this).children('title')[0].childNodes[0] !== undefined
              ) {
              jQuery('#latest-forum-rss .rss-items').append('<li class="rss-item"><a class="rss-item" target="_self" href="'
                            +jQuery(this).children('link')[0].childNodes[0].data+'">'
                            +jQuery(this).children('title')[0].childNodes[0].data+'</a><br/></li>');
              count = count + 1;
            }
          });
        }
});