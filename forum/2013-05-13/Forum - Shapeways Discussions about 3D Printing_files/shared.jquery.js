




/*
     FILE ARCHIVED ON 19:05:44 May 10, 2013 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 1:57:28 Jun 27, 2015.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
(function ($) {

  if (typeof $.swPortal == 'undefined') {
    $.swPortal = { };
  }

  /* Facebook functions */
  window.fbAsyncInit = function () {
    FB.init({
      appId:$.swPortal.facebookAppId,
      status:true, // check login status
      cookie:true, // enable cookies to allow the server to access the session
      xfbml:true, // parse XFBML
      oauth:true
    });
    if (FB.Event && FB.Event.subscribe) {
      $modelId = false;
      // auth.prompt should only occur on a like button.. hopefully this won't change!
      FB.Event.subscribe('auth.prompt', function (targetUrl) {
        $parsePairs = targetUrl.split("?");
        if ($parsePairs.length > 1) {
          $modelValuePair = $parsePairs[1].split("=");
          if ($modelValuePair.length > 1) {
            $modelId = $modelValuePair[1];
          }
        }
        if (!$modelId && typeof $.swPortal.pageModelId != 'undefined') {
          $modelId = $.swPortal.pageModelId;
        }
        if ($modelId) {
          $.swPortal.modelShareIntentTrack($.swPortal.eventTracking.modelShareIntentLoggedOut, $modelId, 'facebook');
        }
      });
      FB.Event.subscribe('edge.create', function (targetUrl) {
        $parsePairs = targetUrl.split("?");
        if ($parsePairs.length > 1) {
          $modelValuePair = $parsePairs[1].split("=");
          if ($modelValuePair.length > 1) {
            $modelId = $modelValuePair[1];
          }
        }
        if (!$modelId && typeof $.swPortal.pageModelId != 'undefined') {
          $modelId = $.swPortal.pageModelId;
        }
        if ($modelId) {
          $.swPortal.modelShareIntentTrack($.swPortal.eventTracking.modelShareIntentComplete, $modelId, 'facebook');
        }
      });
    }
  };
  /* /Facebook functions */

  /* Twitter functions */

  $.swPortal.loadTwitter = function () {

    if ($.swPortal.twitterLoaded) {
      return;
    }

    window.twttr = (function (d, s, id) {
      var t, js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = "//platform.twitter.com/widgets.js";
      fjs.parentNode.insertBefore(js, fjs);
      return window.twttr || (t = { _e:[], ready:function (f) {
        t._e.push(f)
      } });
    }(document, "script", "twitter-wjs"));

    twttr.ready(function (twttr) {
      _ga.trackTwitter();

      if ($('a.twitter-share-button').length) {

        twttr.events.bind('click', function (event) {
          $modelId = $(event.target).closest('div.feed-social').data('sw_modelid');
          if (!$modelId && typeof $.swPortal.pageModelId != 'undefined') {
            $modelId = $.swPortal.pageModelId
          }
          if ($modelId && event && event.region == 'tweet') {
            $.swPortal.modelShareIntentTrack($.swPortal.eventTracking.modelShareIntent, $modelId, 'twitter');
          }
        });
        twttr.events.bind('tweet', function (event) {
          $modelId = $(event.target).closest('div.feed-social').data('sw_modelid');
          if (!$modelId && typeof $.swPortal.pageModelId != 'undefined') {
            $modelId = $.swPortal.pageModelId
          }
          if ($modelId && event) {
            $.swPortal.modelShareIntentTrack($.swPortal.eventTracking.modelShareIntentComplete, $modelId, 'twitter');
          }
        });
      }
    });

    $.swPortal.twitterLoaded = true;
  };

  $.swPortal.loadGooglePlus = function () {
    window.gPlusClick = function (data) {
      if (data.state == 'on' && typeof $.swPortal.pageModelId != 'undefined') {
        $.swPortal.modelShareIntentTrack($.swPortal.eventTracking.modelShareIntentComplete, $.swPortal.pageModelId, 'google');
      }
    };
    (function () {
      var po = document.createElement('script');
      po.type = 'text/javascript';
      po.async = true;
      po.src = '/web/20130510190544/https://apis.google.com/js/plusone.js';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(po, s);
    })();
  };

  /* /Twitter functions */

  /* Search results page functions */

  $.swPortal.scriptifyFacets = function () {

    var $priceSpan = $('#priceRangeFacetSpan');

    if ($priceSpan.length) {
      var $priceRange = {
        min:$('#facetPriceMin').val(),
        max:$('#facetPriceMax').val(),
        from:$('#facetPriceFrom').val(),
        to:$('#facetPriceTo').val()
      };

      if (!$priceRange.from) {
        $priceRange.from = $priceRange.min
      }
      if (!$priceRange.to) {
        $priceRange.to = $priceRange.to = $priceRange.max
      }

      // no negatives...
      for (i in $priceRange) {
        $priceRange[i] = Math.max($priceRange[i], 0);
      }

      $priceRange['range'] = $priceRange.max - $priceRange.min;
      $priceRange['step'] = Math.round($priceRange['range'] / 100);

      //console.log($priceRange);

      $priceSpan.hide();

      var $priceSlider = $('#priceRangeFacetSlider .ui-slider').slider({
        min:$priceRange.min,
        max:$priceRange.max,
        range:true,
        step:1,
        values:[$priceRange.from, $priceRange.to]
      });

      $priceSlider.find('.ui-slider-range-placeholder').remove();

      $priceSlider.bind("slidestart slide slidestop slidechange", function (event, ui) {
        //values not changed before the slide event is called, give it a timeout
        setTimeout(function () {
          var maxPriceUsed = '';
          if ($priceSlider.slider("values", 1) >= 2500) {
            maxPriceUsed = '+';
          }
          $('#selectedPriceRangeLabel').text($.swPortal.formatDollar($priceSlider.slider("values", 0), false, true) + ' - ' + $.swPortal.formatDollar($priceSlider.slider("values", 1), false, true) + maxPriceUsed);
        }, 50);
      });

      $priceSlider.bind("slidestart", function (event, ui) {
        //make sure we don't refresh the page..
        if ($.swPortal.priceRefreshResultsTimeout != null) {
          clearTimeout($.swPortal.priceRefreshResultsTimeout);
          $.swPortal.priceRefreshResultsTimeout = null;
        }
      });

      $priceSlider.bind("slidestop slidechange", function (event, ui) {
        // set the values to the input fields..
        $('#facetPriceFrom').val($priceSlider.slider("values", 0));
        $('#facetPriceTo').val($priceSlider.slider("values", 1));

        //refresh results after small timeout in case the user wants to change the other price handle
        if ($.swPortal.priceRefreshResultsTimeout == null) {
          $.swPortal.priceRefreshResultsTimeout = setTimeout($.swPortal.searchResultsRefresh, 2000);
        }
      });
    }

    $('#facetIsCustomizable').click(function () {
      $.swPortal.searchResultsRefresh();
    });

    $('#facetUpdateButton').remove();
  };

  $.swPortal.priceRefreshResultsTimeout = null;

  $.swPortal.searchResultsRefresh = function () {
    if ($('#searchFacetsForm').length) {
      $('#searchFacetsForm').submit();
    }
  };

  $.swPortal.scriptifySortOptions = function () {
    var $sortOptions = $('#searchResultsSortOptions');
    if ($sortOptions.length) {
      $sortOptions.change(function () {
        $(this).closest('form').submit();
      });
      $sortOptions.next('input').remove();
      //$sortOptions.selectbox();
    }
  };

  $.swPortal.scriptifyProductBoxes = function () {
    $('.product-box').hover(function () {
      $(this).addClass('hover');
    },function () {
      $(this).removeClass('hover');
    }).click(function (event) {
          //if we're not an anchor or inside an anchor or select
          if (!$(event.target).is("a") && !$(event.target).closest('a').length
              && !$(event.target).is("select") && !$(event.target).closest('select').length) {
            var $productUrl = $(this).find('a.product-url:first');
            if ($productUrl.length) {
              if (jQuery(event).attr('ctrlKey')) {
                window.open($productUrl.attr('href'));
              } else {
                document.location.href = $productUrl.attr('href');
              }
              return true;
            }
          }
        });
  };

  /* /Search results page functions */


  /* Social intents tracking */

  $.swPortal.modelShareIntentTrack = function ($modelShareType, $modelId, $service) {
    if (typeof $.swPortal.rid != 'undefined') {
      SW.track($modelShareType, {
        modelId:$modelId,
        service:$service,
        rid:$.swPortal.rid
      });
    }
  };

  /* /Social intents tracking */

  /* Generic functions */

  $.swPortal.formatDollar = function ($val, $includeCents, $includeDollarSymbol) {
    var $valFloat = parseFloat($val);
    if (isNaN($valFloat)) {
      return $val;
    }

    $valParts = $valFloat.toFixed(2).split(".");

    $dollarAmount = '';
    var j = 0;
    for (var i = $valParts[0].length - 1; i >= 0; i--) {
      $dollarAmount = $valParts[0].charAt(i) + $dollarAmount;
      if (++j == 3 && i > 0) {
        $dollarAmount = ',' + $dollarAmount;
        j = 0;
      }
    }

    return ($includeDollarSymbol ? '$' : '') + $dollarAmount + ($includeCents ? '.' + $valParts[1] : '');
  };

  /* /Generic functions */

  $.swPortal.addToCartPopup = function ($href, $params) {
    $.get($href, $params, function (html) {
      if (html) {
        $("#addtocart_popup_container").html(html);
        if (isNaN(parseInt($("#cartcount").html()))) {
          $(".header-cart").addClass("with-items");
          $(".header-cart a").html('<div id="cartcount">1</div>');
        }
        else {
          $("#cartcount").html(parseInt($("#cartcount").html()) + 1);
        }
        $("#addtocart_popup_container").show();
        //setTimeout(function() { close_addtocart_popup(); }, 3900);
      }
    });
  };

  $(document).ready(function () {

    // bind to input focus only after the first menu hover - otherwise autocomplete will trigger the focus event
    $('#header-login').one('mouseover', function () {
      // make login popdown stick when fields have focus
      $('#header-login input').focus(function () {
        $('#header-login').addClass('hover');
      }).blur(function () {
          $('#header-login').removeClass('hover');
        });
    });

    // search results page stuff
    $.swPortal.scriptifyFacets();
    $.swPortal.scriptifySortOptions();

    $.swPortal.scriptifyProductBoxes();

    // pinterest click
    $('a.pin-it-button').click(function () {
      $modelId = $(this).closest('div.feed-social').data('sw_modelid');
      if (!$modelId && typeof $.swPortal.pageModelId != 'undefined') {
        $modelId = $.swPortal.pageModelId;
      }
      if ($modelId) {
        $.swPortal.modelShareIntentTrack($.swPortal.eventTracking.modelShareIntent, $modelId, 'pinterest');
      }
    });

    //terms and conditions modal
    jQuery('#termsAndConditionsLink').click(function (e) {
      var text = jQuery('.terms-and-conditions').html();
      showDialogText(text, 'SHAPEWAYS TERMS AND CONDITIONS', true, '640px', '');
      e.preventDefault();
    });

    jQuery('#privacyLink').click(function (e) {
      var text = jQuery('.privacy-statement').html();
      showDialogText(text, 'SHAPEWAYS PRIVACY STATEMENT', true, '640px', '');
      e.preventDefault();
    });

    $('a.add-to-cart-via-popup').click(function () {
      var $href = $(this).attr('href');
      if ($href.search('/cart/add?') > -1) {
        $href = $href.replace('/cart/add?', '/cart/add/ajax?');
        $.swPortal.addToCartPopup($href, []);
        return false;
      }
    });

    // Anchor Tag Easing Animation
    $("a").each(function(i, el) {
      var $el = $(el);
      var href = $el.attr('href');
      if(href && href[0] == '#') {
        $el.click(function(e) {
          e.preventDefault();
          var headerHeight = $("div#header-wrapper").height();
          var target_offset = $(href).offset() ? $(href).offset().top - headerHeight - 35 : 0;

          $("html, body").animate({scrollTop:target_offset}, 700, "easeOutExpo");

        });
      }
    });

    // checkbox-wrap focus animation
    $('.checkbox-wrap input').focus(function() {
      $(this).parent().addClass('focus');
    });
    $('.checkbox-wrap input').blur(function() {
      $(this).parent().removeClass('focus');
    });
  

    /*
     if (window.location.hash.search('addToCart=1') > -1 && (typeof $.swPortal.modelPageModelId != 'undefined') && (typeof $.swPortal.modelPageMaterialId != 'undefined')) {
     var params = { itemId  : $.swPortal.modelPageModelId , materialId : $.swPortal.modelPageMaterialId  };
     if (typeof $.swPortal.modelPageModelKey != 'undefined') {
     params.key = $.swPortal.modelPageModelKey;
     }
     $.swPortal.addToCartPopup('/cart/add/ajax', params);
     window.location.replace(window.location.href);
     }
     */

  });


  /*
   // ////////////////////////////////////// //
   //              menu.js                   //
   // ////////////////////////////////////// //

   $(document).ready(function() {
   $('ul.menuContainer').mouseenter(function () {$(this).addClass("subHover")});
   $('ul.menuContainer').mouseleave(function () {$(this).removeClass("subHover")});
   });
   */

  /* TRACKING FUNCTION */

  if (typeof SW == 'undefined') {
    SW = {
      startTime : new Date().getTime()
    };
  }

  //try { SW.exists(); } catch(e) { SW = { exists: function() { return true}}; }

  SW.track = function (eventName, data) {
    data['event'] = eventName;
    data['rid'] = $("#requestTrackingId").val();
    $.ajax({
      type:'POST',
      url:'/api/track',
      data:data
    });
  };

})(jQuery);


