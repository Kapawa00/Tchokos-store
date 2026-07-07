<x-email-layout :title="'Commande expédiée — '.$order->reference">
    <h1 style="font-family:Georgia,serif; font-size:21px; color:#2A211B; margin:0 0 16px;">Votre commande est en route</h1>

    <p style="font-size:14px; line-height:1.6; margin:0 0 12px;">Bonjour {{ $order->customer_name }},</p>
    <p style="font-size:14px; line-height:1.6; margin:0 0 16px;">
        Bonne nouvelle : votre commande <strong>{{ $order->reference }}</strong> vient d'être expédiée.
    </p>

    <p style="margin:0 0 16px;">
        <span style="display:inline-block; background-color:#9C6B3F; color:#FCFAF6; font-size:12px; font-weight:bold; padding:6px 12px; border-radius:4px;">
            EXPÉDIÉE
        </span>
    </p>

    @include('emails.orders._summary')

    <p style="font-size:13px; color:#6E6258; margin-top:24px;">
        Vous serez notifié(e) dès qu'elle sera livrée.
    </p>
</x-email-layout>
