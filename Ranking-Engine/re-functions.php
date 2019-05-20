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
  case 'saveFinalRanking':
    saveFinalList_Rankings();
    break;
  case 'saveFinalMyLists':
    saveFinalList_MyLists();
    break;
  case 'saveProgressList':
    saveProgressList();
    break;
  case 'saveTemplateList':
    saveTemplateList();
    break;
  case 'updateFinalList':
    updateFinalList();
    break;
  case 'updateRankings':
    updateRankings();
    break;
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
    
  $progressLists = $wpdb->get_results( "SELECT list_id, list_desc, save_date, num_of_items, percent_complete FROM re_progress WHERE wpuid = $wpuid ORDER BY list_id DESC", ARRAY_A );

  $finalLists = $wpdb->get_results("SELECT list_id, list_desc, finish_date, num_of_items FROM re_final_h WHERE wpuid = $wpuid ORDER BY list_id DESC" , ARRAY_A );

  $templateLists = $wpdb->get_results("SELECT template_id, template_desc, created_date, updated_date, num_of_items FROM re_templates WHERE wpuid = $wpuid ORDER BY list_id DESC" , ARRAY_A );

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

function saveFinalList_MyLists() {
  $desc = $_POST['desc'];
  $wpuid = $_POST['wpuid'];
  $currentlistid = $_POST['currentlistid'];
  $finallistid = $_POST['finallistid'];

  //delete progress list
  if ($currentlistid > 0) {
      //an in progress list exists
      //DELETE currentlistid from re_progress
      $wpdb->delete( 're_progress', array( 'list_id' => $currentlistid ) );
  }

  //update final list with user id and description
  $wpdb->update(
      're_final_h',
      array(
          'list_desc' => $desc,
          'wpuid' => $wpuid,
      ), 
      array('list_id' => $finallistid),
      array(
          '%s',
          '%d',
      ),
      array( '%d' )
  );
}

function saveFinalList_Rankings() {
  $finalList = $_POST['finalList'];
  $currentlistid = $_POST['currentlistid'];
  $desc = $_POST['desc'];
  $numitems = $_POST['numitems'];
  $currdate = date("Y-m-d");
  $bggflag = $_POST['bggflag'];
  $listcategory = $_POST['listcategory'];

  //sanitize description
  $desc = sanitize_text_field($desc);

  //INSERT data into re_final_h
  $wpdb->insert(
      're_final_h',
      array(
          'list_id' => null,
          'wpuid' => null,
          'list_desc' => null,
          'finish_date' => $currdate,
          'num_of_items' => $numitems,
          'bgg_flag' => $bggflag,
          'static_list_id' => null,
          'list_category' => $listcategory
      ),
      array(
          '%d',
          '%d',
          '%s',
          '%s',
          '%d',
          '%d',
          '%d',
          '%d'
      )
  );

  $savelistid = $wpdb->insert_id;

  //INSERT finalList rows into re_final_d
  foreach ($finalList as $key => $value) {

      $itemname = stripslashes($value);

      $wpdb->insert(
          're_final_d',
          array(
              'list_id' => $savelistid,
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

function saveProgressList() {
  global $wpdb;
  $currentlistid = $_POST['currentProgressID'];
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

  if ($currentlistid === "0") {
      //INSERT
      $wpdb->insert(
          're_user_progress',
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

  } else {
      //UPDATE currentlistid row
      $wpdb->update(
          're_user_progress',
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
  }

  //send currentlistid back to JS
  echo $currentlistid;
}

function saveTemplateList() {
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

  if ($currentTemplateId === "0") {
      //INSERT
      $wpdb->insert(
          're_user_templates',
          array(
              'template_id' => null,
              'wpuid' => $wpuid,
              'template_desc' => $desc,
              'created_date' => $currentDate,
              'updated_date' => $currentDate,
              'item_count' => $numItems,
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
              '%s'
          )
      );

      $currentTemplateId = $wpdb->insert_id;

  } else {
      //UPDATE currentlistid row
      $wpdb->update(
          're_user_templates',
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
  }

  //send currentTemplateId back to JS 
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