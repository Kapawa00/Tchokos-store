// Structures de données du domaine, calquées sur les API Resources Laravel
// (app/Http/Resources). Documentées en typedefs JSDoc pour l'auto-complétion et
// la vérification de types dans l'éditeur (le projet est en JavaScript, sans TS).
//
// ⚠️ Les montants sont des CHAÎNES (décimales sérialisées, ex. « 12000.00 »),
// car renvoyés par les casts `decimal:2` / `number_format` côté backend.

/**
 * @typedef {"admin"|"manager"|"customer"|"wholesaler"} UserRole
 * @typedef {"family"|"section"} CategoryType
 * @typedef {"image"|"video"} MediaType
 * @typedef {"whatsapp"|"email"|"site"} OrderChannel
 * @typedef {"pending_payment"|"paid"|"preparing"|"shipped"|"delivered"|"cancelled"} OrderStatus
 * @typedef {"orange_money"|"momo"|"whatsapp"} PaymentMethod
 * @typedef {"pending"|"confirmed"|"failed"} TransactionStatus
 * @typedef {"pending"|"approved"|"rejected"|"none"} WholesaleStatus
 */

/**
 * Catégorie de navigation (famille avec rayons enfants, ou rayon).
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} name
 * @property {string} slug
 * @property {CategoryType} type
 * @property {number} position
 * @property {string|null} [description]
 * @property {string|null} [banner_image_url]
 * @property {string|null} [banner_video_url]
 * @property {Category[]} [children]
 */

/**
 * Référence légère de catégorie embarquée dans un produit.
 * @typedef {Object} CategoryRef
 * @property {number} id
 * @property {string} name
 * @property {string} slug
 */

/**
 * Badge d'affichage (nouveauté ou remise).
 * @typedef {Object} Badge
 * @property {"new"|"discount"} type
 * @property {string} label
 */

/**
 * Produit en liste/grille (ProductResource).
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} name
 * @property {string} slug
 * @property {string|null} excerpt
 * @property {CategoryRef} [category]
 * @property {string} price - Prix affiché (détail ou gros selon le rôle).
 * @property {string|null} promo_price - Prix remisé si promo active, sinon null.
 * @property {boolean} is_new
 * @property {boolean} [in_stock]
 * @property {string|null} [primary_image]
 * @property {Badge|null} badge
 */

/**
 * Média produit (vidéo/reel ou image).
 * @typedef {Object} Media
 * @property {number} id
 * @property {MediaType} type
 * @property {string} url
 * @property {string|null} poster_url
 * @property {number} position
 */

/**
 * Variante (pointure/couleur) d'un produit.
 * @typedef {Object} Variant
 * @property {number} id
 * @property {string|null} size
 * @property {string|null} color
 * @property {string} sku
 * @property {number} stock
 * @property {boolean} in_stock
 * @property {string|null} price - price_override, sinon prix du produit.
 */

/**
 * Détail complet d'un produit (ProductDetailResource).
 * @typedef {Object} ProductDetail
 * @property {number} id
 * @property {string} name
 * @property {string} slug
 * @property {string|null} description
 * @property {CategoryRef} [category]
 * @property {string} price
 * @property {boolean} is_new
 * @property {Variant[]} [variants]
 * @property {Media[]} [media]
 * @property {Product[]} similar_products
 */

/**
 * Reel du mur de l'accueil (média vidéo + produit associé).
 * @typedef {Object} Reel
 * @property {number} id
 * @property {string} url - URL de la vidéo.
 * @property {string|null} poster_url - Vignette affichée avant lecture.
 * @property {{ id:number, name:string, slug:string }} [product]
 */

/**
 * Bannière de la page d'accueil.
 * @typedef {Object} Banner
 * @property {number} id
 * @property {string} title
 * @property {string|null} subtitle
 * @property {string} image_url - Chemin relatif sur le disque public.
 * @property {string|null} link_url
 */

/**
 * Suggestion de recherche rapide (autocomplete).
 * @typedef {Object} SearchSuggestion
 * @property {number} id
 * @property {string} name
 * @property {string} slug
 * @property {string} price
 * @property {string|null} [image]
 */

