<x-email-layout :title="'Commande livrée — '.$order->reference">
    <h1 style="font-family:Georgia,serif; font-size:21px; color:#2A211B; margin:0 0 16px;">Commande livrée !</h1>

    <p style="font-size:14px; line-height:1.6; margin:0 0 12px;">Bonjour {{ $order->customer_name }},</p>
    <p style="font-size:14px; line-height:1.6; margin:0 0 16px;">
        Votre commande <strong>{{ $order->reference }}</strong> a bien été livrée. Nous espérons qu'elle vous plaît !
    </p>

    <p style="margin:0 0 16px;">
        <span style="display:inline-block; background-color:#5B6B57; color:#FCFAF6; font-size:12px; font-weight:bold; padding:6px 12px; border-radius:4px;">
            LIVRÉE
        </span>
    </p>

    @include('emails.orders._summary')

    <p style="font-size:13px; color:#6E6258; margin-top:24px;">
        Merci d'avoir choisi Tchokos SARL. À très bientôt !
    </p>
</x-email-layout>
