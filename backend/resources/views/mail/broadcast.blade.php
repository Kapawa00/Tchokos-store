@component('mail::message')
{{ $bodyText }}

@isset($linkUrl)
@component('mail::button', ['url' => $linkUrl])
Découvrir
@endcomponent
@endisset

Merci,<br>
**Tchokos SARL** — C'est difficile, mais possible.
@endcomponent
