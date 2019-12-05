<?php

show_admin_bar( false );

add_action( 'wp_enqueue_scripts', 'blankslate_load_scripts' );

remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );

function blankslate_load_scripts() {
  wp_enqueue_style( 'blankslate-style', get_stylesheet_uri() );
  wp_enqueue_script( 'jquery' );
  wp_enqueue_style( 're-materialze-style', get_theme_file_uri( '/dist/materialize.min.css') );
  wp_enqueue_style( 're-main-style', get_theme_file_uri( '/dist/index.css') );
  wp_enqueue_script( 're-materialize-js', get_theme_file_uri( '/dist/materialize.min.js' ) );
  wp_enqueue_script( 're-datatables-js', get_theme_file_uri('/dist/datatables.min.js') );
}

function wpse_44020_logout_redirect( $logouturl, $redir )
{
    return $logouturl . '&amp;redirect_to=' . './';
}
add_filter( 'logout_url', 'wpse_44020_logout_redirect', 10, 2 );

function getRankingEngineVersion () {
  return '2.1.8';
}

//For The Ranking Engine - starting in 1.4
//ajax login functionality - currently redirects, need to figure out how to not redirect
function ajax_login_init(){

  wp_register_script('ajax-login-script', get_theme_file_uri('/dist/ajax-login-script.js'), array('jquery'), null ); 
  wp_enqueue_script('ajax-login-script');

  //get path to page
  $pagePath = parse_url( $_SERVER['REQUEST_URI'] );
  $pagePath = $pagePath['path'];

  wp_localize_script( 'ajax-login-script', 'ajax_login_object', array( 
      'ajaxurl' => admin_url( 'admin-ajax.php' ),
      'redirecturl' => $pagePath,
      'loadingmessage' => __('Sending user info, please wait...')
  ));

  // Enable the user with no privileges to run ajax_login() in AJAX
  add_action( 'wp_ajax_nopriv_ajaxlogin', 'ajax_login' );
}

// Execute the action only if the user isn't logged in
if (!is_user_logged_in()) {
  add_action('init', 'ajax_login_init');
}

function ajax_login(){

  // First check the nonce, if it fails the function will break
  check_ajax_referer( 'ajax-login-nonce', 'security' );

  // Nonce is checked, get the POST data and sign user on
  $info = array();
  $info['user_login'] = $_POST['username'];
  $info['user_password'] = $_POST['password'];
  $info['remember'] = true;

  $user_signon = wp_signon( $info, false );
  if ( is_wp_error($user_signon) ){
      echo json_encode(array('loggedin'=>false, 'message'=>__('Login failed. Please check username and password.')));
  } else {
      echo json_encode(array('loggedin'=>true, 'message'=>__('Login successful, reloading....')));
  }

  die();
}

function my_custom_login_logo() {
  echo '<style type="text/css">
  h1 a {background-image:url(https://rankingengine.pubmeeple.com/wp-content/themes/Ranking-Engine/images/pm-logo-md.png) !important; margin:0 auto;}
  </style>';
}
add_filter( 'login_head', 'my_custom_login_logo' );



?>