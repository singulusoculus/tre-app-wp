<?php


// require_once('C:\xampp\apps\wordpress\htdocs\wp-config.php');
require_once('C:\xampp\apps\wordpress\htdocs\wp-load.php');

// require_once($_SERVER['DOCUMENT_ROOT'] . $folder . '/wp-config.php');
// require_once($_SERVER['DOCUMENT_ROOT'] . $folder . '/wp-load.php');

// global $wpdb;
$version = '2.0.0';

$func = $_POST['func'];

switch ($func) {
  case 'getBGGCollection':
    getBGGCollection();
    break;
  case 'deleteUserResultList':
    deleteUserResultList();
    break;
  case 'deleteProgressList':
    deleteProgressList();
    break;
  case 'deleteTemplateList':
    deleteTemplateList();
    break;
  case 'getUserLists':
    getUserLists();
    break;
  case 'getUserResultList':
    getUserResultList();
    break;
  case 'getProgressList':
    getProgressList();
    break;
  case 'getTemplateList':
    getTemplateList();
    break;
  case 'insertResultRanking':
    insertResultRanking();
    break;
  case 'updateResultRanking':
    updateResultRanking();
    break;
  case 'insertResultUser':
    insertResultUser();
    break;
  case 'insertProgressList':
    insertProgressList();
    break;
  case 'updateProgressList':
    updateProgressList();
    break;
  case 'insertTemplateList':
    insertTemplateList();
    break;
  case 'updateTemplateList':
    updateTemplateList();
    break;
  case 'updateRankings':
    updateRankings();
    break;
  default:
    echo 'Could not find the specified function';
}

///////////////////////////////////////
// GET USER BGG COLLECTION
///////////////////////////////////////

function getBGGCollection() {
  echo 'getBGGCollection';
}

///////////////////////////////////////
// DELETE LISTS
///////////////////////////////////////
function deleteUserResultList() {
  global $wpdb;
  $listid = $_POST['resultid'];

  $wpdb->delete('re_results_user', array('result_id' => $listid));
}

function deleteProgressList() {
  global $wpdb;
  $listid = $_POST['progressid'];

  $wpdb->delete( 're_rank_progress', array('progress_id' => $listid ));
}

function deleteTemplateList() {
  global $wpdb;
  $listid = $_POST['templateid'];

  $wpdb->delete( 're_list_templates', array('template_id' => $listid ));
}

///////////////////////////////////////
// RETRIEVE LIST DATA
///////////////////////////////////////

function getResultList() {
  global $wpdb;
  $listid = $_POST['listId'];
    
  $results = $wpdb->get_results("SELECT item_rank, item_name FROM re_results_d WHERE result_id = $listid", ARRAY_A );

  $results_json = json_encode($results);

  echo $results_json;
}

function getUserLists() {
  global $wpdb;
  $wpuid = $_POST['wpuid'];
    
  $progressLists = $wpdb->get_results( "SELECT progress_id, save_date, item_count, percent_complete, progress_desc FROM re_rank_progress WHERE wpuid = $wpuid ORDER BY progress_id DESC", ARRAY_A );

  $resultLists = $wpdb->get_results("SELECT result_id, finish_date, item_count, result_desc FROM re_results_user WHERE wpuid = $wpuid ORDER BY result_id DESC" , ARRAY_A );

  $templateLists = $wpdb->get_results("SELECT template_id, created_date, updated_date, item_count, template_desc FROM re_list_templates WHERE wpuid = $wpuid ORDER BY template_id DESC" , ARRAY_A );

  // push list data in to array
  $userLists = array();
  array_push($userLists, $templateLists, $progressLists, $resultLists );

  // send it in json
  $lists_json = json_encode($userLists);
  print_r($lists_json);
}

function getUserResultList() {
  global $wpdb;
  $resultid = $_POST['resultid'];
    
  $results = $wpdb->get_results( "SELECT result_data, list_category, result_desc FROM re_results_user WHERE result_id = $resultid", ARRAY_A );

  $results_json = json_encode($results);

  echo $results_json;
}

