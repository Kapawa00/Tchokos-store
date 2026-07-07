{{-- Récapitulatif des articles + totaux, partagé par les e-mails de commande. --}}
<table role="presentation" width="100%" style="border-collapse:collapse; margin:16px 0;">
    @foreach ($order->items as $item)
        <tr style="border-bottom:1px solid #E5DCCD;">
            <td style="padding:8px 0; font-size:13px; color:#2A211B;">
                {{ $item->product_name }}
                @if ($item->variant_label)
                    <span style="color:#6E6258;">({{ $item->variant_label }})</span>
                @endif
                &times; {{ $item->quantity }}
            </td>
            <td style="padding:8px 0; font-size:13px; color:#2A211B; text-align:right; white-space:nowrap;">
                {{ number_format($item->unit_price * $item->quantity, 0, ',', ' ') }} FCFA
            </td>
        </tr>
    @endforeach
</table>

<table role="presentation" width="100%" style="margin-top:8px;">
    <tr>
        <td style="font-size:13px; color:#6E6258; padding:2px 0;">Sous-total</td>
        <td style="font-size:13px; color:#6E6258; text-align:right; padding:2px 0;">{{ number_format($order->subtotal, 0, ',', ' ') }} FCFA</td>
    </tr>
    <tr>
        <td style="font-size:13px; color:#6E6258; padding:2px 0;">Livraison</td>
        <td style="font-size:13px; color:#6E6258; text-align:right; padding:2px 0;">{{ number_format($order->shipping_fee, 0, ',', ' ') }} FCFA</td>
    </tr>
    <tr>
        <td style="font-size:14px; font-weight:bold; color:#2A211B; padding-top:8px;">Total</td>
        <td style="font-size:14px; font-weight:bold; color:#2A211B; text-align:right; padding-top:8px;">{{ number_format($order->total, 0, ',', ' ') }} FCFA</td>
    </tr>
</table>
