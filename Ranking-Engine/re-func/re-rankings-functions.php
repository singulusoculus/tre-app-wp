<?php
require_once('../../../../wp-load.php');

$func = $_POST['func'];

switch ($func) {
  case 'getTopGamesAll':
    getTopGamesAll();
    break;
  case 'getTopGamesD30':
    getTopGamesD30();
    break;
  case 'getTopGamesYear':
    getTopGamesYear();
    break;
  case 'getTotals':
    getTotals();
    break;
  case 'getYears':
    getYears();
    break;
  case 'getYearTotals':
    getYearTotals();
    break;
}

function getTopGamesAll() {
    global $wpdb;
  
    $results = $wpdb->get_results ("SELECT at_rank AS rank
    , bg_name
    , round(at_list_score + at_pop_score, 3) as total_score
    FROM wp_re_boardgames 
    WHERE at_rank <> 0
    ORDER BY at_rank ASC
    LIMIT 300", ARRAY_A );
  
    $results_json = json_encode($results);
  
    echo $results_json;
  
  }
  
  function getTopGamesD30() {
    global $wpdb;
  
    $results = $wpdb->get_results ("SELECT d30_rank AS rank
    , bg_name
    , round(d30_list_score + d30_pop_score, 3) as total_score
    FROM wp_re_boardgames 
    WHERE d30_rank <> 0
    ORDER BY d30_rank ASC
    LIMIT 300", ARRAY_A );
  
    $results_json = json_encode($results);
  
    echo $results_json;
  
  }
  
  function getTopGamesYear() {
    global $wpdb;
    $year = $_POST['year'];
    $currentYear = date("Y");
    
    if ($year === $currentYear) {
      $results = $wpdb->get_results ("SELECT cy_rank AS rank
      , bg_name
      , round(cy_list_score + cy_pop_score, 3) as total_score
      FROM wp_re_boardgames 
      WHERE cy_rank <> 0
      ORDER BY cy_rank ASC
      LIMIT 300", ARRAY_A );
    } else {
      $results = $wpdb->get_results ("SELECT bg_rank AS rank
      , bg_name
      , total_score
      FROM wp_re_boardgames_hist_year
      WHERE period = $year
      ORDER BY bg_rank ASC
      LIMIT 300", ARRAY_A);
    }
  
    $results_json = json_encode($results);
  
    echo $results_json;
  
  }

function getTotals() {
    global $wpdb;
  
    $atLists = $wpdb->get_row( "SELECT count(result_id) AS TotalLists FROM wp_re_results_h WHERE list_category = 2 AND item_count > 10", ARRAY_A );
  
    $atItems = $wpdb->get_row( "SELECT sum(item_count) as TotalItems FROM wp_re_results_h WHERE list_category = 2 AND item_count > 10", ARRAY_A );

    $cyLists = $wpdb->get_row( "SELECT count(result_id) AS TotalLists FROM wp_re_results_h WHERE list_category = 2 AND item_count > 10 AND year(finish_date) = year(current_date())", ARRAY_A );

    $cyItems = $wpdb->get_row( "SELECT sum(item_count) as TotalItems FROM wp_re_results_h WHERE list_category = 2 AND item_count > 10 AND year(finish_date) = year(current_date())", ARRAY_A );

    $d30Lists = $wpdb->get_row( "SELECT count(result_id) AS TotalLists FROM wp_re_results_h WHERE list_category = 2 AND item_count > 10 AND (wp_re_results_h.finish_date) >= DATE_SUB(NOW(), INTERVAL 30 DAY)", ARRAY_A );

    $d30Items = $wpdb->get_row( "SELECT sum(item_count) as TotalItems FROM wp_re_results_h WHERE list_category = 2 AND item_count > 10 AND (wp_re_results_h.finish_date) >= DATE_SUB(NOW(), INTERVAL 30 DAY)", ARRAY_A );
  
    $data = array();
    array_push($data, $atLists, $atItems, $cyLists, $cyItems, $d30Lists, $d30Items);
  
    $dataJSON = json_encode($data);
    print_r($dataJSON);
  
  }

function getYearTotals() {
  global $wpdb;
  $year = $_POST['year'];

  $cyLists = $wpdb->get_row( "SELECT count(result_id) AS TotalLists FROM wp_re_results_h WHERE list_category = 2 AND item_count > 10 AND year(finish_date) = $year", ARRAY_A );

  $cyItems = $wpdb->get_row( "SELECT sum(item_count) as TotalItems FROM wp_re_results_h WHERE list_category = 2 AND item_count > 10 AND year(finish_date) = $year", ARRAY_A );

  $data = array();
  array_push($data, $cyLists, $cyItems);

  $dataJSON = json_encode($data);
  print_r($dataJSON);

}

function getYears() {
  global $wpdb;

  $years = $wpdb->get_results( 
    "SELECT period FROM `wp_re_boardgames_hist_maxcounts` as a WHERE period_type = 'Y'
    UNION
    SELECT year(CURRENT_DATE()) as period FROM `wp_re_boardgames_hist_maxcounts` as b WHERE period_type = 'Y'
    ORDER BY `period` DESC"
    , ARRAY_A );

    $results_json = json_encode($years);
  
    echo $results_json;

}