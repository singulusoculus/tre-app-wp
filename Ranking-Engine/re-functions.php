<?php


require_once('C:\xampp\apps\wordpress\htdocs\wp-config.php');
require_once('C:\xampp\apps\wordpress\htdocs\wp-load.php');

// require_once($_SERVER['DOCUMENT_ROOT'] . $folder . '/wp-config.php');
// require_once($_SERVER['DOCUMENT_ROOT'] . $folder . '/wp-load.php');

// global $wpdb;

$func = $_POST['func'];

switch ($func) {
  case 'getBGGCollection':
    getBGGCollection();
    break;
  case 'deleteFinalList':
    deleteFinalList();
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
  case 'getFinalList':
    getFinalList();
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
function deleteFinalList() {
  $listid = $_POST['listid'];

  $wpdb->update(
      're_final_h',
      array(
          'wpuid' => null,
      ), 
      array('list_id' => $listid),
      array(
          '%d',
      ),
      array( '%d' )
  );
}

function deleteProgressList() {
  $listid = $_POST['listid'];

  $wpdb->delete( 're_progress', array( 'list_id' => $listid ) );
}

function deleteTemplateList() {
  $listid = $_POST['listid'];

  $wpdb->delete( 're_templates', array( 'list_id' => $listid ) );
}

///////////////////////////////////////
// RETRIEVE LIST DATA
///////////////////////////////////////

function getUserLists() {
  $wpuid = $_POST['wpuid'];
    
  $progressLists = $wpdb->get_results( "SELECT list_id, list_desc, save_date, num_of_items, percent_complete FROM re_rank_progress WHERE wpuid = $wpuid ORDER BY list_id DESC", ARRAY_A );

  $finalLists = $wpdb->get_results("SELECT list_id, list_desc, finish_date, num_of_items FROM re_user_results WHERE wpuid = $wpuid ORDER BY list_id DESC" , ARRAY_A );

  $templateLists = $wpdb->get_results("SELECT template_id, template_desc, created_date, updated_date, num_of_items FROM re_list_templates WHERE wpuid = $wpuid ORDER BY list_id DESC" , ARRAY_A );

  // push list data in to array
  $userlists = array();
  array_push($userLists, $progressLists, $finalLists, $templateLists);

  // send it in json
  $lists_json = json_encode($userLists);
  print_r($lists_json);
}

function getFinalList() {
  $listid = $_POST['listid'];
    
  $results = $wpdb->get_results("SELECT item_rank, item_name FROM re_final_d WHERE list_id = $listid", ARRAY_A );

  $results_json = json_encode($results);

  echo $results_json;
}

function getProgressList() {
  $listid = $_POST['listid'];
    
  $results = $wpdb->get_results( "SELECT save_data, re_version FROM re_progress WHERE list_id = $listid", ARRAY_A );

  $results_json = json_encode($results);

  echo $results_json;
}

function getTemplateList() {
  $templateid = $_POST['templateid'];
    
  $results = $wpdb->get_results( "SELECT template_data FROM re_template WHERE template_id = $templateid", ARRAY_A );

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
  $version = '2.0.0';

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
  $version = '2.0.0';

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

}

function insertProgressList() {
  global $wpdb;
  $savedata = $_POST['rankData'];
  $desc = $_POST['saveDesc'];
  $numitems = $_POST['itemCount'];
  $percent = $_POST['percent'];
  $wpuid = $_POST['wpuid'];
  $currdate = date("Y-m-d");
  $version = '2.0.0';

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
  $version = '2.0.0';

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
  $version = '2.0.0';

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
  $version = '2.0.0';

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

function updateFinalList() {
  echo 'updateFinalList';
}

///////////////////////////////////////
// UPDATE RANKINGS
///////////////////////////////////////

function updateRankings() {
  $listid = $_POST['listid'];

  $query = "CALL `update_re_boardgames_on_list_completion`(".$listid.");";
  $result = $wpdb->query($query);
  echo $query;
}


function removeslashes($string) {
  $string = implode("", explode("\\", $string));
  return stripslashes(trim($string));
}

?>