// ////////////////////////////////////// //
//          ga social tracking            //
// ////////////////////////////////////// //

/**
 * @fileoverview A simple script to automatically track Facebook and Twitter
 * buttons using Google Analytics social tracking feature.
 * @author api.nickm@google.com (Nick Mihailovski)
 */


/**
 * Namespace.
 * @type {Object}.
 */
var _ga = _ga || {};


/**
 * Ensure global _gaq Google Anlaytics queue has be initialized.
 * @type {Array}
 */
var _gaq = _gaq || [];


/**
 * Helper method to track social features. This assumes all the social
 * scripts / apis are loaded synchronously. If they are loaded async,
 * you might need to add the nextwork specific tracking call to the
 * a callback once the network's script has loaded.
 * @param {string} opt_pageUrl An optional URL to associate the social
 *     tracking with a particular page.
 * @param {string} opt_trackerName An optional name for the tracker object.
 */
_ga.trackSocial = function (opt_pageUrl, opt_trackerName) {
  _ga.trackFacebook(opt_pageUrl, opt_trackerName);
  _ga.trackTwitter(opt_pageUrl, opt_trackerName);
};


/**
 * Tracks Facebook likes, unlikes and sends by suscribing to the Facebook
 * JSAPI event model. Note: This will not track facebook buttons using the
 * iFrame method.
 * @param {string} opt_pageUrl An optional URL to associate the social
 *     tracking with a particular page.
 * @param {string} opt_trackerName An optional name for the tracker object.
 */
