<?php

show_admin_bar( false );

add_action( 'wp_enqueue_scripts', 'blankslate_load_scripts' );

function blankslate_load_scripts() {
  wp_enqueue_style( 'blankslate-style', get_stylesheet_uri() );
  wp_enqueue_script( 'jquery' );
  wp_enqueue_style( 're-materialze-style', get_theme_file_uri( '/dist/materialize.min.css') );
  wp_enqueue_style( 're-main-style', get_theme_file_uri( '/dist/main.css') );
  wp_enqueue_script( 're-materialize-js', get_theme_file_uri( '/dist/materialize.min.js' ) );
  wp_enqueue_script( 're-bundle-js', get_theme_file_uri( '/dist/bundle.js') );
  wp_enqueue_script( 're-datatables-js', get_theme_file_uri('/dist/datatables.min.js') );
}

?>