/**
 * Ligne du panier (CartItemResource).
 * @typedef {Object} CartItem
 * @property {number} id
 * @property {number} quantity
 * @property {string} unit_price
 * @property {string} line_total
 * @property {{ id:number, size:(string|null), color:(string|null), sku:string, stock:number, in_stock:boolean }} variant
 * @property {{ id:number, name:string, slug:string, image:(string|null) }} product
 */

/**
 * Panier (CartResource).
 * @typedef {Object} Cart
 * @property {number} id
 * @property {string|null} session_token - Présent pour un invité, sinon null.
 * @property {CartItem[]} items
 * @property {number} items_count
 * @property {string} subtotal
 */

/**
 * Ligne de commande (OrderItemResource).
 * @typedef {Object} OrderItem
 * @property {number} id
 * @property {string} product_name
 * @property {string|null} variant_label
 * @property {number} quantity
 * @property {string} unit_price
 * @property {string} line_total
 */

/**
 * Commande (OrderResource).
 * @typedef {Object} Order
 * @property {number} id
 * @property {string} reference
 * @property {OrderStatus} status
 * @property {OrderChannel} channel
 * @property {string} customer_name
 * @property {string} customer_phone
 * @property {string|null} customer_email
 * @property {string} subtotal
 * @property {string} shipping_fee
 * @property {string} total
 * @property {boolean} is_paid
 * @property {string|null} notes
 * @property {OrderItem[]} [items]
 * @property {string|null} created_at - ISO 8601.
 */

/**
 * Transaction de paiement (TransactionResource).
 * @typedef {Object} Transaction
 * @property {number} id
 * @property {PaymentMethod} method
 * @property {string|null} reference
 * @property {string} amount
 * @property {TransactionStatus} status
 * @property {string|null} proof_url
 * @property {string|null} created_at
 */

/**
 * Compte grossiste (WholesaleAccountResource). `status: "none"` si aucune
 * demande n'existe encore.
 * @typedef {Object} WholesaleAccount
 * @property {WholesaleStatus} status
 * @property {string|null} [company]
 * @property {string|null} [city]
 * @property {string|null} [item_type]
 * @property {string|null} [volume]
 * @property {string|null} [notes]
 * @property {string|null} [created_at]
 * @property {string|null} [updated_at]
 */

/**
 * Utilisateur authentifié (modèle User sérialisé + wholesale_account).
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string|null} phone
 * @property {UserRole} role
 * @property {WholesaleAccount|null} [wholesale_account]
 * @property {string|null} [email_verified_at] - ISO 8601 ou null si compte non vérifié.
 * @property {string|null} [avatar_url] - URL de la photo de profil (optionnelle, future).
 * @property {string|null} [created_at]
 */

/**
 * Métadonnées de pagination Laravel.
 * @typedef {Object} PaginationMeta
 * @property {number} current_page
 * @property {number} last_page
 * @property {number} per_page
 * @property {number} total
 * @property {number|null} from
 * @property {number|null} to
 */

/**
 * Résultat paginé normalisé.
 * @template T
 * @typedef {Object} Paginated
 * @property {T[]} items
 * @property {PaginationMeta} pagination
 * @property {Object} [links]
 */

/**
 * Filtres du catalogue (GET /products).
 * @typedef {Object} ProductFilters
 * @property {string} [category] - Slug de famille ou de rayon.
 * @property {string} [size] - Pointures sélectionnées, séparées par virgule (ex. "38,40").
 * @property {string} [color] - Couleur (ex. "Noir").
 * @property {boolean|1} [in_stock] - 1 = articles en stock uniquement.
 * @property {number} [price_min]
 * @property {number} [price_max]
 * @property {boolean} [is_new]
 * @property {boolean} [has_promo] - true = articles avec promo_price actif uniquement.
 * @property {string} [q] - Recherche plein texte.
 * @property {"newest"|"price_asc"|"price_desc"} [sort]
 * @property {number} [per_page]
 * @property {number} [page]
 */

// Module purement documentaire (typedefs). Export vide pour permettre l'import.
export {};
