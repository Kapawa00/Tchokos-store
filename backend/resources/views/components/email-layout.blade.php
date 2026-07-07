{{--
    Gabarit e-mail commun, charte « Cuir & Crème ». Styles en ligne
    (obligatoire pour la compatibilité des clients de messagerie).
--}}
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Tchokos SARL' }}</title>
</head>
<body style="margin:0; padding:0; background-color:#F6F1E9; font-family:Helvetica,Arial,sans-serif; color:#2A211B;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F6F1E9; padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#FCFAF6; border-radius:6px; overflow:hidden;">
                    <tr>
                        <td style="background-color:#2A211B; padding:20px 32px;">
                            <span style="font-size:18px; color:#F6F1E9; font-weight:bold; letter-spacing:0.5px;">TCHOKOS SARL</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            {{ $slot }}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 32px; border-top:1px solid #E5DCCD;">
                            <p style="margin:0; font-size:12px; color:#6E6258;">
                                Tchokos SARL — Akwa, Douala.<br>
                                « C'est difficile, mais possible ».
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
