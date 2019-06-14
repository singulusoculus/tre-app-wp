<?php
require_once('C:\xampp\apps\wordpress\htdocs\wp-load.php');

$func = $_POST['func'];

switch ($func) {
  case 'getAllGamesApproved':
    getAllGamesApproved();
    break;
  case 'combineGames':
    combineGames();
    break;
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

function getAllGamesApproved() {
  global $wpdb;

  $results = $wpdb->get_results ("SELECT bg_id
  , bg_name
  , at_times_ranked AS times_ranked
  , CASE WHEN at_rank = 0 THEN \"NR\" ELSE at_rank END AS rank
  FROM re_boardgames 
  ORDER BY at_rank ASC", ARRAY_A );

$results_json = json_encode($results);

echo $results_json;
}

function combineGames() {
  global $wpdb;

  $oldid = $_POST['olditemid'];
  $newid = $_POST['newitemid'];

  $query = "CALL `combine_games_by_id`(".$oldid.",".$newid.");";
  $result = $wpdb->query($query);
  echo $result;

}

function getTopGamesAll() {
  global $wpdb;

  $results = $wpdb->get_results ("SELECT at_rank AS rank
  , bg_name
  , at_list_score AS list_score
  , at_pop_score AS pop_score
  , round(at_list_score + at_pop_score, 3) as total_score
  , at_times_ranked AS times_ranked
  FROM re_boardgames 
  WHERE at_rank <> 0
  ORDER BY at_rank ASC", ARRAY_A );

  $results_json = json_encode($results);

  echo $results_json;

}

function getTopGamesD30() {
  global $wpdb;

  $results = $wpdb->get_results ("SELECT d30_rank AS rank
  , bg_name
  , d30_list_score AS list_score
  , d30_pop_score AS pop_score
  , round(d30_list_score + d30_pop_score, 3) as total_score
  , d30_times_ranked AS times_ranked
  FROM re_boardgames 
  WHERE d30_rank <> 0
  ORDER BY d30_rank ASC", ARRAY_A );

  $results_json = json_encode($results);

  echo $results_json;

}

function getTopGamesYear() {
  global $wpdb;

  $results = $wpdb->get_results ("SELECT cy_rank AS rank
  , bg_name
  , cy_list_score AS list_score
  , cy_pop_score AS pop_score
  , round(cy_list_score + cy_pop_score, 3) as total_score
  , cy_times_ranked AS times_ranked
  FROM re_boardgames 
  WHERE cy_rank <> 0
  ORDER BY cy_rank ASC", ARRAY_A );

  $results_json = json_encode($results);

  echo $results_json;

}

function getTotals() {
  global $wpdb;

  $users = $wpdb->get_row( "SELECT count(wp_ydlp_usermeta.user_id) AS TotalUsers FROM wp_ydlp_usermeta join wp_ydlp_users on wp_ydlp_usermeta.user_id = wp_ydlp_users.id WHERE meta_key = 'wp_ydlp_user_level' AND meta_value = 0
  ", ARRAY_A );

  $usersprev = $wpdb->get_row( "SELECT count(wp_ydlp_usermeta.user_id) AS TotalUsers FROM wp_ydlp_usermeta join wp_ydlp_users on wp_ydlp_usermeta.user_id = wp_ydlp_users.id WHERE meta_key = 'wp_ydlp_user_level'  AND meta_value = 0 AND DATE(user_registered) = curdate()
  ", ARRAY_A );

  $lists = $wpdb->get_row( "SELECT count(result_id) AS TotalLists FROM re_results_h", ARRAY_A );

  $listsprev = $wpdb->get_row( "SELECT count(result_id) AS TotalLists FROM re_results_h WHERE finish_date = curdate()", ARRAY_A );

  $items = $wpdb->get_row( "SELECT count(id) AS TotalItems FROM re_results_d", ARRAY_A );

  $itemsprev = $wpdb->get_row( "SELECT count(re_results_d.id) AS TotalItems  FROM re_results_d  JOIN re_results_h on re_results_d.result_id = re_results_h.result_id WHERE finish_date = curdate()
  ", ARRAY_A );

  $data = array();
  array_push($data, $users, $usersprev, $lists, $listsprev, $items, $itemsprev);

  $dataJSON = json_encode($data);
  print_r($dataJSON);

}