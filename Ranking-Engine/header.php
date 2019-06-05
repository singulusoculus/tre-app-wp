<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>" />
<meta name="viewport" content="width=device-width" />
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>

<div class="loading">Loading&#8230;</div>

<div id="ranking-engine-container">

<nav class="nav-pm">
    <div class="nav-wrapper">
      <a href="#" class="brand-logo"><img class="nav-pm__logo" src="./wp-content/themes/Ranking-Engine/images/pm-banner.png" alt=""></a>
      <a href="#" data-target="mobile-nav-pm" class="sidenav-trigger"><i class="material-icons">menu</i></a>
      <ul id="nav-mobile" class="right hide-on-med-and-down nav-pm__links">
        <li><a href="#">Articles</a></li>
        <li><a href="#">Podcast</a></li>
        <li><a href="#">Resources</a></li>
        <li><a href="#">Reviews</a></li>
        <li><a href="#">Support Us</a></li>
        <li><a href="#">Videos</a></li>
        <li><a class="dropdown-trigger" href="#!" data-target="account-dropdown"><i class="material-icons">account_circle</i></a></li>
      </ul>
    </div>
  </nav>

<ul id="account-dropdown" class="dropdown-content">

</ul>

  <ul class="sidenav" id="mobile-nav-pm">
    <li><a href=" #">Articles</a></li>
    <li><a href="#">Podcast</a></li>
    <li><a href="#">Resources</a></li>
    <li><a href="#">Reviews</a></li>
    <li><a href="#">Support Us</a></li>
    <li><a href="#">Videos</a></li>
    <div class="divider"></div>
    <li><a href="#">Current Rankings</a></li>
    <li><a href="#">Codex</a></li>
    <li><a href="#">Contact</a></li>
    <div class="divider"></div>

  </ul>