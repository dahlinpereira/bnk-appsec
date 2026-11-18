<?php
/**
 * Bunker AppSec — processamento do formulário de contato.
 * Recebe os campos Nome, E-mail, Assunto e Conteúdo e envia
 * a mensagem para o e-mail do Scrum Master.
 */

session_start();

// Destinatário: Scrum Master da Bunker AppSec
$destinatario = 'dahlinsantos@gmail.com';

function limpar($valor) {
    return trim(stripslashes(htmlspecialchars($valor, ENT_QUOTES, 'UTF-8')));
}

$nome     = isset($_POST['nome'])     ? limpar($_POST['nome'])     : '';
$email    = isset($_POST['email'])    ? limpar($_POST['email'])    : '';
$assunto  = isset($_POST['assunto'])  ? limpar($_POST['assunto'])  : '';
$conteudo = isset($_POST['conteudo']) ? limpar($_POST['conteudo']) : '';

// Validação simples
if ($nome === '' || $email === '' || $assunto === '' || $conteudo === '') {
    header('Location: contato.html?status=erro');
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: contato.html?status=erro');
    exit;
}

// Monta a mensagem
$mensagem  = "Mensagem enviada pelo formulário do site Bunker AppSec.\n\n";
$mensagem .= "Nome: $nome\n";
$mensagem .= "E-mail: $email\n";
$mensagem .= "Assunto: $assunto\n\n";
$mensagem .= "Conteúdo:\n$conteudo\n";

// Cabeçalhos com codificação UTF-8
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/plain; charset=UTF-8\r\n";
$headers .= "From: Bunker AppSec <nao-responder@bunker.simplifica.gru.br>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

$enviado = mail($destinatario, 'Contato site Bunker AppSec: ' . $assunto, $mensagem, $headers);

if ($enviado) {
    header('Location: contato.html?status=ok');
} else {
    header('Location: contato.html?status=erro');
}
exit;
