<?php
require_once('../../../../wp-load.php');

$func = $_POST['func'];

switch ($func) {
  case 'getTemplateListData':
    getTemplateListData();
    break;
}

function getTemplateListData() {
    global $wpdb;
    $id = $_POST['uuid'];
  
    $str_id = removeslashes($id);

    $results = $wpdb->get_results( "SELECT template_id, wpuid, template_uuid, template_desc, shared, results_public FROM wp_re_list_templates WHERE template_uuid = $str_id", ARRAY_A );
    $results_json = json_encode($results);
    echo $results_json;

}


function removeslashes($string) {
    $string = implode("", explode("\\", $string));
    return stripslashes(trim($string));
  }

?>