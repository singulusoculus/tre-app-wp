<?php
/*

Template Name: RE Rankings 2.0

*/
?>

<link rel="stylesheet" type="text/css" href="<?php echo get_theme_file_uri('/dist/datatables.min.css'); ?>">
<link rel="stylesheet" type="text/css" href="<?php echo get_theme_file_uri('/dist/buttons.dataTables.min.css'); ?>">

<?php get_header(); ?>

<main class="container">

  <div class="loading">Loading&#8230;</div>

  <h4 class="center-align">BGRE Rankings - <?php echo date("m/d/Y"); ?></h4>

  <div class="row">
  <div class="col s12 m6">
      <div class="card blue-grey darken-1">
        <div class="card-content white-text center-align db-stats">
          <span class="card-title">Lists</span>
          <div id="count-lists" class="count">...</div>
        </div>
      </div>
    </div>

    <div class="col s12 m6">
      <div class="card blue-grey darken-1">
        <div class="card-content white-text center-align db-stats">
          <span class="card-title">Items Ranked</span>
          <div id="count-items" class="count">...</div>
        </div>
      </div>
    </div>
  </div>

  <div class="row">
    <div class="col s12">
      <ul class="tabs tabs-fixed-width">
        <li class="tab col s3"><a href="#rankings-at" class="active">All-time</a></li>
        <li class="tab col s3"><a href="#rankings-y"><?php echo date("Y"); ?></a></li>
        <li class="tab col s3"><a href="#rankings-d30">30 Days</a></li>
      </ul>
    <div class="divider-sm"></div>
    </div>
    <div id="rankings-at" class="col s12">
      <table id="rankings-at__table" class="striped">
        <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">Game</th>
              <th scope="col">Score</th>
            </tr>
        </thead>
        <tbody id="rankings-at__rows"></tbody>
      </table>
    </div>

    <div id="rankings-y" class="col s12">
      <table id="rankings-y__table" class="striped">
        <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">Game</th>
              <th scope="col">Score</th>
            </tr>
        </thead>
        <tbody id="rankings-y__rows"></tbody>
      </table>
    </div>

    <div id="rankings-d30" class="col s12">
      <table id="rankings-d30__table" class="striped">
        <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">Game</th>
              <th scope="col">Score</th>
            </tr>
        </thead>
        <tbody id="rankings-d30__rows"></tbody>
      </table>
    </div>

  </div>


</main>

<script src="<?php echo get_theme_file_uri('/dist/rankings-bundle.js'); ?>"></script>

<?php get_footer(); ?>