function getProgressList() {
  global $wpdb;
  $progressid = $_POST['progressid'];
    
  $results = $wpdb->get_results( "SELECT progress_data, list_category, progress_desc FROM re_rank_progress WHERE progress_id = $progressid", ARRAY_A );

  $results_json = json_encode($results);

  echo $results_json;
}

function getTemplateList() {
  global $wpdb;
  $templateid = $_POST['templateid'];
    
  $results = $wpdb->get_results( "SELECT template_data, list_category, template_desc FROM re_list_templates WHERE template_id = $templateid", ARRAY_A );

  $results_json = json_encode($results);

  echo $results_json;
}

///////////////////////////////////////
// SAVE/UPDATE LIST DATA
///////////////////////////////////////

function insertResultUser() {
  global $wpdb;
  $currentProgressID = $_POST['currentProgressID'];
  $saveData = $_POST['resultData'];
  $desc = $_POST['desc'];
  $itemCount = $_POST['itemCount'];
  $category = $_POST['category'];
  $wpuid = $_POST['wpuid'];
  $currDate = date("Y-m-d");
  global $version;

  $saveData = removeslashes($saveData);

  //sanitize description
  $desc = sanitize_text_field($desc);

  //delete progress list if exists
  if ($currentProgressID > 0) {
      // DELETE currentlistid from re_progress
      $wpdb->delete( 're_rank_progress', array( 'progress_id' => $currentProgressID ) );
  }

  // insert new list into re_results_user
    //INSERT
  $wpdb->insert(
    're_results_user',
    array(
        'result_id' => null,
        'wpuid' => $wpuid,
        'result_desc' => $desc,
        'finish_date' => $currDate,
        'item_count' => $itemCount,
        'list_category' => $category,
        'result_data' => $saveData,
        're_version' => $version
    ),
    array(
        '%d',
        '%d',
        '%s',
        '%s',
        '%d',
        '%d',
        '%s',
        '%s'
    )
  );

  $savelistid = $wpdb->insert_id;
  echo $savelistid;
}

function insertResultRanking() {
  global $wpdb;
  $finalList = $_POST['rankedItems'];
  $itemCount = $_POST['itemCount'];
  $bggFlag = $_POST['bggFlag'];
  $templateID = $_POST['templateID'];
  $currdate = date("Y-m-d");
  $listCategory = $_POST['category'];
  global $version;

  //INSERT data into re_final_h
  $wpdb->insert(
      're_results_h',
      array(
          'result_id' => null,
          'finish_date' => $currdate,
          'item_count' => $itemCount,
          'bgg_flag' => $bggFlag,
          'list_category' => $listCategory,
          're_version' => $version
      ),
      array(
          '%d',
          '%s',
          '%d',
          '%d',
          '%d',
          '%s'
      )
  );

  $savelistid = $wpdb->insert_id;

  //INSERT finalList rows into re_result_d
  foreach ($finalList as $key => $value) {

      $itemname = stripslashes($value);

      $wpdb->insert(
          're_results_d',
          array(
              'result_id' => $savelistid,
              'item_name' => $itemname,
              'item_rank' => $key+1
          ),
          array(
              '%d',
              '%s',
              '%d'
          )
      );
  }

  echo $savelistid;

}

function updateResultRanking() {
  global $wpdb;
  $rankedItems = $_POST['rankedItems'];
  $resultId = $_POST['resultId'];

  foreach ($rankedItems as $key => $value) {
    $wpdb->update(
      're_results_d',
      array('item_name' => $value),
      array(
        'result_id' => $resultId,
        'item_rank' => $key+1
      ),
      array('%s'),
      array(
        '%d',
        '%d'
      )
    );
  }
}

