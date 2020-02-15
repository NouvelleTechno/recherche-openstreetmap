<?php
// On autorise Ajax
header('Access-Control-Allow-Origin: *');

// On vérifie qu'on utilise la méthode GET
if($_SERVER['REQUEST_METHOD'] == 'GET'){
    // On se connecte à la BDD
    require_once('connect.php');

    $sql = 'SELECT id, nom, lat, lon, ( 6371 * acos( cos( radians(:lat) ) * cos( radians( lat ) ) * cos( radians( lon ) - radians(:lon) ) + sin( radians(:lat) ) * sin( radians( lat ) ) ) ) AS distance FROM `agences` HAVING distance < :distance ORDER BY distance';

    $query = $db->prepare($sql);

    $query->bindValue(':lat', $_GET['lat'], PDO::PARAM_STR);    
    $query->bindValue(':lon', $_GET['lon'], PDO::PARAM_STR);
    $query->bindValue(':distance', $_GET['distance'], PDO::PARAM_INT);    
    $query->execute();

    $result = $query->fetchAll();

    http_response_code(200);

    echo json_encode($result);
    
    require_once('close.php');

}else{
    http_response_code(405);
    echo 'Méthode non autorisée';
}