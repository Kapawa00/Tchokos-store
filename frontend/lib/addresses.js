// Carnet d'adresses en localStorage (pas de route backend dédiée).

const STORAGE_KEY = "tchokos_addresses";

/**
 * @typedef {Object} Address
 * @property {string} id - UUID généré côté client.
 * @property {string} label - Ex. « Domicile », « Bureau ».
 * @property {string} ville
 * @property {string} quartier
 * @property {string} [rue]
 * @property {string} [phone]
 * @property {boolean} isDefault
 */

/** @returns {Address[]} */
export function getAddresses() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/** @param {Address[]} list */
function save(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** @param {Omit<Address, "id">} input */
export function addAddress(input) {
  const id = crypto.randomUUID();
  const addresses = getAddresses();
  // Première adresse = défaut automatique.
  const isDefault = input.isDefault || addresses.length === 0;
  const updated = isDefault
    ? addresses.map((a) => ({ ...a, isDefault: false }))
    : addresses;
  save([...updated, { ...input, id, isDefault }]);
  return id;
}

/** @param {string} id @param {Partial<Omit<Address,"id">>} changes */
export function updateAddress(id, changes) {
  let addresses = getAddresses();
  if (changes.isDefault) {
    addresses = addresses.map((a) => ({ ...a, isDefault: false }));
  }
  save(addresses.map((a) => (a.id === id ? { ...a, ...changes } : a)));
}

/** @param {string} id */
export function deleteAddress(id) {
  const remaining = getAddresses().filter((a) => a.id !== id);
  // Si on supprime l'adresse par défaut, la première devient défaut.
  if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
    remaining[0].isDefault = true;
  }
  save(remaining);
}

/** @param {string} id */
export function setDefaultAddress(id) {
  save(getAddresses().map((a) => ({ ...a, isDefault: a.id === id })));
}
