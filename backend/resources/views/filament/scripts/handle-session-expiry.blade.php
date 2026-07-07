{{--
    Remplace le comportement par défaut de Livewire face à une session/jeton
    CSRF expiré : au lieu de sa boîte de dialogue « This page has expired.
    Would you like to refresh the page? » (déclenchée par n'importe quelle
    requête Livewire — y compris en tâche de fond, pas seulement le
    formulaire de déconnexion — recevant un 419), on renvoie directement et
    silencieusement vers l'écran de connexion unique de la vitrine.
    Cf. Livewire\Component::request hook (fail → preventDefault()),
    documenté pour ce cas d'usage précis.
--}}
<script>
    document.addEventListener('livewire:init', () => {
        Livewire.hook('request', ({ fail }) => {
            fail(({ status, preventDefault }) => {
                if (status === 419) {
                    preventDefault();
                    window.location.href = @json(rtrim(config('app.frontend_url'), '/').'/compte/connexion');
                }
            });
        });
    });
</script>
