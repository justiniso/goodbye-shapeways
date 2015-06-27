




/*
     FILE ARCHIVED ON 5:29:57 Jun 15, 2012 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 1:33:54 Jun 27, 2015.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
new TWTR.Widget({
  version: 2,
  type: 'profile',
  rpp: 1,
  interval: 30000,
  width: 250,
  height: 'auto; -arnom-nl: 0',
  theme: {
    shell: {
      background: '#ffffff',
      color: '#000000'
    },
    tweets: {
      background: '#ffffff',
      color: '#444444',
      links: '#44b1e4'
    }
  },
  features: {
    scrollbar: false,
    loop: false,
    live: true,
    hashtags: true,
    timestamp: false,
    avatars: false,
    behavior: 'all'
  }
}).render().setUser('shapeways').start();
