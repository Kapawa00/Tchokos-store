"use client";

import { useEffect, useState } from "react";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/lib/addresses";
import { MapPinIcon, TrashIcon, PlusIcon, CheckCircleIcon } from "@/components/icons";

/**
 * Carnet d'adresses en localStorage (sans persistance côté serveur).
 * CRUD complet avec adresse par défaut.
 */
export default function AddressBook() {
  const [addresses, setAddresses] = useState(/** @type {import("@/lib/addresses").Address[]} */ ([]));
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(/** @type {import("@/lib/addresses").Address|null} */ (null));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setAddresses(getAddresses());
    setMounted(true);
  }, []);

  const reload = () => setAddresses(getAddresses());

  const handleDelete = (id) => {
    deleteAddress(id);
    reload();
  };

  const handleSetDefault = (id) => {
    setDefaultAddress(id);
    reload();
  };

  const handleSave = (data, id) => {
    if (id) {
      updateAddress(id, data);
    } else {
      addAddress(data);
    }
    reload();
    setShowForm(false);
    setEditing(null);
  };

  if (!mounted) {
    return <div className="h-32 animate-pulse rounded-card bg-sand/40" />;
  }

  return (
    <div className="space-y-4">
      {/* Liste */}
      {addresses.length === 0 && !showForm && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <MapPinIcon className="h-10 w-10 text-taupe/60" />
          <p className="font-body text-sm text-taupe">Aucune adresse enregistrée.</p>
        </div>
      )}

      {addresses.map((addr) => (
        <div
          key={addr.id}
          className={`rounded-card border p-4 ${addr.isDefault ? "border-espresso bg-espresso/5" : "border-sand bg-offwhite"}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="font-body text-sm font-semibold text-espresso">{addr.label}</span>
                {addr.isDefault && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-espresso px-2 py-0.5 font-body text-[10px] font-bold text-cream">
                    <CheckCircleIcon className="h-3 w-3" /> Par défaut
                  </span>
                )}
              </div>
              <p className="font-body text-sm text-taupe">
                {addr.quartier}{addr.rue ? `, ${addr.rue}` : ""} · {addr.ville}
              </p>
              {addr.phone && (
                <p className="font-body text-xs text-taupe">{addr.phone}</p>
              )}
            </div>
            <div className="flex gap-2">
              {!addr.isDefault && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(addr.id)}
                  className="rounded-button border border-espresso/30 px-3 py-1.5 font-body text-xs text-espresso transition-colors hover:bg-espresso hover:text-cream"
                >
                  Définir par défaut
                </button>
              )}
              <button
                type="button"
                onClick={() => { setEditing(addr); setShowForm(true); }}
                className="rounded-button border border-sand px-3 py-1.5 font-body text-xs text-taupe transition-colors hover:border-espresso hover:text-espresso"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={() => handleDelete(addr.id)}
                aria-label="Supprimer l'adresse"
                className="flex h-8 w-8 items-center justify-center rounded-button text-taupe transition-colors hover:bg-bordeaux/10 hover:text-bordeaux"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Formulaire */}
      {showForm ? (
        <AddressForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-card border border-dashed border-cognac/50 py-4 font-body text-sm font-medium text-cognac transition-colors hover:bg-cognac/5"
        >
          <PlusIcon className="h-4 w-4" />
          Ajouter une adresse
        </button>
      )}
    </div>
  );
}

/**
 * Formulaire d'ajout / modification d'adresse.
 * @param {{ initial: import("@/lib/addresses").Address|null, onSave: Function, onCancel: Function }} props
 */
function AddressForm({ initial, onSave, onCancel }) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [ville, setVille] = useState(initial?.ville ?? "Douala");
  const [quartier, setQuartier] = useState(initial?.quartier ?? "");
  const [rue, setRue] = useState(initial?.rue ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const local = {};
    if (!label.trim()) local.label = "Requis.";
    if (!quartier.trim()) local.quartier = "Requis.";
    if (!ville.trim()) local.ville = "Requis.";
    if (Object.keys(local).length > 0) { setErrors(local); return; }
    onSave({ label: label.trim(), ville: ville.trim(), quartier: quartier.trim(), rue: rue.trim(), phone: phone.trim(), isDefault }, initial?.id);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-cognac/30 bg-offwhite p-5 space-y-4">
      <h3 className="font-display text-sm font-semibold text-espresso">
        {initial ? "Modifier l'adresse" : "Nouvelle adresse"}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Étiquette *" error={errors.label}>
          <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex. Domicile, Bureau…" className={inputCls(!!errors.label)} />
        </Field>
        <Field label="Ville *" error={errors.ville}>
          <input type="text" value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Ex. Douala" className={inputCls(!!errors.ville)} />
        </Field>
        <Field label="Quartier *" error={errors.quartier}>
          <input type="text" value={quartier} onChange={(e) => setQuartier(e.target.value)} placeholder="Ex. Akwa, Bonamoussadi…" className={inputCls(!!errors.quartier)} />
        </Field>
        <Field label="Rue (facultatif)">
          <input type="text" value={rue} onChange={(e) => setRue(e.target.value)} placeholder="Ex. Rue Joss" className={inputCls(false)} />
        </Field>
        <Field label="Téléphone (facultatif)">
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="237 6XX XX XX XX" className={inputCls(false)} />
        </Field>
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="h-4 w-4 accent-espresso" />
        <span className="font-body text-sm text-taupe">Définir comme adresse par défaut</span>
      </label>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="rounded-button border border-sand px-5 py-2.5 font-body text-sm text-taupe hover:border-taupe">
          Annuler
        </button>
        <button type="submit" className="rounded-button bg-espresso px-6 py-2.5 font-body text-sm font-medium text-cream hover:bg-cognac">
          Enregistrer
        </button>
      </div>
    </form>
  );
}

function inputCls(hasError) {
  return `w-full rounded-button border ${hasError ? "border-bordeaux" : "border-sand"} bg-cream px-4 py-2.5 font-body text-sm text-espresso placeholder:text-taupe/50 transition-colors focus:border-espresso focus:outline-none focus:ring-1 focus:ring-espresso`;
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1 block font-body text-xs font-medium text-espresso">{label}</label>
      {children}
      {error && <p className="mt-1 font-body text-xs text-bordeaux">{error}</p>}
    </div>
  );
}
