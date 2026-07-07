<x-email-layout :title="'Commande '.$order->reference.' confirmée'">
    <h1 style="font-family:Georgia,serif; font-size:21px; color:#2A211B; margin:0 0 16px;">Merci pour votre commande !</h1>

    <p style="font-size:14px; line-height:1.6; margin:0 0 12px;">Bonjour {{ $order->customer_name }},</p>
    <p style="font-size:14px; line-height:1.6; margin:0 0 16px;">
        Nous avons bien reçu votre commande <strong>{{ $order->reference }}</strong>. En voici le récapitulatif :
    </p>

    @include('emails.orders._summary')

    <p style="font-size:13px; color:#6E6258; margin-top:24px; margin-bottom:0;">
        Statut actuel :
        <strong style="color:#9C6B3F;">{{ $order->status->label() }}</strong>
    </p>
    <p style="font-size:13px; color:#6E6258; margin-top:4px;">
        Nous vous tiendrons informé(e) par e-mail à chaque étape de la préparation de votre commande.
    </p>
</x-email-layout>