_ga.trackFacebook = function (opt_pageUrl, opt_trackerName) {
  if (typeof FB != 'undefined') {
    var trackerName = _ga.buildTrackerName_(opt_trackerName);
    try {
      if (FB && FB.Event && FB.Event.subscribe) {
        FB.Event.subscribe('edge.create', function (targetUrl) {
          _gaq.push([trackerName + '_trackSocial', 'facebook', 'like',
            targetUrl, opt_pageUrl]);
        });
        FB.Event.subscribe('edge.remove', function (targetUrl) {
          _gaq.push([trackerName + '_trackSocial', 'facebook', 'unlike',
            targetUrl, opt_pageUrl]);
        });
        FB.Event.subscribe('message.send', function (targetUrl) {
          _gaq.push([trackerName + '_trackSocial', 'facebook', 'send',
            targetUrl, opt_pageUrl]);
        });

        /* Comment tracking from the tucknott.net blog */

        FB.Event.subscribe('comment.create', function (targetUrl) {
          _gaq.push(['_trackSocial', 'facebook', 'comment', targetUrl]);
        });

        FB.Event.subscribe('comment.remove', function (targetUrl) {
          _gaq.push(['_trackSocial', 'facebook', 'uncomment', targetUrl]);
        });

      }
    } catch (e) {
    }
  }
};


