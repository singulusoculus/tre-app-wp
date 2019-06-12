<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>" />
<meta name="viewport" content="width=device-width" />
<?php wp_head(); ?>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</head>
<body <?php body_class(); ?> >

  <div class="loading">Loading&#8230;</div>

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
    <li><a href="https://www.pubmeeple.com/category/articles">Articles</a></li>
    <li><a href="./rankings">Current Rankings</a></li>
    <li><a href="https://www.pubmeeple.com/contact">Contact</a></li>
    <li><a href="https://www.pubmeeple.com/pub-meeple-podcast">Podcast</a></li>
    <li><a href="https://www.pubmeeple.com/category/resources">Resources</a></li>
    <li><a href="https://www.pubmeeple.com/category/reviews">Reviews</a></li>
    <li><a href="ttps://www.pubmeeple.com/support-us">Support Us</a></li>
    <li><a href="https://www.pubmeeple.com/category/videos">Videos</a></li>
    <div class="divider"></div>
    <div id="sidenav__account"></div>
  </ul>
