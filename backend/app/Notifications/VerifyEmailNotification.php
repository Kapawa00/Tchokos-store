<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

/**
 * Notification de vérification d'e-mail en français, à la charte Tchokos.
 * Surcharge la notification Laravel par défaut pour personnaliser le texte
 * et pointer le lien de vérification vers l'API backend (qui redirige ensuite
 * vers le frontend avec le statut de vérification).
 */
class VerifyEmailNotification extends BaseVerifyEmail
{
    protected function buildMailMessage($url): MailMessage
    {
        return (new MailMessage)
            ->subject('Tchokos SARL — Confirmez votre adresse e-mail')
            ->greeting('Bonjour !')
            ->line('Merci de vous être inscrit(e) sur **Tchokos SARL**.')
            ->line('Cliquez sur le bouton ci-dessous pour confirmer votre adresse e-mail et activer votre compte.')
            ->action('Confirmer mon adresse e-mail', $url)
            ->line('Ce lien expirera dans **60 minutes**.')
            ->line('Si vous n\'avez pas créé de compte sur Tchokos SARL, ignorez simplement cet e-mail.')
            ->salutation('L\'équipe Tchokos SARL — « C\'est difficile, mais possible »');
    }

    protected function verificationUrl($notifiable): string
    {
        // Le lien signé pointe vers le backend (/api/email/verify/...).
        // Après vérification réussie, le contrôleur redirige vers le frontend.
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id'   => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );
    }
}