function insertProgressList() {
  global $wpdb;
  $savedata = $_POST['rankData'];
  $desc = $_POST['saveDesc'];
  $numitems = $_POST['itemCount'];
  $percent = $_POST['percent'];
  $wpuid = $_POST['wpuid'];
  $currdate = date("Y-m-d");
  $category = $_POST['category'];
  global $version;

  $savedata = removeslashes($savedata);

  //sanitize description
  $desc = sanitize_text_field($desc);

  //INSERT
  $wpdb->insert(
      're_rank_progress',
      array(
          'progress_id' => null,
          'wpuid' => $wpuid,
          'progress_desc' => $desc,
          'created_date' => $currdate,
          'save_date' => $currdate,
          'item_count' => $numitems,
          'percent_complete' => $percent,
          'list_category' => $category,
          'progress_data' => $savedata,
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

  $currentlistid = $wpdb->insert_id;
  //send currentlistid back to JS
  echo $currentlistid;
}

function updateProgressList() {
  global $wpdb;
  $currentlistid = $_POST['currentProgressID'];
  $savedata = $_POST['rankData'];
  $desc = $_POST['saveDesc'];
  $numitems = $_POST['itemCount'];
  $percent = $_POST['percent'];
  $currdate = date("Y-m-d");
  global $version;

  $savedata = removeslashes($savedata);

  //sanitize description
  $desc = sanitize_text_field($desc);

  $wpdb->update(
    're_rank_progress',
    array(
      'progress_desc' => $desc,
      'save_date' => $currdate,
      'item_count' => $numitems,
      'percent_complete' => $percent,
      'progress_data' => $savedata,
      're_version' => $version
    ), 
    array('progress_id' => $currentlistid),
    array(
        '%s',
        '%s',
        '%d',
        '%d',
        '%s',
        '%s'
    ),
    array( '%d' )
  );
  echo $currentlistid;
}

function insertTemplateList() {
  global $wpdb;
  $templateData = $_POST['listData'];
  $desc = $_POST['saveDesc'];
  $numItems = $_POST['itemCount'];
  $wpuid = $_POST['wpuid'];
  $category = $_POST['category'];
  $currentDate = date("Y-m-d");
  global $version;

  $templateData = removeslashes($templateData);

  //sanitize description
  $desc = sanitize_text_field($desc);

  //INSERT
  $wpdb->insert(
    're_list_templates',
    array(
        'template_id' => null,
        'wpuid' => $wpuid,
        'template_desc' => $desc,
        'created_date' => $currentDate,
        'updated_date' => $currentDate,
        'item_count' => $numItems,
        'list_category' => $category,
        'template_data' => $templateData,
        're_version' => $version
    ),
    array(
        '%d',
        '%d',
        '%s',
        '%s',
        '%d',
        '%d',
        '%s',
        '%s',
        '%s'
    )
  );

  $currentTemplateId = $wpdb->insert_id;
  echo $currentTemplateId;
}

function updateTemplateList() {
  global $wpdb;
  $currentTemplateId = $_POST['currentTemplateID'];
  $templateData = $_POST['listData'];
  $desc = $_POST['saveDesc'];
  $numItems = $_POST['itemCount'];
  $wpuid = $_POST['wpuid'];
  $currentDate = date("Y-m-d");
  global $version;

  $templateData = removeslashes($templateData);

  //sanitize description
  $desc = sanitize_text_field($desc);

  //UPDATE currentlistid row
  $wpdb->update(
    're_list_templates',
    array(
        'template_desc' => $desc,
        'updated_date' => $currentDate,
        'item_count' => $numItems,
        'template_data' => $templateData,
        're_version' => $version
    ), 
    array('template_id' => $currentTemplateId),
    array(
        '%s',
        '%s',
        '%d',
        '%s',
        '%s'
    ),
    array( '%d' )
  );
  echo $currentTemplateId;
}

///////////////////////////////////////
// UPDATE RANKINGS
///////////////////////////////////////

function updateRankings() {
  global $wpdb;
  $listid = $_POST['listId'];

  $query = "CALL `update_re_boardgames_on_list_completion`(".$listid.");";
  $result = $wpdb->query($query);
  echo $query;
}


function removeslashes($string) {
  $string = implode("", explode("\\", $string));
  return stripslashes(trim($string));
}

?>