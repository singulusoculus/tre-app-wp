<?php
/*

Template Name: Rankings

*/
?>

<link rel="stylesheet" type="text/css" href="<?php echo get_theme_file_uri('/dist/datatables.min.css'); ?>">
<link rel="stylesheet" type="text/css" href="<?php echo get_theme_file_uri('/dist/buttons.dataTables.min.css'); ?>">

<?php get_header(); ?>

<main class="container">

  <h4 class="center-align">BGRE Rankings - <?php echo date("m/d/Y"); ?></h4>

  <div class="row">
    <div class="col s12">
      <ul class="tabs tabs-fixed-width">
        <li class="tab col s3"><a href="#rankings-at-wrapper" class="active">All-time</a></li>
        <li class="tab col s3"><a href="#rankings-y-wrapper" id="tab-title-year">Year - <?php echo date("Y"); ?></a></li>
        <li class="tab col s3"><a href="#rankings-d30-wrapper">30 Days</a></li>
      </ul>
    <div class="divider-sm"></div>
    </div>

    <div id="rankings-wrapper" style="display: none;">
      
      <div id="rankings-at-wrapper">
        <div class="row">
          <div class="col s12 m6">
            <div class="card blue-grey darken-1">
              <div class="card-content white-text center-align db-stats">
                <span class="card-title">Lists</span>
                <div id="at-count-lists" class="count">...</div>
              </div>
            </div>
          </div>

          <div class="col s12 m6">
            <div class="card blue-grey darken-1">
              <div class="card-content white-text center-align db-stats">
                <span class="card-title">Items Ranked</span>
                <div id="at-count-items" class="count">...</div>
              </div>
            </div>
          </div>
        </div>

        <div id="rankings-at-table-wrapper"></div>  
      </div>

      <div id="rankings-y-wrapper">
      
        <div class="row">
          <div class="col s12 m6">
            <div class="card blue-grey darken-1">
              <div class="card-content white-text center-align db-stats">
                <span class="card-title">Lists</span>
                <div id="cy-count-lists" class="count">...</div>
              </div>
            </div>
          </div>

          <div class="col s12 m6">
            <div class="card blue-grey darken-1">
              <div class="card-content white-text center-align db-stats">
                <span class="card-title">Items Ranked</span>
                <div id="cy-count-items" class="count">...</div>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="input-field col s12 m4 offset-m4 l2 offset-l5">
            <select id="year-select" class="complete">
            </select>
            <label>Select a Year</label>
          </div>
        </div>

        <div id="rankings-y-table-wrapper"></div>
      </div>

      <div id="rankings-d30-wrapper">
        <div class="row">
          <div class="col s12 m6">
            <div class="card blue-grey darken-1">
              <div class="card-content white-text center-align db-stats">
                <span class="card-title">Lists</span>
                <div id="d30-count-lists" class="count">...</div>
              </div>
            </div>
          </div>

          <div class="col s12 m6">
            <div class="card blue-grey darken-1">
              <div class="card-content white-text center-align db-stats">
                <span class="card-title">Items Ranked</span>
                <div id="d30-count-items" class="count">...</div>
              </div>
            </div>
          </div>
        </div>
        <div id="rankings-d30-table-wrapper"></div>
      </div>
    </div>


  </div>


</main>

<script src="<?php echo get_theme_file_uri('/dist/rankings-bundle.js'); ?>"></script>

<?php get_footer(); ?>