/**
 * Returns the normalized tracker name configuration parameter.
 * @param {string} opt_trackerName An optional name for the tracker object.
 * @return {string} If opt_trackerName is set, then the value appended with
 *     a . Otherwise an empty string.
 * @private
 */
_ga.buildTrackerName_ = function (opt_trackerName) {
  return opt_trackerName ? opt_trackerName + '.' : '';
};


/**
 * Tracks everytime a user clicks on a tweet button from Twitter.
 * This subscribes to the Twitter JS API event mechanism to listen for
 * clicks coming from this page. Details here:
 * /web/20130510190544/http://dev.twitter.com/pages/intents-events#click
 * This method should be called once the twitter API has loaded.
 * @param {string} opt_pageUrl An optional URL to associate the social
 *     tracking with a particular page.
 * @param {string} opt_trackerName An optional name for the tracker object.
 */
_ga.trackTwitter = function (opt_pageUrl, opt_trackerName) {
  var trackerName = _ga.buildTrackerName_(opt_trackerName);
  try {
    if (twttr && twttr.events && twttr.events.bind) {
      twttr.events.bind('tweet', function (event) {
        if (event) {
          var targetUrl; // Default value is undefined.
          if (event.target && event.target.nodeName == 'IFRAME') {
            targetUrl = _ga.extractParamFromUri_(event.target.src, 'url');
          }
          _gaq.push([trackerName + '_trackSocial', 'twitter', 'tweet',
            targetUrl, opt_pageUrl]);
        }
      });
    }
  } catch (e) {
  }
};


