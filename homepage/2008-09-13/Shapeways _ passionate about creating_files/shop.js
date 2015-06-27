




/*
     FILE ARCHIVED ON 10:32:17 Mar 13, 2009 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 1:20:44 Jun 27, 2015.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
Event.observe(window,'load', function() {

  // Do we have the dialog, and our cancel button?
  if ($('orderNotification') && $('orderDialogCancel')) {
    Event.observe('orderDialogCancel', 'click', function (e) {
      Event.stop(e);

      var url = $('orderDialogCancel').href;
      if (url) {
        $('orderNotification').innerHTML  = '<br />Canceling order(s), please wait...';
        new Ajax.Request(url, {
          method: 'post',
          onSuccess: function(transport) {
            $('orderNotification').hide();
          },
          onFailure: function(transport) {
            $('orderNotification').setStyle({border: '2px solid #f00'});
            $('orderNotification').innerHTML  = transport.responseText || 'Something failed, please try again later.';
          }
        });
      }
    })
  }

})

if(!UDesign) {
 var UDesign = {};
}

UDesign.Shop = {
  hideCreateButton: function(){
    if (isDisabled('createshopbutton')) return false;
    $('usershopdetails_formdiv').show();
    Effect.BlindUp('newShopButton');
  },

  addCategory: function(el){
    cat_id = $('category_selector').value;
    new Ajax.Updater('categorySelector', '/', {
      parameters: {
        uri: 'udesign/profile/editShopCategories',
        add_cat_id: cat_id
      }
    });
  },

  addNewCategory: function(identifier, name) {
    var selEl = $(identifier+'_selector');
    var index = selEl.selectedIndex;

    var value = $F(selEl);
    var text  = selEl.options[index].text;

    var newdiv = new Element('div', {'id': identifier+'_'+value});
    newdiv.update('<div class="category"><input type="hidden" name="'+name+'" value="'+value+'" /><div class="name">' + text + '</div><a title="delete" alt="delete" href="#" onclick="UDesign.Shop.deleteNewCategory(\'' + identifier+'\',\''+value + '\'); return false;"><span>delete</span></a></div>');
    $(identifier+'_placeholder').insert(newdiv);

    selEl.options[index].remove();

    if(selEl.options.length == 0) selEl.up(0).hide();
  },

  deleteCategory: function(cat_id){
    new Ajax.Updater('categorySelector', '/', {
      parameters: {
        uri: 'udesign/profile/editShopCategories',
        delete_cat_id: cat_id
      }
    });
  },

  deleteNewCategory: function(identifier, value) {
    var delEl = $(identifier+'_'+value);
    var selEl = $(identifier+'_selector');

    var nwEl = new Element('option',{'value':value})
    selEl.insert({top: nwEl.update(delEl.down('div',1).innerHTML)});

    delEl.remove();

    if(selEl.options.length != 0) selEl.up(0).show();
  }
}