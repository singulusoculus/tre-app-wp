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
    case 'deleteOldProgressList':
      deleteOldProgressList();
      break;
    case 'getOldResultLists':
      getOldResultLists();
      break;
    case 'getOldResultDetails':
      getOldResultDetails();
      break;
    case 'insertResultList':
      insertResultList();
      break;
    case 'transferRankingResultsD':
      transferRankingResultsD();
      break;
    case 'transferRankingResultsH':
      transferRankingResultsH();
      break;
}

function getOldProgressList() {
    global $wpdb;
    $progressid = $_POST['progressid'];
      
    $results = $wpdb->get_results( "SELECT wpuid, list_desc, save_date, num_of_items, percent_complete, save_data FROM re_progress_transfer WHERE list_id = $progressid", ARRAY_A );
  
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

  $results = $wpdb->get_results( "SELECT list_id FROM re_progress_transfer", ARRAY_A );

  $results_json = json_encode($results);

  echo $results_json;
}

function deleteOldProgressList() {
  global $wpdb;
  $listid = $_POST['listid'];

  $wpdb->delete( 're_progress_transfer', array('list_id' => $listid ));
}

function getOldResultLists() {
  global $wpdb;

  $results = $wpdb->get_results( "SELECT list_id, wpuid, list_desc, finish_date, num_of_items AS item_count, bgg_flag, list_category FROM re_final_h WHERE wpuid is not null AND wpuid <> 0", ARRAY_A );

  $results_json = json_encode($results);

  echo $results_json;
}

function getOldResultDetails() {
  global $wpdb;
  $listId = $_POST['listId'];

  $results = $wpdb->get_results( "SELECT item_name, item_rank  FROM re_final_d WHERE list_id = $listId", ARRAY_A );

  $results_json = json_encode($results);

  echo $results_json;
}

function insertResultList() {
  global $wpdb;
  $resultData = $_POST['resultJSON'];
  $wpuid = $_POST['wpuid'];
  $desc = $_POST['desc'];
  $finishDate = $_POST['finishDate'];
  $itemCount = $_POST['itemCount'];
  $category = $_POST['category'];
  $uuid = $_POST['resultUUID'];
  global $version;

  $resultData = removeslashes($resultData);

  //INSERT
  $wpdb->insert(
      're_results_user',
      array(
          'result_id' => null,
          'wpuid' => $wpuid,
          'result_uuid' => $uuid,
          'result_desc' => $desc,
          'finish_date' => $finishDate,
          'item_count' => $itemCount,
          'list_category' => $category,
          'result_data' => $resultData,
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
          '%s',
          '%s'
      )
  );

  $newListID = $wpdb->insert_id;
  //send currentlistid back to JS
  echo $newListID;
}

function transferRankingResultsD() {
  global $wpdb;

  $query = "INSERT INTO re_results_d (result_id, bg_id, item_name, item_rank)
  SELECT list_id, bg_id, case when item_name_fixed is null then item_name else item_name_fixed end AS item_name, item_rank 
  FROM `re_final_d`";

  $result = $wpdb->query($query);
}

function transferRankingResultsH() {
  global $wpdb;

  $query = "INSERT INTO re_results_h (result_id, finish_date, item_count, bgg_flag, list_category, re_version)
  SELECT list_id, finish_date, num_of_items, bgg_flag, list_category, \"2.0.0\"
  FROM re_final_h";

  $result = $wpdb->query($query);
}


function removeslashes($string) {
    $string = implode("", explode("\\", $string));
    return stripslashes(trim($string));
  }
  
?>