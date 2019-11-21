<?php
/*

Template Name: Dashboard

*/
?>

<link rel="stylesheet" type="text/css" href="<?php echo get_theme_file_uri('/dist/datatables.min.css'); ?>">
<link rel="stylesheet" type="text/css" href="<?php echo get_theme_file_uri('/dist/buttons.dataTables.min.css'); ?>">

<?php get_header(); ?>

<main class="container">

<?php if ( ! post_password_required( $post ) ) { ?>

  <h4 class="center-align">Ranking Engine Dashboard</h4>

  <div class="row">

    <div class="col s12 m4">
      <div class="card blue-grey darken-1">
        <div class="card-content white-text center-align db-stats">
          <span class="card-title">Users</span>
          <div id="count-users" class="count">...</div>
          <div id="count-users-prev" class="count-bottom">(...)</div>
        </div>
      </div>
    </div>

    <div class="col s12 m4">
      <div class="card blue-grey darken-1">
        <div class="card-content white-text center-align db-stats">
          <span class="card-title">Lists</span>
          <div id="count-lists" class="count">...</div>
          <div id="count-lists-prev" class="count-bottom">(...)</div>
        </div>
      </div>
    </div>

    <div class="col s12 m4">
      <div class="card blue-grey darken-1">
        <div class="card-content white-text center-align db-stats">
          <span class="card-title">Items Ranked</span>
          <div id="count-items" class="count">...</div>
          <div id="count-items-prev" class="count-bottom">(...)</div>
        </div>
      </div>
    </div>

  </div>

  <h5 class="center-align">Current Rankings</h5>

  <div class="row">
    <div class="col s12">
      <ul class="tabs tabs-fixed-width">
        <li class="tab col s3"><a href="#rankings-at-table-wrapper" class="active">All-time</a></li>
        <li class="tab col s3"><a href="#rankings-y-table-wrapper"><?php echo date("Y"); ?></a></li>
        <li class="tab col s3"><a href="#rankings-d30-table-wrapper">30 Days</a></li>
      </ul>
    <div class="divider-sm"></div>
    </div>

    <div id="rankings-at-table-wrapper"></div>

    <div id="rankings-y-table-wrapper"></div>

    <div id="rankings-d30-table-wrapper"></div>

  </div>

  <h5 class="center-align">Utilities</h5>

  <div class="row">
    <div class="input-field col s4">
      <input placeholder="Month (ex: 201806)" id="load-history" type="text">
      <label for="load-history">Load History</label>
    </div>
    <div class="col s4">
      <a id="load-history-submit" class="waves-effect waves-light btn">Go!</a>
    </div>
  </div>

  <p class="section-title">All Games</p>
  <div class="divider-sm"></div>
  <div id="all-games-table-wrapper"></div>

  <script src="<?php echo get_theme_file_uri('/dist/dashboard-bundle.js'); ?>"></script>

<?php } else {
    // we will show password form here
    echo get_the_password_form();
} ?>

</main>

<?php get_footer(); ?>