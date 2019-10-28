<?php


// require_once('C:\xampp\apps\wordpress\htdocs\wp-config.php');
// require_once('C:\xampp\apps\wordpress\htdocs\wp-load.php');

require_once('../../../../wp-load.php');

// require_once($_SERVER['DOCUMENT_ROOT'] . $folder . '/wp-config.php');
// require_once($_SERVER['DOCUMENT_ROOT'] . $folder . '/wp-load.php');

// global $wpdb;
// $version = '2.0.2';
$version = getRankingEngineVersion();

$func = $_POST['func'];

switch ($func) {
  case 'getBGGCollection':
    getBGGCollection();
    break;
  case 'getBGGPlayed':
    getBGGPlayed();
    break;
  case 'getYearTopTen':
    getYearTopTen();
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
  case 'getSharedList':
    getSharedList();
    break;
  case 'setShareFlag':
    setShareFlag();
    break;
  case 'getWPUserID':
    getWPUserID();
    break;
  case 'captureBGGData':
    captureBGGData();
    break;
  default:
    echo 'Could not find the specified function';
}

function getWPUserID() {
  echo get_current_user_id();
}

///////////////////////////////////////
// GET USER BGG COLLECTION
///////////////////////////////////////

function getBGGCollection() {
  $bggUsername = $_POST['bggUsername'];
  $expansions = $_POST['expansions'];


  $url = 'https://www.boardgamegeek.com/xmlapi2/collection?username='.$bggUsername.'&stats=1';

  //filter out expansions if checked
  if ($expansions === '0') {
    $url = $url.'&excludesubtype=boardgameexpansion';
  }

  $tries = 1;

  do {
    $headers = get_headers($url, 1);
    $statusCode = substr($headers[0], 9, 3);

    if ($statusCode == 200) {
      $xml = simplexml_load_file($url);

      if ($xml->error->message == "Invalid username specified"){
        echo 1;
      } else {
        $xmlContents = file_get_contents($url);
        print_r($xmlContents);
      }
 
    } else {
      $tries++;
      sleep(9);
    }

    if ($tries == 3) {
      echo 2;
    }

  } while ($statusCode == '202' && $tries < 4);
}

function getBGGPlayed() {
  $bggUsername = $_POST['bggUsername'];
  $expansions = $_POST['expansions'];


  $url = 'https://www.boardgamegeek.com/xmlapi2/collection?username='.$bggUsername.'&stats=1&played=1';

  //filter out expansions if checked
  if ($expansions === '0') {
    $url = $url.'&excludesubtype=boardgameexpansion';
  }

  $tries = 1;

  do {
    $headers = get_headers($url, 1);
    $statusCode = substr($headers[0], 9, 3);

    if ($statusCode == 200) {
      $xml = simplexml_load_file($url);

      if ($xml->error->message == "Invalid username specified"){
        echo 1;
      } else {
        $xmlContents = file_get_contents($url);
        print_r($xmlContents);
      }
 
    } else {
      $tries++;
      sleep(9);
    }

    if ($tries == 3) {
      echo 2;
    }

  } while ($statusCode == '202' && $tries < 4);
}