/**
 * Extracts a query parameter value from a URI.
 * @param {string} uri The URI from which to extract the parameter.
 * @param {string} paramName The name of the query paramater to extract.
 * @return {string} The un-encoded value of the query paramater. underfined
 *     if there is no URI parameter.
 * @private
 */
_ga.extractParamFromUri_ = function (uri, paramName) {
  if (!uri) {
    return null;
  }
  var uri = uri.split('#')[0];  // Remove anchor.
  var parts = uri.split('?');  // Check for query params.
  if (parts.length == 1) {
    return null;
  }
  var query = decodeURI(parts[1]);

  // Find url param.
  paramName += '=';
  var params = query.split('&');
  for (var i = 0, param; param = params[i]; ++i) {
    if (param.indexOf(paramName) === 0) {
      return unescape(param.split('=')[1]);
    }
  }
  return null;
};

//IE7 Placeholder Fix (jQuery Plugin)
(function (b) {
  function d(a) {
    this.input = a;
    a.attr("type") == "password" && this.handlePassword();
    b(a[0].form).submit(function () {
      if (a.hasClass("placeholder") && a[0].value == a.attr("placeholder"))a[0].value = ""
    })
  }

  d.prototype = {show:function (a) {
    if (this.input[0].value === "" || a && this.valueIsPlaceholder()) {
      if (this.isPassword)try {
        this.input[0].setAttribute("type", "text")
      } catch (b) {
        this.input.before(this.fakePassword.show()).hide()
      }
      this.input.addClass("placeholder");
      this.input[0].value = this.input.attr("placeholder")
    }
  },
    hide:function () {
      if (this.valueIsPlaceholder() && this.input.hasClass("placeholder") && (this.input.removeClass("placeholder"), this.input[0].value = "", this.isPassword)) {
        try {
          this.input[0].setAttribute("type", "password")
        } catch (a) {
        }
        this.input.show();
        this.input[0].focus()
      }
    }, valueIsPlaceholder:function () {
      return this.input[0].value == this.input.attr("placeholder")
    }, handlePassword:function () {
      var a = this.input;
      a.attr("realType", "password");
      this.isPassword = !0;
      if (b.browser.msie && a[0].outerHTML) {
        var c = b(a[0].outerHTML.replace(/type=(['"])?password\1/gi,
            "type=$1text$1"));
        this.fakePassword = c.val(a.attr("placeholder")).addClass("placeholder").focus(function () {
          a.trigger("focus");
          b(this).hide()
        });
        b(a[0].form).submit(function () {
          c.remove();
          a.show()
        })
      }
    }};
  var e = !!("placeholder"in document.createElement("input"));
  b.fn.placeholder = function () {
    return e ? this : this.each(function () {
      var a = b(this), c = new d(a);
      c.show(!0);
      a.focus(function () {
        c.hide()
      });
      a.blur(function () {
        c.show(!1)
      });
      b.browser.msie && (b(window).load(function () {
        a.val() && a.removeClass("placeholder");
        c.show(!0)
      }),
          a.focus(function () {
            if (this.value == "") {
              var a = this.createTextRange();
              a.collapse(!0);
              a.moveStart("character", 0);
              a.select()
            }
          }))
    })
  }
})(jQuery);

function rateModel(modelId, rating) {
  var params = { };
  $.post('/model/rate/' + modelId + '/' + rating, params, function (response) {
    if (response) {
      $("#modelRatingDiv").html(response);
    }
  });
}

function deleteModel(modelId) {

  if (confirm("Are you sure you want to delete this model? It will no longer be available...")) {
    jQuery.ajax({
      type:'post',
      url:'/mymodels',
      data:{deleteModel:true, modelId:modelId},
      success:function (response) {
        var modelsHtml = $('#items', response).html();
        $('#items').html(modelsHtml);
        $.swPortal.scriptifyProductBoxes();
        jQuery('.pagination a').click(bindPagination);
      }
    });
  }
}

function initDropDownMenus(container) {
  var selector = ".dropdown";
  if(container) {
    selector = "#" + container + " " + selector;
  }   

  var $menuGroup = jQuery(selector);

  jQuery(selector).children('.dropdown-toggle').click(function(e) {
    var me = this;
    var $me = jQuery(this);

    var $activeMenu = null;
    var classes = me.className.split(/\s+/);
    for(i in classes) {
      if(classes[i].match(/^tip-/)) {
        $activeMenu = jQuery('#' + classes[i].substring(4));
      }
    }
    if($activeMenu == null) {
      return;
    }

    $activeMenu.is(':visible') ? $menuGroup.removeClass('open') : $menuGroup.addClass('open');

    jQuery(".dropdown-menu").filter(function(i, el) {
      return !jQuery(me).hasClass('tip-'+el.id);
    }).parent().removeClass('open');

    if(jQuery(this).parent().hasClass('center')) {

      var toggleWidth = jQuery(this).outerWidth();
      var menuWidth = jQuery(this).next('.dropdown-menu').outerWidth();
      var width = parseInt((menuWidth - toggleWidth)/2);
      $activeMenu.css('left', -width + "px");
    }

    e.stopPropagation();
  });

  jQuery(document).click(function(e) {
    jQuery(".dropdown").removeClass('open');
  }); 
}

function showDialog(id, title, modal, width, className) {
  jQuery("#" + id).dialog({ resizable:false, autoOpen:true, modal:modal, title:title, dialogClass:className, height:'auto', width:width});
  jQuery('.ui-widget-overlay').click(function () {
    jQuery("#" + id).dialog("close");
  });
}

function showDialogText(text, title, modal, width, className) {
  var info = jQuery('<div></div>').html(text);
  info.dialog({
    resizable:false,
    autoOpen:true,
    modal:modal,
    title:title,
    dialogClass:className,
    height:'auto',
    width:width,
    open:function () {
      $('a').blur();
      $(".ui-dialog .popup-content").scrollTop(0);
      $('body').addClass('no-scroll');
    },
    close:function () {
      info.html("");
      $('body').removeClass('no-scroll');
    }
  });
  $('.ui-widget-overlay').click(function () {
    info.dialog("close");
  });
  return info;
}

function editFollowUser(userId, actionType) {

  $('#followUserButton').addClass('waiting');

    jQuery.ajax({
      type:'post',
      url:'/edit-follow-user',
      data:{followActionType:actionType, followedUserId:userId},
      success:function (response) {
        var content = $.parseJSON(response);
        if (!content ||  content.responseStatus == 'fail') {
          $('#followUserButton').addClass('fail').removeClass('wait');
          return;
        }

        var username = content.userName;

        $('#followUserButton').removeClass('waiting').addClass('success');
        setTimeout(function() {
            if (content.buttonState == 'follow') {
              $('#followUserButton').removeClass('success')
                .html('Follow ' + username)
                .attr("onClick","editFollowUser('" + userId + "', 'follow')");
            }
            else if (content.buttonState == 'notFollow') {
              $('#followUserButton')
                  .removeClass('success')
                  .html('Stop Following ' + username)
                  .attr("onClick","editFollowUser('" + userId + "', 'notFollow')");;
            }
          }, 1000);
      }
    });

}

// ////////////////////////////////////// //
//           Google Analytics             //
// ////////////////////////////////////// //

(function () {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'stats.g.doubleclick.net/dc.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();

// ////////////////////////////////////// //
//           jQuery Easing 1.3            //
// ////////////////////////////////////// //

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
  def: 'easeOutQuad',
  swing: function (x, t, b, c, d) {
    //alert(jQuery.easing.default);
    return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
  },
  easeInQuad: function (x, t, b, c, d) {
    return c*(t/=d)*t + b;
  },
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  },
  easeInOutQuad: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t + b;
    return -c/2 * ((--t)*(t-2) - 1) + b;
  },
  easeInCubic: function (x, t, b, c, d) {
    return c*(t/=d)*t*t + b;
  },
  easeOutCubic: function (x, t, b, c, d) {
    return c*((t=t/d-1)*t*t + 1) + b;
  },
  easeInOutCubic: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t + b;
    return c/2*((t-=2)*t*t + 2) + b;
  },
  easeInQuart: function (x, t, b, c, d) {
    return c*(t/=d)*t*t*t + b;
  },
  easeOutQuart: function (x, t, b, c, d) {
    return -c * ((t=t/d-1)*t*t*t - 1) + b;
  },
  easeInOutQuart: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
    return -c/2 * ((t-=2)*t*t*t - 2) + b;
  },
  easeInQuint: function (x, t, b, c, d) {
    return c*(t/=d)*t*t*t*t + b;
  },
  easeOutQuint: function (x, t, b, c, d) {
    return c*((t=t/d-1)*t*t*t*t + 1) + b;
  },
  easeInOutQuint: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  },
  easeInSine: function (x, t, b, c, d) {
    return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
  },
  easeOutSine: function (x, t, b, c, d) {
    return c * Math.sin(t/d * (Math.PI/2)) + b;
  },
  easeInOutSine: function (x, t, b, c, d) {
    return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
  },
  easeInExpo: function (x, t, b, c, d) {
    return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
  },
  easeOutExpo: function (x, t, b, c, d) {
    return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
  },
  easeInOutExpo: function (x, t, b, c, d) {
    if (t==0) return b;
    if (t==d) return b+c;
    if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
    return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
  },
  easeInCirc: function (x, t, b, c, d) {
    return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
  },
  easeOutCirc: function (x, t, b, c, d) {
    return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
  },
  easeInOutCirc: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
    return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
  },
  easeInElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
  },
  easeOutElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
  },
  easeInOutElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
  },
  easeInBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c*(t/=d)*t*((s+1)*t - s) + b;
  },
  easeOutBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
  },
  easeInOutBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158; 
    if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
    return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
  },
  easeInBounce: function (x, t, b, c, d) {
    return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
  },
  easeOutBounce: function (x, t, b, c, d) {
    if ((t/=d) < (1/2.75)) {
      return c*(7.5625*t*t) + b;
    } else if (t < (2/2.75)) {
      return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
    } else if (t < (2.5/2.75)) {
      return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
    } else {
      return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
    }
  },
  easeInOutBounce: function (x, t, b, c, d) {
    if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
    return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
  }
});

$(window).load(function() {

  //disable tracking for inshape since its missing the appropriate controller
  if(typeof window.performance != 'undefined' && window.location.hostname.indexOf('inshape') < 0) {
    SW.track("page_load", {
      loadStart: window.performance.timing.fetchStart,
      dnsComplete: window.performance.timing.domainLookupEnd,
      responseComplete: window.performance.timing.responseEnd,
      domLoaded: window.performance.timing.domContentLoadedEventStart,
      pageLoaded: window.performance.timing.loadEventStart

  });
  }

});