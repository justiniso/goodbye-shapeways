




/*
     FILE ARCHIVED ON 17:34:21 Oct 20, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 1:58:23 Jun 27, 2015.
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
      var appId = $("#fb-app-id").val();
      FB.init({
        appId:appId,
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

        FB.Event.subscribe('auth.authResponseChange', function(response) {
          if ($("#fblogout").length > 0 && FB.getAccessToken()) {
            $("#fblogout").remove();
            FB.logout();
          }
          if (response.status === 'connected') {
            //do here the log
          } else if (response.status === 'not_authorized') {
            FB.logout();
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
      po.src = '/web/20141020173421/https://apis.google.com/js/plusone.js';
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
    }).click($.swPortal.productBoxClick);
  };

  $.swPortal.productBoxClick = function (event) {
    //if we're not an anchor or inside an anchor or select
    if (
      ($(event.target).is( "a.product-url") || $(event.target).closest('a.product-url').length) || (
          !$(event.target).is("a") && !$(event.target).closest('a').length
          && !$(event.target).is("select") && !$(event.target).closest('select').length
          && !$(event.target).is("iframe") && !$(event.target).closest('iframe').length
        )
      ) {
      var $productUrl = $(this).find('a.product-url:first');
      if ($productUrl.length) {
        if (jQuery(event).attr('ctrlKey') || jQuery(event).attr('metaKey') || $(this).closest('.product-box').hasClass('new-tab') || event.which == 2) {
          window.open($productUrl.attr('href'));
        } else {
          document.location.href = $productUrl.attr('href');
        }
        event.preventDefault();
        return true;
      }
    }
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
        if ($("#cartcount").length === 0) {
          $(".header-cart").addClass("with-items");
          $(".header-cart a").html('<span class="icon-cart"></span><div id="cartcount">1</div>');
        }
        else {
          $("#cartcount").html(parseInt($("#cartcount").html()) + 1);
        }
        $("#addtocart_popup_container").show();
        //setTimeout(function() { close_addtocart_popup(); }, 3900);
      }
    });
  };

  $.fn.formValues = function() {
    var data = $(this).serializeArray();
    var values = {};

    for (val in data) {
      if (data.hasOwnProperty(val)) {
        values[data[val].name] = data[val].value;
      }
    }

    return values;
  }

  $(document).ready(function () {

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

    // fb share click
    $('a.share-button-fb').click(function () {
      $modelId = $(this).closest('div.feed-social').data('sw_modelid');
      if (!$modelId && typeof $.swPortal.pageModelId != 'undefined') {
        $modelId = $.swPortal.pageModelId;
      }
      if ($modelId) {
        $.swPortal.modelShareIntentTrack($.swPortal.eventTracking.modelShareIntent, $modelId, 'facebook');
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



    $('.login-form').live('submit', function(e) {
      e.preventDefault();
      var formElement = $(this);
      var data = formElement.serialize();
      var errorElement = $(formElement).find('.text-error');
      var postUrl = $(formElement).attr("action");
      $(formElement).find('.action-button').addClass('waiting');
      var requestedCallBack = $(formElement).find('.callback-function').val();


      $.ajax({
        url: postUrl,
        type:'POST',
        xhrFields: { withCredentials: true },
        beforeSend: function(xhr){
          xhr.withCredentials = true;
        },
        data:data,
        dataType: "json",
        success: function(response) {
          if (response.success == true) {
            $(errorElement).hide();

            if (requestedCallBack != "") {
              $(".close-button").click();
              eval(requestedCallBack);
              return;
            }

            var targetUrl = $(formElement).find("input[name='targetUrl']").val();
            if (targetUrl != '') {
              window.location.href = targetUrl;
            }
            else {
              window.location.reload();
            }
          }
          else {
            $(errorElement).html("Uh oh!  We couldn't verify your login credentials.").show();
            $(formElement).find('.action-button').removeClass('waiting');

          }
        }
      });
      return false;
    });


    $('.sign-up-form').live('submit', function(e) {
      e.preventDefault();
      var formElement = $(this);
      var data = formElement.serialize();
      var errorElements = $(formElement).find('.error');
      $(errorElements).hide();
      var postUrl = $(formElement).attr("action");
      var requestedCallBack = $(formElement).find('.callback-function').val();


      $(formElement).find('.action-button').addClass('waiting');

      $.ajax({
        url: postUrl,
        type:'POST',
        xhrFields: { withCredentials: true },
        beforeSend: function(xhr){
          xhr.withCredentials = true;
        },
        data:data,
        dataType: "json",
        success: function(response) {
          if (response.success == true) {

            if (requestedCallBack != "") {
              $(".close-button").click();
              eval(requestedCallBack);
              return;
            }

            var targetUrl = (response.targetUrl) ? response.targetUrl : $(formElement).find("input[name='targetUrl']").val();
            if (targetUrl != '') {
              window.location.href = targetUrl;
            }
            else {
              window.location.reload();
            }
          }
          else {
            $(formElement).find('.action-button').removeClass('waiting');

            var fieldErrors = response.errors.fieldErrors;

            if(fieldErrors.email) {
              formElement.find('.email-error').html(fieldErrors.email).show();
            }

            if (fieldErrors.username) {
              formElement.find('.username-error').html(fieldErrors.username).show();
            }

            if (fieldErrors.password) {
              formElement.find('.password-error').html(fieldErrors.password).show();
            }
          }
        }
      });
      return false;
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

    // !TODO !REFACTOR combine the 3 focus animation actions below into one (they all do the same thing)

    // checkbox-wrap focus animation
    $('.checkbox-wrap input').focus(function() {
      $(this).parent().addClass('focus');
    });
    $('.checkbox-wrap input').blur(function() {
      $(this).parent().removeClass('focus');
    });

    // checkbox-wrap focus animation
    $('.checkbox-wrapper input').focus(function() {
      $(this).parent().addClass('focus');
    });
    $('.checkbox-wrapper input').blur(function() {
      $(this).parent().removeClass('focus');
    });

    // input-group focus animation
    $('.input-group input').focus(function() {
      $(this).parent().addClass('focus');
    });
    $('.input-group input').blur(function() {
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


    var socialValidators = {
      "twitter" : {
        validateOnKeyup : function($el) {
          if($el.val().indexOf("@") != 0) {
            $el.val("@" + $el.val());
          }
        },
        validateOnSubmit : function($el) {
          if($el.val().indexOf("@") != 0) {
            $el.val("@" + $el.val());
          }
          var handle = $el.val();
          if($el.val() == '@') {
            handle = '';
          }
          return handle;
        },
        saving: function() {

        },
        saved: function(response) {

        }
      }
    };


    /* SOCIAL TOWN */
    $(".social-town").each(function(i, el) {
      var $el = $(el);

      $el.keyup(function(e) {
        if(e.which == 13) {
          $el.blur();
          return;
        }

        var socialType = $el.attr('social-type');
        socialValidators[socialType].validateOnKeyup($el);

        // validate
      });
      $el.blur(function() {
        var postUrl = '/api/social/save';

        var socialType = $el.attr('social-type');
        var handle = socialValidators[socialType].validateOnSubmit($el);
        socialValidators[socialType].saving();
        var params = {
          entityType : $el.attr("entity-type"),
          entityId : $el.attr("entity-id"),
          socialType : socialType,
          handle : handle
        };
        $.post(postUrl, params, function(response) {
          socialValidators[socialType].saved(response);
        });
      });
    });
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

})(jQuery);
$(document).ready(function() {
(function (d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s);
  js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

(function () {
  var po = document.createElement('script');
  po.type = 'text/javascript';
  po.async = true;
  po.src = '/web/20141020173421/https://plus.google.com/js/client:plusone.js?onload=start';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(po, s);
})();


});

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
 * /web/20141020173421/http://dev.twitter.com/pages/intents-events#click
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
        this.input[0].setAttribute("type", "text");
      } catch (b) {
        this.input.before(this.fakePassword.show()).hide();
      }
      this.input.addClass("placeholder");
      this.input[0].value = this.input.attr("placeholder");
    }
  },
    hide:function () {
      if (this.valueIsPlaceholder() && this.input.hasClass("placeholder") && (this.input.removeClass("placeholder"), this.input[0].value = "", this.isPassword)) {
        try {
          this.input[0].setAttribute("type", "password");
        } catch (a) {
        }
        this.input.show();
        this.input[0].focus();
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
          b(this).hide();
        });
        b(a[0].form).submit(function () {
          c.remove();
          a.show();
        })
      }
    }};
  var e = !!("placeholder"in document.createElement("input"));
  b.fn.placeholder = function () {
    return e ? this : this.each(function () {
      var a = b(this), c = new d(a);
      c.show(!0);
      a.focus(function () {
        c.hide();
      });
      a.blur(function () {
        c.show(!1);
      });
      b.browser.msie && (b(window).load(function () {
        a.val() && a.removeClass("placeholder");
        c.show(!0);
      }),
          a.focus(function () {
            if (this.value == "") {
              var a = this.createTextRange();
              a.collapse(!0);
              a.moveStart("character", 0);
              a.select();
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

function showDialog(id, title, modal, width, className, callback) {
  var dialog = jQuery("#" + id).dialog({ resizable:false, autoOpen:true, modal:modal, title:title, dialogClass:className, height:'auto', width:width});
  jQuery('.ui-widget-overlay').click(function () {
    jQuery("#" + id).dialog("close");
  });
  if(typeof callback === 'function'){
    callback(dialog);
  }
}

function showDialogText(text, title, modal, width, className, minHeight, optionOverrides) {
  minHeight = typeof minHeight !== 'undefined' ? minHeight : null;
  var info = jQuery('<div></div>').html(text);
  var dialogOptions = {
    resizable:false,
    autoOpen:true,
    modal:modal,
    title:title,
    dialogClass:className,
    height:'auto',
    minHeight: minHeight,
    width:width,
    open:function () {
      $('a').blur();
      $(".ui-dialog .popup-content").scrollTop(0);
      $('body').addClass('no-scroll');
      if(optionOverrides && optionOverrides.hideTitleBar == true) {
        $(".ui-widget-header").css({background: "#FFF", "border-bottom" : "0"});
      }
    },
    close:function () {
      if (!optionOverrides || !optionOverrides.keepHTMLAfterClose || optionOverrides.keepHTMLAfterClose === false) {
         info.html("");
      }
      if(optionOverrides && optionOverrides.removeParentOnClose == true) {
        info.remove();
      }
      $('body').removeClass('no-scroll');
    }
  };

  info.dialog(dialogOptions);

  $('.ui-widget-overlay').click(function () {
    info.dialog("close");
  });
  return info;
}

function removeDialogs() {
  jQuery('.ui-dialog').dialog("destroy");
  jQuery('.ui-dialog').remove();
}

function base64_decode (data) {

  var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
      ac = 0,
      dec = "",
      tmp_arr = [];

  if (!data) {
    return data;
  }

  data += '';

  do {
    h1 = b64.indexOf(data.charAt(i++));
    h2 = b64.indexOf(data.charAt(i++));
    h3 = b64.indexOf(data.charAt(i++));
    h4 = b64.indexOf(data.charAt(i++));

    bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

    o1 = bits >> 16 & 0xff;
    o2 = bits >> 8 & 0xff;
    o3 = bits & 0xff;

    if (h3 == 64) {
      tmp_arr[ac++] = String.fromCharCode(o1);
    } else if (h4 == 64) {
      tmp_arr[ac++] = String.fromCharCode(o1, o2);
    } else {
      tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
    }
  } while (i < data.length);

  dec = tmp_arr.join('');

  return dec;
}

function callFollowUser(userId, actionType, callback){
  jQuery.ajax({
    type:'post',
    url:'/edit-follow-user',
    data:{followActionType:actionType, followedUserId:userId},
    success:callback
  });
}

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

$(function() {

  if( typeof(jQuery(document).unslider) == 'function') {
    // init unslider
    $('.unslider-carousel').unslider({
      speed: 400,               //  The speed to animate each slide (in milliseconds)
      delay: 7000,              //  The delay between slide animations (in milliseconds)
      complete: function() {},  //  A function that gets called after every slide animation
      keys: true,               //  Enable keyboard (left, right) arrow shortcuts
      dots: true,               //  Display dot navigation
      fluid: true               //  Responsive
    });
  }
});


$(window).load(function () {
//disable tracking for inshape since its missing the appropriate controller
      if (Math.random() > .8 && typeof window.performance != 'undefined' && window.location.hostname.indexOf('inshape') < 0) {
        SW.track("page_load", {
          loadStart:window.performance.timing.fetchStart,
          dnsComplete:window.performance.timing.domainLookupEnd,
          responseComplete:window.performance.timing.responseEnd,
          domLoaded:window.performance.timing.domContentLoadedEventStart,
          domInteractive:window.performance.timing.domInteractive,
          pageLoaded:window.performance.timing.loadEventStart

        });
      }
    }
);


function openLogInSignUpDialog(activeTab, callBack, getKey, internalReferrer, contextCopy) {
  var XMLHttpRequestSupported = typeof new XMLHttpRequest().responseType === 'string';
  if (!XMLHttpRequestSupported) {
    document.location.href = (activeTab == "login") ? "/login" : "/register";
    return;
  }

  SW.track('signup_login_modal_shown', {
    location:document.location.pathname,
    internalReferrer: internalReferrer
  });

  if(contextCopy) {
    $(".contextCopy").html(contextCopy);
  }
  else {
    $(".contextCopy").html("");
  }

  showLogInSignUpTab(activeTab);

  $.fancybox({
    'content': $("#signup-login-modal").html(),
    autoSize    : false,
    autoResize  : false,
    fitToView   : false,
    autoCenter  : true,
    leftRatio   : 0,
    padding     : 0,
    width       : 'auto',
    height      : 'auto',
    keys: {
      close  : [27]
    },
    afterClose: function() {
      SW.track('signup_login_modal_dismissed', {});
    },
    afterShow  : function () {

      var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      if (w <=1024) {
        $.extend(this, {
          margin: new Array(0,0,0,0),
          autoCenter:false,
          fitToView:true,
          topRatio:0
        });
      }

      $('#fancybox-wrap .' + activeTab + "-modal-form").find('input').filter(':visible:first').focus();

    }
  });


  var modal = $('#fancybox-wrap');

  var getKeyValue = (getKey && getKey == true);
  $(modal).find('.getKey').val(getKeyValue);

  var callBackFunction = (callBack && callBack != "") ? callBack : "";
  $(modal).find('.callback-function').val(callBackFunction);

  var userNameInput = $('#sign_up_username');
  var passWordInput = $('#sign_up_password');
  var emailInput = $('#sign_up_email');

  $(userNameInput).live('blur', function() {

    var userName = $(this).val();
    if (userName == '') { return; }
    var usernameError = '';

    if (userName.length < 4) {
      usernameError = 'Minimum 4 characters';
    }
    else if (userName.length > 50 ) {
      usernameError = 'Max 50 characters';
    }
    else if (/[^\w]/.exec(userName)) {
      usernameError = 'Only numbers, letters and underscores allowed';
    }
    else if (/shapeways/.exec(userName)) {
      usernameError = 'No Shapeways allowed!';
    }

    $(this).parents('li').find('.username-error').html(usernameError).show();

   });

  $(userNameInput).live('keyup', function() {
    $(this).parents('li').find('.username-error').hide();
  });

  $(emailInput).live('blur', function() {

    var email = $(this).val();
    if (email == '') { return; }
    var emailError = '';

    var emailValidationPattern = /^[-_a-zA-Z0-9+]+(\.[-_a-zA-Z0-9+]+)*@[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9-]+)*(\.[a-z]{2,10})$/;

    if (! emailValidationPattern.exec(email)) {
      emailError = "Doesn't look valid";
    }

    $(this).parents('li').find('.email-error').html(emailError).show();

  });

  $(emailInput).live('keyup', function() {
    $(this).parents('li').find('.email-error').hide();
  });

  $(passWordInput).live('blur', function() {
    var password = $(this).val();
    if (password == '') { return; }
    var passwordError = '';

    if (password.length < 5) {
      passwordError = 'Minimum 5 characters';
    }
    else if (password.length > 30 ) {
      passwordError = 'Max 30 characters';
    }

    $(this).parents('li').find('.password-error').html(passwordError).show();

  });

  $(passWordInput).live('keyup', function() {
    $(this).parents('li').find('.password-error').hide();
  });

}

function showLogInSignUpTab(tab) {
  $('.login-modal-tabs').find('li').removeClass("active-modal-tab");
  $("." + tab + "-modal-tab").addClass("active-modal-tab");
  $(".modal-form").hide();

  $("." + tab + "-modal-form").show();

}



function fbLogIn(elem) {

  $(elem).addClass('waiting');

  var formElement = $(elem).parents('form');
  var formAction = $(formElement).attr('action');

  var requestedCallBack = $(formElement).find('.callback-function').val();
  var getKey = $(formElement).find('.getKey').val();
  var targetUrl = $(formElement).find("input[name='targetUrl']").val();
  var isEdu = $(formElement).find("input[name='isEdu']").val();

  FB.login(function(response) {

        if (response.authResponse) {

          jQuery.ajax({
            type:'post',
            xhrFields: { withCredentials: true },
            beforeSend: function(xhr){
              xhr.withCredentials = true;
            },
            data: { fbResponse:  response.authResponse,
                    'callback-function': requestedCallBack,
                    getKey: getKey,
                    targetUrl: targetUrl,
                    formAction: formAction,
                    isEdu: isEdu
            },
            dataType: "json",
            url: 'https://' + document.location.host + '/login/json-fb-login',
            success:function (swResponse) {
              return handleSSOLogInResponse(swResponse, elem);
            }
          });

        } else {
          return false;
        }

      }, { scope: 'email' }
  );
}

function changeAuthToFB() {
  FB.login(function(response) {
    if (response.authResponse) {

      jQuery.ajax({
        type:'post',
        data: {
          fbResponse:  response.authResponse,
          authMethod: 'authfb'
        },
        dataType: "json",
        url: 'https://' + document.location.host + '/user/json-auth-change-save',
        success:function (swResponse) {
          if (swResponse.success  == true) {
            window.location = window.location.href;
          } else if (swResponse.success == false && swResponse.message != '') {
            $(".error-field").css({opacity:1}).html(swResponse.message);
          }
        }
      });

    } else {
      return false;
    }

  }, { scope: 'email' });
}

function changePassword() {
  var password = $('#password').val();
  var passwordConfirm = $('#passwordConfirm').val();

  console.log("changing password");


  $.ajax({
    type: 'post',
    url: 'https://' + document.location.host + '/user/json-auth-change-save',
    data: {
      authMethod: 'authShapeways',
      password: password,
      passwordConfirm: passwordConfirm
    },
    success: function (swResponse) {
      if (swResponse.success == true) {
        window.location = window.location.href;
      } else if (swResponse.success == false && swResponse.message != '') {
        $('.password-error').show().html(swResponse.message);
      }
    },
    dataType: "json"
  });
}

function changeAuthToGoogle(authResult) {

  if (authResult["status"]["method"] != "PROMPT") {
    return true;
  }

  if (authResult['code']) {

    // Send the code to the server
    $.ajax({
      type:'post',
      url:'https://' + document.location.host + '/user/json-auth-change-save',
      data: {
        authMethod: 'authgoog',
        code: authResult['code']
      },
      success: function(swResponse) {
        if (swResponse.success  == true) {
          window.location = window.location.href;
        } else if (swResponse.success == false && swResponse.message != '') {
          $(".error-field").css({opacity:1}).html(swResponse.message);
        }
      },
      dataType: "json"
    });
  } else if (authResult['error']) {
    return false;
  }
}

function googleSignInCallBack(authResult) {

  if (authResult["status"]["method"] != "PROMPT") {
    return;
  }
  var elem = googleCallBackElement;

  $(elem).addClass('waiting');

  var formElement = $(elem).parents('form');
  var formAction = $(formElement).attr('action');

  var requestedCallBack = $(formElement).find('.callback-function').val();
  var getKey = $(formElement).find('.getKey').val();
  var targetUrl = $(formElement).find("input[name='targetUrl']").val();
  var isEdu = $(formElement).find("input[name='isEdu']").val();

  if (authResult['code']) {

    // Send the code to the server
    $.ajax({
      type:'post',
      xhrFields: { withCredentials: true },
      beforeSend: function(xhr){
        xhr.withCredentials = true;
      },
      url:'https://' + document.location.host + '/login/json-google-login',
      success: function(swResponse) {
        return handleSSOLogInResponse(swResponse, elem);
      },
      data: { 'code' : authResult['code'],
              'callback-function': requestedCallBack,
              getKey: getKey,
              targetUrl: targetUrl,
              formAction: formAction,
              isEdu: isEdu
      },
      dataType: "json"
    });
  } else if (authResult['error']) {
   return false;
  }
}

function handleSSOLogInResponse(response, elem) {
  if (response.success == false ){

    if (response.message) {
      $(elem).removeClass('waiting')
          .parent('div').find('.sso-error').show().html(response.message);
    }
    else {
      window.location = this.location.href;
    }

    return false;
  }

  if (response.action == 'loginSuccess') {

    var formElement = $(elem).parents('form');

    var requestedCallBack = $(formElement).find('.callback-function').val();
    if (requestedCallBack != "") {
      var closeElement = $(".close-button");
      if ($(closeElement).length > 0) {
        $(closeElement).click();
      }
      eval(requestedCallBack);
      return true;
    }

    var targetUrl = $(formElement).find("input[name='targetUrl']").val();
    if (targetUrl != '') {
      window.location.href = targetUrl;
    }
    else {
      window.location = this.location.href;
    }
    return true;
  }
  else if (response.action == 'confirmDialog') {
    if (! $('#fancybox-wrap').is(':visible')) {
      $.fancybox({
        'content': response.html,
        autoSize    : false,
        autoResize  : false,
        fitToView   : false,
        autoCenter  : true,
        leftRatio   : 0,
        padding     : 0,
        width       : 'auto',
        height      : 'auto',
        keys: {
          close  : [27]
        },
        afterClose: function() {
          SW.track('signup_login_modal_dismissed', {});
        }
      });

    } else {

      $(elem).parents('.login-dialog').html(response.html);
    }

  }

  return true;
}

function finishSSOSignUp(finnishUpButton) {

  var formData = $(finnishUpButton).parents('form').serialize();
  var url = $(finnishUpButton).parents('form').attr("action");
  $.ajax({
    type:'post',
    xhrFields: { withCredentials: true },
    beforeSend: function(xhr){
      xhr.withCredentials = true;
    },
    data: formData,
    dataType: "json",
    url: url,
    success:function (swResponse) {
      return handleSSOLogInResponse(swResponse, finnishUpButton);
    }
  });


  return false;

}

function googleSignInClick(elem) {
  $(elem).addClass('waiting');

  googleCallBackElement = elem;
  var appId = $("#google-app-id").val();


  var options = {
    'callback' : googleSignInCallBack,
    'clientid' : appId,
    'scope' : '/web/20141020173421/https://www.googleapis.com/auth/plus.login /web/20141020173421/https://www.googleapis.com/auth/userinfo.email',
    'cookiepolicy' : 'http://' +  document.location.host
  };
  gapi.auth.signIn(options);
}


/** UPLOAD BUTTON JS */

uploadLaunched = false;
fileSelected = false;
function launchUpload() {

  uploadLaunched = false;
  currentPart = -1;
  $('#creatorinfo .step-1').trigger('click');

  uploadLaunched = true;
  var $ext = $('#up3dfile').val().split('.').pop().toLowerCase();
  if ($ext == 'stl' || $ext == 'wrl' || $ext == 'obj' || $ext == 'zip') {
    $('#scale_main').show();
  } else {
    $('#scale_main').hide();
  }

  if( ! fileSelected ) {
    $('#uploadconfirm').toggleClass('slide-up');
    $('#creatorinfo .top-half').toggleClass('selected');

    fileSelected = true;
  }
}

function cancelUpload() {
  // this is to ensure that the on change event on the file input will work
  var fileUploadInput = $('#up3dfile');
  fileUploadInput.replaceWith( fileUploadInput = fileUploadInput.clone( true ) );

  $('#uploadconfirm').toggleClass('slide-up');
  $('#creatorinfo .top-half').toggleClass('selected');
  uploadLaunched = false;
  fileSelected = false

  SW.track('upload_cancel', {});
}

var currentPart = 1;

$('#creatorinfo .big-tab').click( function( e ) {
  if( currentPart != $(this).data().part && !uploadLaunched ) {
    contentPos = -960 * $(this).data().part;
    $('#creatorinfo .big-tab.selected').removeClass('selected');
    $(this).addClass('selected');
    $('#pointer').stop().animate( { 'left': $('#creatorinfo .big-tab.selected').position().left + ( ($('#creatorinfo .big-tab.selected').outerWidth() - 36) / 2 ) }, 400, 'easeOutQuart' );
    $('#tab-content .parts').animate( { 'margin-left': contentPos }, 400, 'easeOutQuart' );
    if( lastVideo ) {
      closeVideo();
    }
    currentPart = $(this).data().part;
  }
} );

lastVideo = false;

$('#tab-content .video-thumb .video').click( function( o ) {
  lastVideo = $(this);
  lastVideo.parents('.part').children('.player').animate( { 'margin-top': 0 }, 300 );
  lastVideo.parents('#tab-content').animate( { 'height': 400 }, 300 );
} );


closeVideo = function() {
  lastVideo.parents('.part').children('.player').animate( { 'margin-top': -420 }, 300 );
  lastVideo.parents('#tab-content').animate( { 'height': 300 }, 300 );
  lastVideo = false;
}
$('#tab-content .player .close-button').click( closeVideo );

$('#tab-content .problem .close-button').click( function() {
  currentPart = -1;
  $('#creatorinfo #upload-file').trigger('click');
} );



function bindUploadFormClick(){

  var $formbox = jQuery('div.formbox');

  SW.track('upload_button_clicked', {});

  if($formbox.length) {
    if(!$formbox.hasClass('disabled') && jQuery('#up3dfile').val()) {
      showDialogText('Please wait while your model is being uploaded...  <div id="uploadWait" style="padding-top:20px; text-align:center;"></div>', 'Please wait...', true, '400px', 'alphacube');

      var $form = $formbox.children('form');

      SW.track('upload_form_submitted', $form.formValues());

      $form.submit();
    }
  } else {
    showDialogText('Please wait while your model is being uploaded...  <div id="uploadWait" style="padding-top:20px; text-align:center;"></div>', 'Please wait...', true, '400px', 'alphacube');
  }
}

function bindChangeFile() {
  var filename = jQuery('#up3dfile').val();

  jQuery('#filename').html(filename);

  SW.track('upload_file_selected', {
    filename: filename
  });
}


function launchUploadModal(applicationId, defaultScale, tags, uploadButtonText, subheading, specialTerms) {
  var url = "/upload-modal";

  SW.track('upload_modal_launched', {
    endpoint: url
  });

  jQuery.ajax({
    type:"GET",
    data:{
      'appId':applicationId,
      'defaultScale':defaultScale,
      'tags':tags,
      'uploadButtonText':uploadButtonText,
      'subheading':subheading,
      'specialTerms':specialTerms
    },
    url: url,
    success:function (data) {
      if(data) {
        showDialogText(data, false, true, '480px');
        jQuery('#upload3DFileButton').click(bindUploadFormClick);
        jQuery('#up3dfile').change(bindChangeFile);

        SW.track('upload_modal_opened', {});
      } else {
        SW.track('upload_modal_no_data', {});
      }
    },
    error: function (jqXHR, status) {
      SW.track('upload_modal_request_error', {
        status: status,
        endpoint: url
      });
    }
  });
}

function launchNewsletterSignupModal(submitButtonText, subheading, specialTerms) {
    var url = "/custom-newsletter-signup-modal";

    SW.track('custom_newsletter_signup_modal_launched', {
        endpoint: url
    });

    const REQUEST_NEWSLETTER_BUTTON_TEXT = 'newsletterSubmitButtonText';
    const REQUEST_NEWSLETTER_MODAL_HEADLINE_TEXT = 'newsletterHeadlineText';
    const REQUEST_NEWSLETTER_MODAL_INTRO_TEXT = 'introText';

    jQuery.ajax({
        type:"GET",
        data:{
            'newsletterSubmitButtonText':submitButtonText,
            'newsletterHeadlineText':subheading,
            'introText':specialTerms
        },
        url: url,
        success:function (data) {
            if(data) {
                showDialogText(data, false, true, '460px', 'no-jquery-header');
                $('#mce-EMAIL2').val("");
                SW.track('custom_newsletter_signup_modal_opened', {});
            } else {
                SW.track('custom_newsletter_signup_modal_no_data', {});
            }
        },
        error: function (jqXHR, status) {
            SW.track('custom_newsletter_signup_modal_request_error', {
                status: status,
                endpoint: url
            });
        }
    });
}

function launchCustomModal(source, width, className) {
    var url = "/custom-modal";

    SW.track('custom_modal_'+source+'_launched', {
        endpoint: url
    });

    jQuery.ajax({
        type:"POST",
        data:{
            'source':source
        },
        url: url,
        success:function (data) {
            if(data) {
                showDialogText(data, false, true, width, className);
                SW.track('custom_modal_'+source+'_opened', {});
            } else {
                SW.track('custom_modal_'+source+'_no_data', {});
            }
        },
        error: function (jqXHR, status) {
            SW.track('custom_modal_'+source+'_error', {
                status: status,
                endpoint: url
            });
        }
    });
}



function signupUserForPromoEmailsSCTag()
{
    var $email = encodeURIComponent($("#mce-EMAIL2").val());
    var $skipOptIn = encodeURIComponent($("#mce-SKIP").val());
    var $data = "email=" + $email
        + "&confirmation=footer"
        + "&tracking_type=footer"
        + "&skipDoubleOptIn=" +$skipOptIn
        + "&tracking_location="+document.location.pathname;

    $request = $.ajax({
        type:"POST",
        async:true,
        url: '/register/email-signup',
        data: $data,
        dataType: 'json',
        success: onPromoEmailSignupSCTagDone,
    });

    return false;
}

function onPromoEmailSignupSCTagDone(data)
{
    if(data['response_status'] == "failure")
    {
        $("#mce-FormError2").text(data['response_text']);
        $("#mce-FormSuccess2").hide();
        $("#mce-FormError2").show();
    }
    else
    {
        $("#mce-FormSuccess2").text(data['confirmation_content']);
        $("#mce-FormError2").hide();
        $("#mce-FormSuccess2").show();
    }
}



jQuery(document).ready(function() {
  jQuery('#upload3DFileButton').click(bindUploadFormClick);
  jQuery('#up3dfile').change(bindChangeFile);
  jQuery('.upload3DFileTrigger').click(function () {$('#up3dfile').click(); return false;});
  jQuery("#mc-embedded-subscribe-form2").submit(signupUserForPromoEmailsSCTag);

});




function clickFollowUser(){
  var followDesigner = $('.send-message .follow-designer');
  var messageText = followDesigner.find('span');
  var icon = followDesigner.find('i')[0];
  var userId = followDesigner.attr('data-user-id');
  var action = followDesigner.attr('data-action');
  var username = followDesigner.attr('data-username');
  callFollowUser(userId, action, function(response){
    var content = $.parseJSON(response);
    if (!content || content.status === 'fail') {
      return;
    }
    if (action === 'follow') {
      followDesigner.attr('data-action', 'notFollow');
      messageText.text('Unfollow ' + username);
      icon.className = 'icon-unfollow';
    } else {
      followDesigner.attr('data-action', 'follow');
      messageText.text('Follow ' + username);
      icon.className = 'icon-wishlist';
    }
  });
}

jQuery(document).ready(function(){
  $('.send-message .follow-designer').click(clickFollowUser);
});
