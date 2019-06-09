<?php
require_once('C:\xampp\apps\wordpress\htdocs\wp-load.php');

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
}

function getTopGamesAll() {
    global $wpdb;
  
    $results = $wpdb->get_results ("SELECT at_rank AS rank
    , bg_name
    , round(at_list_score + at_pop_score, 3) as total_score
    FROM re_boardgames 
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
    FROM re_boardgames 
    WHERE d30_rank <> 0
    ORDER BY d30_rank ASC
    LIMIT 300", ARRAY_A );
  
    $results_json = json_encode($results);
  
    echo $results_json;
  
  }
  
  function getTopGamesYear() {
    global $wpdb;
  
    $results = $wpdb->get_results ("SELECT cy_rank AS rank
    , bg_name
    , round(cy_list_score + cy_pop_score, 3) as total_score
    FROM re_boardgames 
    WHERE cy_rank <> 0
    ORDER BY cy_rank ASC
    LIMIT 300", ARRAY_A );
  
    $results_json = json_encode($results);
  
    echo $results_json;
  
  }

function getTotals() {
    global $wpdb;
  
    $lists = $wpdb->get_row( "SELECT count(result_id) AS TotalLists FROM re_results_h", ARRAY_A );
  
    $items = $wpdb->get_row( "SELECT count(id) AS TotalItems FROM re_results_d", ARRAY_A );
  
    $data = array();
    array_push($data, $lists, $items);
  
    $dataJSON = json_encode($data);
    print_r($dataJSON);
  
  }