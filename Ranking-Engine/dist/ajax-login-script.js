jQuery(document).ready(function($) {

//ajax login form submit functionality for The Ranking Engine - staring in 1.4
    jQuery('form#login-form').on('submit', function(e){
        jQuery('form#login-form p.status').show().text(ajax_login_object.loadingmessage);
        jQuery.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajax_login_object.ajaxurl,
            data: { 
                'action': 'ajaxlogin', //calls wp_ajax_nopriv_ajaxlogin
                'username': $('form#login-form #username').val(), 
                'password': $('form#login-form #password').val(), 
                'security': $('form#login-form #security').val() },
            success: function(data){
                $('form#login-form p.status').text(data.message);
                if (data.loggedin == true){
                    document.location.href = ajax_login_object.redirecturl;
                }
            }
        });
        e.preventDefault();
    }); 
});