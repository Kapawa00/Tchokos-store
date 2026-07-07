<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * E-mail générique d'information (promo, nouveauté) envoyé à un segment de
 * clients depuis le back-office. Mis en file d'attente (queue).
 */
class BroadcastMail extends Mailable implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $subjectLine,
        public string $bodyText,
        public ?string $linkUrl = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->subjectLine);
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.broadcast',
            with: [
                'bodyText' => $this->bodyText,
                'linkUrl' => $this->linkUrl,
            ],
        );
    }
}
