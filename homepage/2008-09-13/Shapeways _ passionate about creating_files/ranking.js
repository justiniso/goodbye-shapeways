




/*
     FILE ARCHIVED ON 10:31:19 Mar 13, 2009 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 1:20:44 Jun 27, 2015.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
if (!UDesign)
{
    var UDesign = {};

}

UDesign.ranking = Class.create();
UDesign.ranking.prototype = {
  initialize: function(url,model_id) {
    this.url = url;
    this.model_id = model_id;
    this.oldStars = {};
    this.votingmouseoverArr  = {};
    this.votingmouseclickArr = {};
  }
}

var ratingModels = {};

var oldStars = new Array();

var votingmouseoverArr  = new Array(); 
var votingmouseclickArr = new Array();

function EnableVoting(rankObj)
{
  rankObj.votingmouseoverArr[1]  =  function(){ VotingMouseOver(1,rankObj); };
  rankObj.votingmouseoverArr[2]  =  function(){ VotingMouseOver(2,rankObj); };
  rankObj.votingmouseoverArr[3]  =  function(){ VotingMouseOver(3,rankObj); };
  rankObj.votingmouseoverArr[4]  =  function(){ VotingMouseOver(4,rankObj); };
  rankObj.votingmouseoverArr[5]  =  function(){ VotingMouseOver(5,rankObj); };
  
  rankObj.votingmouseclickArr[1] = function(){ castVote(1,rankObj); };
  rankObj.votingmouseclickArr[2] = function(){ castVote(2,rankObj); };
  rankObj.votingmouseclickArr[3] = function(){ castVote(3,rankObj); };
  rankObj.votingmouseclickArr[4] = function(){ castVote(4,rankObj); };
  rankObj.votingmouseclickArr[5] = function(){ castVote(5,rankObj); };

  for (var i=1;i<=5;i++)
  {
    Event.observe($('voting_star'+i+'_'+rankObj.model_id), 'mouseover', rankObj.votingmouseoverArr[i]  );
    Event.observe($('voting_star'+i+'_'+rankObj.model_id), 'click',     rankObj.votingmouseclickArr[i] );
    $('voting_star'+i+'_'+rankObj.model_id).style.cursor = 'pointer';
  }
  
  for (var i=1;i<=5;i++)
  {
    Event.observe($('voting_star'+i+'_'+rankObj.model_id),'mouseout',  function(){ VotingMouseOut(rankObj); });
  }
}

function VotingMouseOver(starNo, rankObj)
{
  var selectedImageLoc = '/img/shapeways/ud_star_hover.gif';
  
  for (i=1;i<=starNo;i++)
  {
    if ($('voting_star'+i+'_'+rankObj.model_id).src != selectedImageLoc)
      $('voting_star'+i+'_'+rankObj.model_id).oldSrc = $('voting_star'+i+'_'+rankObj.model_id).src;
    $('voting_star'+i+'_'+rankObj.model_id).src = selectedImageLoc;
  }
}

function castVote(rating, rankObj)
{
  $('votes_rating'+rankObj.model_id).hide()
  document.getElementById('votes_busy'+rankObj.model_id).style.display = 'block';

  new Ajax.Request(rankObj.url, {
    method: 'post',
    postBody: 'vote=' + rating + '&model_id=' + rankObj.model_id,
    onSuccess: function(transport) {

      var responseBits  = transport.responseText.split('|');
      var ranking_votes = parseInt(responseBits[0]);
      var avg_ranking   = parseInt(responseBits[1]);
      
      if (isNaN(ranking_votes) || isNaN(avg_ranking) || transport.responseText == 'already_voted' || transport.responseText == 'invalid_vote')
      {
        $('votes_error'+rankObj.model_id).show();
        $('votes_busy'+rankObj.model_id).hide();
        $('votes_rating'+rankObj.model_id).show();
      }
      else
      { 
        for (var i=1;i<=5;i++)
        {
          Event.stopObserving($('voting_star'+i+'_'+rankObj.model_id),'mouseover', rankObj.votingmouseoverArr[i]);
          Event.stopObserving($('voting_star'+i+'_'+rankObj.model_id),'click',     rankObj.votingmouseclickArr[i]);
          $('voting_star'+i+'_'+rankObj.model_id).style.cursor = '';
          
          $('voting_star'+i+'_'+rankObj.model_id).oldSrc = '';
          if (i<=avg_ranking)
          {
            $('voting_star'+i+'_'+rankObj.model_id).src = '/img/shapeways/ud_star_on.gif';
          }
          else
          {
            $('voting_star'+i+'_'+rankObj.model_id).src = '/img/shapeways/ud_star_off.gif'; 
          }
        }

        Event.observe($('myratingStar'+rankObj.model_id),'mouseover',function() {  $('myrating'+rankObj.model_id).show();  });
        Event.observe($('myratingStar'+rankObj.model_id),'mouseout', function() {  $('myrating'+rankObj.model_id).hide();  });
        
        var index = 0;
        $$('#myrating'+rankObj.model_id+' img').each(
          function (element) {
            index++;
            if (index<=rating)
            {
              element.src = '/img/shapeways/ud_star_on.gif'; 
            }
            else
            {
              element.src = '/img/shapeways/ud_star_off.gif'; 
            }
          }
        )

        $('votes_count'+rankObj.model_id).innerHTML = ranking_votes;

        $('votes_busy'+rankObj.model_id).hide();
        $('votes_rating'+rankObj.model_id).show();

        $('votes_thankyou'+rankObj.model_id).show();
        setTimeout('$(\'votes_thankyou'+rankObj.model_id+'\').hide();',1500);  
      }
    }
  });
}


function VotingMouseOut(rankObj)
{
  for (i=1;i<=5;i++)
  {
    if ($('voting_star'+i+'_'+rankObj.model_id).oldSrc)
    {
      $('voting_star'+i+'_'+rankObj.model_id).src = $('voting_star'+i+'_'+rankObj.model_id).oldSrc;
    }
  }
}
