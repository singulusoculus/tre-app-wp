<?php


// require_once('C:\xampp\apps\wordpress\htdocs\wp-config.php');
require_once('C:\xampp\apps\wordpress\htdocs\wp-load.php');

// require_once($_SERVER['DOCUMENT_ROOT'] . $folder . '/wp-config.php');
// require_once($_SERVER['DOCUMENT_ROOT'] . $folder . '/wp-load.php');

$version = '2.0.0';
$func = $_POST['func'];

switch ($func) {
    case 'getOldProgressList':
      getOldProgressList();
      break;
    case 'insertProgressList':
      insertProgressList();
      break;
    case 'getOldProgressListIDs':
      getOldProgressListIDs();
      break;
}

function getOldProgressList() {
    global $wpdb;
    $progressid = $_POST['progressid'];
      
    $results = $wpdb->get_results( "SELECT wpuid, list_desc, save_date, num_of_items, percent_complete, save_data FROM re_progress WHERE list_id = $progressid", ARRAY_A );
  
    $results_json = json_encode($results);
  
    echo $results_json;
  }

function insertProgressList() {
  global $wpdb;
  $wpuid = $_POST['wpuid'];
  $rankData = $_POST['rankData'];
  $saveDesc = $_POST['saveDesc'];
  $itemCount = $_POST['itemCount'];
  $percent = $_POST['percent'];
  $category = $_POST['category'];
  $saveDate = $_POST['saveDate'];
  global $version;

  $rankData = removeslashes($rankData);

  //sanitize description
  $saveDesc = sanitize_text_field($saveDesc);

  //INSERT
  $wpdb->insert(
      're_rank_progress',
      array(
          'progress_id' => null,
          'wpuid' => $wpuid,
          'progress_desc' => $saveDesc,
          'created_date' => $saveDate,
          'save_date' => $saveDate,
          'item_count' => $itemCount,
          'percent_complete' => $percent,
          'list_category' => $category,
          'progress_data' => $rankData,
          're_version' => $version
      ),
      array(
          '%d',
          '%d',
          '%s',
          '%s',
          '%s',
          '%d',
          '%d',
          '%d',
          '%s',
          '%s'
      )
  );

  $newListID = $wpdb->insert_id;
  //send currentlistid back to JS
  echo $newListID;
}

function getOldProgressListIDs() {
  global $wpdb;

  $results = $wpdb->get_results( "SELECT list_id FROM re_progress", ARRAY_A );

  $results_json = json_encode($results);

  echo $results_json;
}


function removeslashes($string) {
    $string = implode("", explode("\\", $string));
    return stripslashes(trim($string));
  }
  
  ?>