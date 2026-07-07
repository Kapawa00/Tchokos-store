// Layout racine de /compte — pass-through sans auth.
// La protection réelle (avec AccountNav + vérification du jeton) est dans
// app/compte/(protected)/layout.js, via un route group qui ne couvre pas
// les pages publiques connexion/ et inscription/.
export default function CompteRootLayout({ children }) {
  return children;
}
