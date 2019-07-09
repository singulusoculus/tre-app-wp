<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>" />
  <meta name="viewport" content="width=device-width" />
  <title>Ranking Engine</title>
  <?php wp_head(); ?>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="shortcut icon" href="favicon.ico" type="image/x-icon">

  <!-- Global site tag (gtag.js) - Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=UA-143419312-1"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'UA-143419312-1');
  </script>
</head>
<body <?php body_class(); ?> >

  <div class="loading-squares">
    <div class="scaling-squares-spinner" :style="spinnerStyle">
      <div class="square"></div>
      <div class="square"></div>
      <div class="square"></div>
      <div class="square"></div>
    </div>
  </div>

  <div id="ranking-engine-container">

  <nav class="nav-pm">
    <div class="nav-wrapper">
      <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="brand-logo"><img class="nav-pm__logo" src="<?php echo get_theme_file_uri('/images/pm-banner.png'); ?>" alt=""></a>
      <a href="#" data-target="mobile-nav-pm" class="sidenav-trigger"><i class="material-icons">menu</i></a>
      <ul id="nav-mobile" class="right hide-on-med-and-down nav-pm__links">
        <li><a href="https://www.pubmeeple.com/category/articles">Articles</a></li>
        <li><a href="https://www.pubmeeple.com/contact">Contact</a></li>
        <li><a href="https://www.pubmeeple.com/pub-meeple-podcast">Podcast</a></li>
        <li><a href="https://www.pubmeeple.com/category/resources">Resources</a></li>
        <li><a href="https://www.pubmeeple.com/category/reviews">Reviews</a></li>
        <li><a href="https://www.pubmeeple.com/support-us">Support Us</a></li>
        <li><a href="https://www.pubmeeple.com/category/videos">Videos</a></li>
      </ul>
    </div>
  </nav>

  <ul class="sidenav" id="mobile-nav-pm">
    <li><a href="./">Ranking Engine Home</a></li>
    <div class="divider"></div>
    <li><a href="https://www.pubmeeple.com/category/articles">Articles</a></li>
    <li><a href="./rankings">Current Rankings</a></li>
    <li><a href="https://www.pubmeeple.com/contact">Contact</a></li>
    <li><a href="https://www.pubmeeple.com/pub-meeple-podcast">Podcast</a></li>
    <li><a href="https://www.pubmeeple.com/category/resources">Resources</a></li>
    <li><a href="https://www.pubmeeple.com/category/reviews">Reviews</a></li>
    <li><a href="ttps://www.pubmeeple.com/support-us">Support Us</a></li>
    <li><a href="https://www.pubmeeple.com/category/videos">Videos</a></li>
  </ul>
