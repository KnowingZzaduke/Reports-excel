<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
require("db/MysqliDb.php");
if (isset($_POST["action"]) || isset($_GET["action"])) {
    switch ($_GET["action"]) {
        case "savedata":
            $numero = $_POST["numero"];

            // Realizar una consulta para verificar si ya existe un registro con el mismo número
            $existingData = $db->where("numero", $numero)->getOne("datos_formulario");

            if ($existingData) {
                // Si se encuentra un registro existente con el mismo número, mostrar un mensaje de error
                echo json_encode(["salida" => "Error!", "mensaje" => "El número ya existe en la base de datos."]);
            } else {
                $cliente = $_POST["cliente"];
                $tiempoActual = $_POST["tiempoActual"];
                $fecha = $_POST["fecha"];
                $saldo = $_POST["saldo"];
                $diasVencidos = $_POST["diasVencidos"];
                $comentario = $_POST["comentario"];

                $fechaParseada = date("Y-m-d", strtotime(str_replace("/", "-", $fecha)));
                $data = array(
                    "cliente" => $cliente,
                    "fecha_hora-actual" => $tiempoActual,
                    "numero" => $numero,
                    "fecha" => $fechaParseada,
                    "saldo" => $saldo,
                    "dias_vencidos" => $diasVencidos,
                    "comentario" => $comentario
                );

                if ($db->insert("datos_formulario", $data)) {
                    echo json_encode(["salida" => "Éxito", "mensaje" => "Los datos fueron enviados y guardados correctamente."]);
                } else {
                    echo json_encode(["salida" => "Error!", "mensaje" => "No se pudo insertar los datos en la base de datos"]);
                }
            }
            break;
        case "loaddata":
            $mysqli = new mysqli("localhost", "root", "", "dysam_controlled-calls");

            if ($mysqli->connect_error) {
                echo json_encode(["salida" => "error", "data" => "Error de conexión a la base de datos: " . $mysqli->connect_error]);
            } else {
                $sql = "SELECT * FROM datos_formulario";
                $result = $mysqli->query($sql);
                if ($result) {
                    $data = array();
                    while ($row = $result->fetch_assoc()) {
                        $data[] = $row;
                    }
                    if (empty($data)) {
                        echo json_encode(["salida" => "exito", "data" => "No se encontraron registros en la tabla datos_formularios"]);
                    } else {
                        header('Content-Type: application/json');
                        echo json_encode(["salida" => "exito", "data" => $data]);
                    }
                } else {
                    echo json_encode(["salida" => "error", "data" => "Error en la consulta SQL: " . $mysqli->error]);
                }
                $mysqli->close();
            }
            break;
    }
    exit;
}

exit;
