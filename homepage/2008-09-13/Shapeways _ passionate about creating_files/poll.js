




/*
     FILE ARCHIVED ON 4:13:34 Feb 18, 2009 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 1:21:17 Jun 27, 2015.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
if (!UDesign) {
  var UDesign = {};
}

UDesign.Poll = Class.create();
UDesign.Poll.prototype = {
  initialize: function(pollid, voteUrl) {
    this.voteUrl = voteUrl;
    this.element = $('pollButton'+pollid);
    this.pollid  = pollid;
    
    Event.observe(this.element,'click', this.vote.bind(this));    
  },    
    
  vote: function(event) {
    Event.stop(event);
    var pollid = this.pollid;
    
    if (isNaN(pollid)) return false;
    
    var vote_radio = Form.getInputs('poll'+pollid,'radio','poll'+pollid+'_option').find(function(radio) { if (radio)  return radio.checked; });
    if (vote_radio) var voteid = vote_radio.value;
    
    if (isNaN(voteid)) return false;
    
    
    $$('#poll'+pollid+' .loading').each(function (element) { element.show(); });
    
    new Ajax.Updater('poll'+pollid, this.voteUrl + '&vote=' + voteid + "&poll=" + pollid, {
        parameters: { "poll": pollid, "vote": voteid }, 
        onComplete: function (transport) {
        $$('#poll'+pollid+' .loading').each(function (element) { element.hide(); });
        }.bind(this)
    });
  }  
}
  


