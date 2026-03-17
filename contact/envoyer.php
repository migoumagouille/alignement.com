<?php
header('Content-Type: application/json');

// Destination
$destinataire = 'admin@alignement.com';

// Récupération et nettoyage des champs
$nom      = str_replace(["\r", "\n"], '', trim($_POST['nom']      ?? ''));
$courriel = str_replace(["\r", "\n"], '', trim($_POST['courriel'] ?? ''));
$message  = htmlspecialchars(trim($_POST['message']  ?? ''));

// Validation de base
if (empty($nom) || empty($courriel) || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'Tous les champs sont requis.']);
    exit;
}

if (!filter_var($courriel, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Adresse courriel invalide.']);
    exit;
}

// Construction du courriel
$sujet = "Message de $nom via Alignement.com";

$corps  = "Nouveau message reçu via le formulaire de contact\n";
$corps .= "================================================\n\n";
$corps .= "Nom     : $nom\n";
$corps .= "Courriel: $courriel\n\n";
$corps .= "Message :\n$message\n";

$entetes  = "From: noreply@alignement.com\r\n";
$entetes .= "Reply-To: $courriel\r\n";
$entetes .= "X-Mailer: PHP/" . phpversion();

// Envoi
$envoye = mail($destinataire, $sujet, $corps, $entetes);

if ($envoye) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'envoi.']);
}
?>
