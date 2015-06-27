




/*
     FILE ARCHIVED ON 22:17:25 Dec 5, 2010 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 1:54:37 Jun 27, 2015.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
if(!UDesign) {
 var UDesign = {};
}

UDesign.FudCart = {
  getCartQuantity: function() {
    new Ajax.Request('/index.php', {
      method: 'get',
      parameters: { uri: 'udesign/shoppingcart/getCartQuantity' }
      ,onSuccess: function(transport) {
        if (!isNaN(transport.responseText)) {
          $('cartcount').innerHTML = transport.responseText;
          $('cart').show();
        }
      }
    });
  }
}

UDesign.FudCart.getCartQuantity();