function getYearTopTen() {
  global $wpdb;

  $results = $wpdb->get_results ("SELECT cy_rank AS rank
  , bg_name
  FROM wp_re_boardgames 
  WHERE cy_rank <> 0
  ORDER BY cy_rank ASC
  LIMIT 10", ARRAY_A );

  $results_json = json_encode($results);

  echo $results_json;

}

function captureBGGData() {
  global $wpdb;

  $dataSlashed = $_POST['data'];

  $dataDeSlashed = stripslashes($dataSlashed);

  $data = json_decode($dataDeSlashed, true);

  foreach ($data as $key => $value) {
    $bggId = $value['bggId'];
    $name = stripslashes($value['name']);
    $yearPublished = $value['yearPublished'];
    $now = date("Y-m-d H:i:s");
    $type = $value['type'];

    $sql = 
    "INSERT INTO wp_re_boardgames (bgg_id, bg_name, bgg_year_published, crtd_datetime, bg_type) 
    VALUES (%d, %s, %d, %s, %s, %d) 
    ON DUPLICATE KEY UPDATE 
    bg_name = %s,
    bgg_year_published = %d,
    lupd_datetime = %s,
    bg_type = %s";

    $prepedsql = $wpdb->prepare($sql, $bggId, $name, $yearPublished, $now, $type, $name, $yearPublished, $now, $type);
    $wpdb->query($prepedsql);
  }

}


///////////////////////////////////////
// DELETE LISTS
///////////////////////////////////////
function deleteUserResultList() {
  global $wpdb;
  $listid = $_POST['resultid'];

  $wpdb->delete('wp_re_results_user', array('result_id' => $listid));
}

function deleteProgressList() {
  global $wpdb;
  $listid = $_POST['progressid'];

  $wpdb->delete( 'wp_re_rank_progress', array('progress_id' => $listid ));
}

function deleteTemplateList() {
  global $wpdb;
  $listid = $_POST['templateid'];

  $wpdb->delete( 'wp_re_list_templates', array('template_id' => $listid ));
}

///////////////////////////////////////
// RETRIEVE LIST DATA
///////////////////////////////////////

function getResultList() {
  global $wpdb;
  $listid = $_POST['listId'];
    
  $results = $wpdb->get_results("SELECT item_rank, item_name FROM wp_re_results_d WHERE result_id = $listid", ARRAY_A );

  $results_json = json_encode($results);

  echo $results_json;
}

function getUserLists() {
  global $wpdb;
  $wpuid = $_POST['wpuid'];
    
  $progressLists = $wpdb->get_results( "SELECT progress_id, save_date, item_count, percent_complete, progress_desc FROM wp_re_rank_progress WHERE wpuid = $wpuid ORDER BY progress_id DESC", ARRAY_A );

  $resultLists = $wpdb->get_results("SELECT result_id, finish_date, item_count, result_desc FROM wp_re_results_user WHERE wpuid = $wpuid ORDER BY result_id DESC" , ARRAY_A );

  $templateLists = $wpdb->get_results("SELECT template_id, created_date, updated_date, item_count, template_desc FROM wp_re_list_templates WHERE wpuid = $wpuid ORDER BY template_id DESC" , ARRAY_A );

  $progressIds = $wpdb->get_results( "SELECT progress_id AS id, progress_uuid AS uuid, progress_desc AS descr FROM wp_re_rank_progress WHERE wpuid = $wpuid ORDER BY progress_id DESC", ARRAY_A );
  $resultIds = $wpdb->get_results("SELECT result_id AS id, result_uuid AS uuid, result_desc AS descr FROM wp_re_results_user WHERE wpuid = $wpuid ORDER BY result_id DESC" , ARRAY_A );
  $templateIds =  $wpdb->get_results("SELECT template_id AS id, template_uuid AS uuid, template_desc AS descr, shared, ranked, template_data AS templateData FROM wp_re_list_templates WHERE wpuid = $wpuid ORDER BY template_id DESC" , ARRAY_A );
  

  // push list data in to array
  $userLists = array();
  array_push($userLists, $templateLists, $progressLists, $resultLists, $templateIds, $progressIds, $resultIds);

  // send it in json
  $lists_json = json_encode($userLists);
  print_r($lists_json);
}

function getUserResultList() {
  global $wpdb;
  $resultid = $_POST['resultid'];
    
  $results = $wpdb->get_results( "SELECT result_data, list_category, result_desc FROM wp_re_results_user WHERE result_id = $resultid", ARRAY_A );

  $results_json = json_encode($results);

  echo $results_json;
}

function getProgressList() {
  global $wpdb;
  $progressid = $_POST['progressid'];
    
  $results = $wpdb->get_results( "SELECT progress_data, list_category, progress_desc, parent_list_id FROM wp_re_rank_progress WHERE progress_id = $progressid", ARRAY_A );

  $results_json = json_encode($results);

  echo $results_json;
}

function getTemplateList() {
  global $wpdb;
  $templateid = $_POST['templateid'];
    
  $results = $wpdb->get_results( "SELECT template_data, list_category, template_desc FROM wp_re_list_templates WHERE template_id = $templateid", ARRAY_A );

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
  $uuid = $_POST['uuid'];
  global $version;

  $saveData = removeslashes($saveData);

  //sanitize description
  $desc = sanitize_text_field($desc);

  //delete progress list if exists
  if ($currentProgressID > 0) {
      // DELETE currentlistid from wp_re_progress
      $wpdb->delete( 'wp_re_rank_progress', array( 'progress_id' => $currentProgressID ) );
  }

  // insert new list into wp_re_results_user
    //INSERT
  $wpdb->insert(
    'wp_re_results_user',
    array(
        'result_id' => null,
        'wpuid' => $wpuid,
        'result_uuid' => $uuid,
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
  $parentList = intval($_POST['parentList']);
  global $version;

  // if parentList > 0 then set the update wp_re_list_tempaltes.ranked = 1
  if ($parentList > 0) {
    $wpdb->update('wp_re_list_templates', // Table to update
    array('ranked' => 1), // Update field
    array('template_id' => $parentList), // Where parameter
    array( '%d' ), // Update field data type
    array( '%d' ) // Where parameter data type
    );
  }

  //INSERT data into wp_re_final_h
  $wpdb->insert(
      'wp_re_results_h',
      array(
          'result_id' => null,
          'parent_list_id' => $parentList === 0 ? NULL : $parentList,
          'finish_date' => $currdate,
          'item_count' => $itemCount,
          'bgg_flag' => $bggFlag,
          'list_category' => $listCategory,
          're_version' => $version
      ),
      array(
          '%d',
          '%d',
          '%s',
          '%d',
          '%d',
          '%d',
          '%s'
      )
  );

  $savelistid = $wpdb->insert_id;

  //INSERT finalList rows into wp_re_result_d
  foreach ($finalList as $key => $value) {

      $itemname = stripslashes($value['name']);

      $wpdb->insert(
          'wp_re_results_d',
          array(
              'result_id' => $savelistid,
              'item_name' => $itemname,
              'item_rank' => $key+1,
              'bgg_id' => $value['bggid']
          ),
          array(
              '%d',
              '%s',
              '%d',
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
      'wp_re_results_d',
      array('item_name' => $value['name'],
            'bgg_id' => $value['bggid']
          ),
      array(
        'result_id' => $resultId,
        'item_rank' => $key+1
      ),
      array(
        '%s',
        '%d'
        ),
      array(
        '%d',
        '%d'
      )
    );
  }
  echo $resultId;
}

function insertProgressList() {
  global $wpdb;
  $savedata = $_POST['rankData'];
  $desc = $_POST['saveDesc'];
  $numitems = $_POST['itemCount'];
  $percent = $_POST['percent'];
  $wpuid = $_POST['wpuid'];
  $uuid = $_POST['uuid'];
  $currdate = date("Y-m-d");
  $category = $_POST['category'];
  $parentList = $_POST['parentList'];
  global $version;

  $savedata = removeslashes($savedata);

  //sanitize description
  $desc = sanitize_text_field($desc);

  //INSERT
  $wpdb->insert(
      'wp_re_rank_progress',
      array(
          'progress_id' => null,
          'wpuid' => $wpuid,
          'progress_uuid' => $uuid,
          'parent_list_id' => $parentList,
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
    'wp_re_rank_progress',
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
  $uuid = $_POST['uuid'];
  $category = $_POST['category'];
  $currentDate = date("Y-m-d");
  global $version;

  $templateData = removeslashes($templateData);

  //sanitize description
  $desc = sanitize_text_field($desc);

  //INSERT
  $wpdb->insert(
    'wp_re_list_templates',
    array(
        'template_id' => null,
        'wpuid' => $wpuid,
        'template_uuid' => $uuid,
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
        '%s',
        '%s',
        '%d',
        '%d',
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
    'wp_re_list_templates',
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

  $query = "CALL `calc_bg_scores_on_list_completion`(".$listid.");";
  $result = $wpdb->query($query);
  echo $query;
}

///////////////////////////////////////
// SHARED LISTS
///////////////////////////////////////

function getSharedList() {
  global $wpdb;
  $id = $_POST['id'];
  $type = $_POST['type'];

  $str_id = removeslashes($id);

  switch($type) {
    case 'Template':
    $results = $wpdb->get_results( "SELECT template_id, template_data, list_category, template_desc FROM wp_re_list_templates WHERE template_uuid = $str_id AND shared = 1", ARRAY_A );
    $results_json = json_encode($results);
    echo $results_json;
    break;

    case 'Progress':
    $results = $wpdb->get_results( "SELECT progress_id, progress_data, list_category, progress_desc FROM wp_re_rank_progress WHERE progress_uuid = $str_id", ARRAY_A );
    $results_json = json_encode($results);
    echo $results_json;
    break;

    case 'Result':
    $results = $wpdb->get_results( "SELECT result_id, result_data, list_category, result_desc FROM wp_re_results_user WHERE result_uuid = $str_id", ARRAY_A );
    $results_json = json_encode($results);
    echo $results_json;
    break;
  }
}

function setShareFlag() {
  global $wpdb;
  $templateId = $_POST['id'];
  $value = $_POST['value'];

  $wpdb->update('wp_re_list_templates', // Table to update
    array('shared' => $value), // Update field
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