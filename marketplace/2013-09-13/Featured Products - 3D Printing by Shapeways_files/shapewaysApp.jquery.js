




/*
     FILE ARCHIVED ON 19:53:51 Sep 13, 2013 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 2:10:44 Jun 27, 2015.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
var secureServer = '';

jQuery(document).ready(function() {
  var fade = ! jQuery('#iecontainer').length ? 691 : 0;
  jQuery(window).scroll(function() {
    showVisibleImages(fade);
  });
  showVisibleImages(223);

  jQuery('#generic-sign-up-form').submit(handleGenericSignUpForm);
  jQuery('#generic-login-form').submit(handleGenericLoginForm);
});

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

//login box
function handleGenericSignUpForm() {
  var inputs = jQuery('#generic-sign-up-form :input');
  var values = new Array();
  var validate = true;

  inputs.each(function() {
    // not empty allowed
    values[this.name] = jQuery(this).val();
    if(values[this.name] === "") {
      var error_msg = this.name + ' is required field.';
      $('#sign-up-form-message').html(error_msg);
      $('#sign-up-form-message').addClass('show');
      return validate = false;
    }

    if(this.name == 'username' && jQuery(this).val().length < 2) { // check username
      jQuery('#sign-up-form-message').html('Length of username must be 3 or more.');
      return validate = false;
    } else if(this.name == 'password' &&  jQuery(this).val().length < 5) { // check password length
      jQuery('#sign-up-form-message').html('Length of password must be 6 or more.');
      return validate = false;
    } else if(this.name == 're_type_password' && values['password'] != jQuery(this).val()) { // check re-type password == password or not
      jQuery('#sign-up-form-message').html('Password fields do not match.');
      return validate = false;
    } else if(this.name == 'email') { // check email format
      //alert( $(this).val().length );
    }
  });


  if(validate) {
    // use ajax call for sign up
    jQuery.post(
      secureServer + "/register/json&"+Math.random(),
      {username : values['username'], password : values['password'], passwordConfirm : values['re_type_password'], email : values['email'], agreePrivacy : true, agreeTerms : true, agreeNewsletter : true },
      function(data) {
        data = jQuery.parseJSON(data);
        if(data.success) {
          window.location.replace(window.location.pathname);
        } else {
          for(var field in data.errors.fieldErrors) {
            var error_msg = field + " " + data.errors.fieldErrors[field];
            break;
          }
          jQuery('#sign-up-form-message').html(error_msg);
          return validate = false;
        }
      }
    );
  }
  return false;

}

function handleGenericLoginForm() {
  var inputs = jQuery('#generic-login-form :input');
  var values = new Array();
  var validate = true;

  inputs.each(function() {
    // not empty allowed
    values[this.name] = jQuery(this).val();
    if(values[this.name] === "") {
      var error_msg = this.name + ' is required field.';
      jQuery('#login-form-message').html(error_msg);
      jQuery('#login-form-message').addClass('show');
      return validate = false;
    }

  });

  if(validate) {
    // ajax calling for login
    jQuery.post(
      secureServer + "/login/json&"+Math.random(),
      {username : values['username'], password : values['password']},
      function(data) {
        data = jQuery.parseJSON(data);
        if(data.success) {
          window.location.replace(window.location.pathname);
        } else {
          var error_msg = data.message[0]+'';
          jQuery('#login-form-message').html(error_msg);
          jQuery('#login-form-message').addClass('show');
          return validate = false;
        }
      }
    );

  }

  return false;
}
