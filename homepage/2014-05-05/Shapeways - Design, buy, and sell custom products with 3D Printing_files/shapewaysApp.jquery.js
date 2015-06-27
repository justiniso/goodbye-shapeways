




/*
     FILE ARCHIVED ON 2:52:25 May 6, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 1:48:30 Jun 27, 2015.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
var secureServer = '';
var countryCurrencyControlOpen = false;
var countryCurrencyControlOperating = false;

jQuery(document).ready(function() {
  var fade = ! jQuery('#iecontainer').length ? 691 : 0;
  jQuery(window).scroll(function() {
    showVisibleImages(fade);
  });
  showVisibleImages(223);

  bindCountrySelectorFunctions();
});

function bindCountrySelectorFunctions(){
  jQuery("#countryCurrencySelect").mouseenter(function (e) {
    countryCurrencyControlOperating = true;
  }).mouseleave(function (e) {
    countryCurrencyControlOperating = false;
  });

  jQuery("#countryCurrencySelectControl").click(function (e) {
    jQuery("#countryCurrencySelect").show(1, null, function () {
      countryCurrencyControlOpen = true;
    });
    jQuery("#countryCurrencySelect").parent().addClass('active');
  });

  jQuery(document).click(function (e) {
    if (countryCurrencyControlOpen && !countryCurrencyControlOperating) {
      jQuery("#countryCurrencySelect").hide(1, null, function () {
        countryCurrencyControlOpen = false;
        countryCurrencyControlOperating = false;
      });
      jQuery("#countryCurrencySelect").parent().removeClass('active');
    }
  });

  jQuery("#submitChangeCountryCurrency").click(function () {
    var params = {
      currencyCode:jQuery('input[name=currencyCode]:checked').val(),
      country:jQuery('#autocompleteCountry').val(),
      itemId:jQuery.swPortal.modelPageModelId,
      materialId:jQuery.swPortal.modelPageMaterialId
    };
    jQuery.post('/change-country-currency', params, function (response) {
      if (response) {
        location.reload();
      }
    });
  });

  jQuery("#autocompleteCountry").autocomplete({
    source:'/change-country-currency',
    minLength:1,
    select:function (event, ui) {
      countryCurrencyControlOperating = true;
  }});
}

function showVisibleImages(fade) {
  var prodBoxes = jQuery('.product-img img[realsrc]');
  if (fade) prodBoxes.css('opacity', 0);
  prodBoxes.each(function(i, el){
    var t = jQuery(el);
    if(t.offset().top < jQuery(window).scrollTop() + $(window).height() + 300) {
      t.attr('src', t.attr('realsrc'));
      if (fade) t.fadeTo(fade,1); // trigger the image load
      t.removeAttr('realsrc'); // so we only process this image once
    }
  });
}
