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

  <div class="loading">Loading&#8230;</div>

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
            <th scope="col">Pct Score</th>
            <th scope="col">Pop Score</th>
            <th scope="col">Total Score</th>
            <th scope="col">Times Ranked</th>
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
            <th scope="col">Pct Score</th>
            <th scope="col">Pop Score</th>
            <th scope="col">Total Score</th>
            <th scope="col">Times Ranked</th>
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
            <th scope="col">Pct Score</th>
            <th scope="col">Pop Score</th>
            <th scope="col">Total Score</th>
            <th scope="col">Times Ranked</th>
            </tr>
        </thead>
        <tbody id="rankings-d30__rows"></tbody>
      </table>
    </div>

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


  <div class="row">
        <div class="input-field col s4">
          <input placeholder="Old ID" id="old-game-id" type="text" class="validate">
          <label for="old-game-id">Combine Games</label>
        </div>
        <div class="input-field col s4">
          <input placeholder="New ID" id="new-game-id" type="text" class="validate">
          
        </div>
        <div class="col s4">
      <a id="combine-games-submit" class="waves-effect waves-light btn">Go!</a>
    </div>
  </div>

  <p class="section-title">All Games</p>
  <div class="divider-sm"></div>
  <div id="all-games" class="col s12">
      <table id="all-games__table" class="striped">
        <thead>
            <tr>
              <th scope="col">BGID</th>
              <th scope="col">Game</th>
              <th scope="col">Times Ranked</th>
              <th scope="col">AT Rank</th>
            </tr>
        </thead>
        <tbody id="all-games__rows"></tbody>
      </table>
    </div>

  <ul class="collapsible popout">
    <li class="">
    <div class="collapsible-header">2.0 Transfer Processes</div>
    <div class="collapsible-body center-align">
    <a id="progress-transfer" class="waves-effect waves-light btn">Progress Transfer</a>
    <a id="user-result-transfer" class="waves-effect waves-light btn">User Result Transfer</a>
    <a id="result-transfer" class="waves-effect waves-light btn">Ranking Result Transfer</a>
    </div>
    </li>
  </ul>

  <script src="<?php echo get_theme_file_uri('/dist/dashboard-bundle.js'); ?>"></script>

<?php } else {
    // we will show password form here
    echo get_the_password_form();
} ?>

</main>

<?php get_footer(); ?>