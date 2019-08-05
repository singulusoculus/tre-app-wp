<?php
require_once('../../../../wp-load.php');

$func = $_POST['func'];

switch ($func) {
  case 'getTemplateListData':
    getTemplateListData();
    break;
  case 'getSharedResults':
    getSharedResults();
    break;
  case 'getTimesRanked':
    getTimesRanked();
    break;
  case 'setShareResultsFlag':
    setShareResultsFlag();
    break;
}

function getTemplateListData() {
    global $wpdb;
    $id = $_POST['uuid'];
  
    $str_id = removeslashes($id);
    $str_id = sanitize_text_field($str_id);

    $results = $wpdb->get_results( "SELECT template_id, wpuid, template_uuid, template_desc, shared, results_public FROM wp_re_list_templates WHERE template_uuid = $str_id", ARRAY_A );
    $results_json = json_encode($results);
    echo $results_json;

}

function getSharedResults() {
  global $wpdb;
  $id = $_POST['id'];
  
  $results = $wpdb->get_results ("SELECT item_name, list_score, pop_score, list_score + pop_score AS total_score, times_ranked
  FROM (SELECT wp_re_results_d.item_name
  , round(avg(((wp_re_results_h.item_count-item_rank+1)/wp_re_results_h.item_count)*100), 3) AS list_score
  , count(wp_re_results_d.item_name) as times_ranked
  , total.total_lists
  , round((count(wp_re_results_d.item_name))*20/total.total_lists, 3) AS pop_score
  FROM wp_re_results_h
  LEFT JOIN wp_re_results_d ON wp_re_results_h.result_id = wp_re_results_d.result_id
  CROSS JOIN (SELECT parent_list_id, count(wp_re_results_h.result_id) as total_lists FROM wp_re_results_h WHERE parent_list_id = $id) as total 
  WHERE wp_re_results_h.parent_list_id = $id
  GROUP BY wp_re_results_d.item_name) AS sharedresults
  ORDER BY total_score DESC", ARRAY_A );

  $results_json = json_encode($results);

  echo $results_json;
}

function getTimesRanked() {
  global $wpdb;
  $id = $_POST['id'];
  
  $results = $wpdb->get_results ("SELECT count(wp_re_results_h.result_id) as total_lists FROM wp_re_results_h WHERE parent_list_id = $id", ARRAY_A );

  $results_json = json_encode($results);

  echo $results_json;
}

function setShareResultsFlag() {
  global $wpdb;
  $templateId = $_POST['id'];
  $value = $_POST['value'];

  $wpdb->update('wp_re_list_templates', // Table to update
    array('results_public' => $value), // Update field
    array('template_id' => $templateId), // Where parameter
    array( '%d' ), // Update field data type
    array( '%d' ) // Where parameter data type
  );
}


function removeslashes($string) {
    $string = implode("", explode("\\", $string));
    return stripslashes(trim($string));
  }

?>