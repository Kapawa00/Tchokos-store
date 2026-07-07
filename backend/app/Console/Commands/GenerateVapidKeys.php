<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Minishlink\WebPush\VAPID;

class GenerateVapidKeys extends Command
{
    protected $signature = 'webpush:vapid-keys';

    protected $description = 'Génère une paire de clés VAPID pour les notifications Web Push';

    public function handle(): int
    {
        $keys = VAPID::createVapidKeys();

        $this->info('Clés VAPID générées :');
        $this->newLine();
        $this->line("VAPID_PUBLIC_KEY={$keys['publicKey']}");
        $this->line("VAPID_PRIVATE_KEY={$keys['privateKey']}");
        $this->newLine();
        $this->comment('Copiez ces deux lignes dans le fichier .env (ne committez jamais la clé privée).');
        $this->comment('La clé publique (VAPID_PUBLIC_KEY) peut être exposée au frontend sans risque.');

        return self::SUCCESS;
    }
}
