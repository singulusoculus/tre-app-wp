<?php
/*

Template Name: Shared Rankings

*/
?>

<link rel="stylesheet" type="text/css" href="<?php echo get_theme_file_uri('/dist/datatables.min.css'); ?>">
<link rel="stylesheet" type="text/css" href="<?php echo get_theme_file_uri('/dist/buttons.dataTables.min.css'); ?>">

<?php get_header(); ?>

<main class="container">

  <div class="loading">Loading&#8230;</div>

  <h4 class="center-align">Shared Rankings</h4>

  <div class="row">
    <div class="col s12 m6 offset-m3">
      <div class="card blue-grey darken-1">
        <div class="card-content white-text center-align db-stats">
          <span class="card-title">Times Ranked</span>
          <div id="count-lists" class="count">...</div>
        </div>
      </div>
    </div>
  </div>
  <div class="divider-sm"></div>
  <p id="listid"></p>

  <div id="rankings-at" class="col s12">
      <table id="rankings-at__table" class="striped">
        <thead>
            <tr>
            <th scope="col">Rank</th>
            <th scope="col">Game</th>
            <th scope="col">Pct Score</th>
            <th scope="col">Pop Score</th>
            <th scope="col">Total Score</th>
            <th scope="col">Times Ranked</th>
            </tr>
        </thead>
        <tbody id="rankings-at__rows"></tbody>
      </table>
    </div>

</main>

<script src="<?php echo get_theme_file_uri('/dist/sharedrankings-bundle.js'); ?>"></script>

<?php get_footer(); ?>