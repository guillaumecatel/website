/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Représente l'état actuel de la connexion réseau
 */
export interface NetworkStatus {
  /**
   * Indique si l'API Network Information est supportée par le navigateur
   */
  isSupported: boolean

  /**
   * Indique si la connexion réseau est considérée comme faible
   */
  isLow: boolean

  /**
   * Type de connexion effective détectée (ex: '4g', '3g', '2g', 'slow-2g')
   */
  effectiveType?: string

  /**
   * Bande passante estimée (en mégabits par seconde)
   */
  downlink?: number

  /**
   * Temps aller-retour estimé (en millisecondes)
   */
  rtt?: number

  /**
   * Message d'erreur si une détection échoue ou si l'API est non disponible
   */
  error?: string
}

/**
 * Options de configuration pour la détection d'une connexion réseau faible
 */
export interface LowNetworkOptions {
  /**
   * Liste des types de connexion considérés comme faibles
   * @default ['2g', 'slow-2g']
   */
  effectiveTypes?: string[]

  /**
   * Seuil de bande passante minimum en Mbps. Une connexion est faible si elle est inférieure à ce seuil.
   * @default 0.5
   */
  downlinkThreshold?: number

  /**
   * Seuil de latence (RTT) maximum en ms. Une connexion est faible si elle est supérieure à ce seuil.
   * @default 300
   */
  rttThreshold?: number
}

/**
 * Détecte si la connexion réseau est faible
 *
 * @param options Options de configuration pour la détection
 * @returns Statut de la connexion réseau
 *
 * @example
 * // Vérification simple
 * const networkStatus = isLowNetwork();
 * if (networkStatus.isSupported && networkStatus.isLow) {
 *   console.warn("Connexion réseau faible détectée !");
 * }
 *
 * @example
 * // Avec options personnalisées
 * const networkStatus = isLowNetwork({
 *   effectiveTypes: ['2g', 'slow-2g'],
 *   downlinkThreshold: 0.4,
 *   rttThreshold: 400,
 * });
 */
export function isSlowNetwork(options: LowNetworkOptions = {}): NetworkStatus {
  const {
    effectiveTypes = ['2g', 'slow-2g'],
    downlinkThreshold = 0.5, // Mbps
    rttThreshold = 300, // ms
  } = options

  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection

  if (!connection) {
    return {
      isSupported: false,
      isLow: false,
      error: "L'API Network Information n'est pas supportée par ce navigateur",
    }
  }

  const { effectiveType, downlink, rtt } = connection

  const isLow =
    effectiveTypes.includes(effectiveType) ||
    (downlink !== undefined && downlink < downlinkThreshold) ||
    (rtt !== undefined && rtt > rttThreshold)

  return {
    isSupported: true,
    isLow,
    effectiveType,
    downlink,
    rtt,
  }
}

/**
 * S'abonne aux changements de la qualité de connexion réseau
 *
 * @param callback Fonction appelée lorsque le statut réseau change
 * @param options Options de configuration pour la détection
 * @returns Fonction pour se désabonner des événements
 *
 * @example
 * const unsubscribe = subscribeNetworkStatus((status) => {
 *   if (status.isLow) {
 *     console.warn("Connexion réseau faible détectée");
 *   } else {
 *     console.log("Connexion réseau correcte");
 *   }
 * });
 *
 * // Plus tard, pour se désabonner :
 * unsubscribe();
 */
export function subscribeNetworkStatus(
  callback: (status: NetworkStatus) => void,
  options: LowNetworkOptions = {},
): () => void {
  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection

  const checkStatus = () => {
    const status = isSlowNetwork(options)
    callback(status)
  }

  if (connection) {
    connection.addEventListener('change', checkStatus)
    checkStatus() // Appel immédiat
  } else {
    callback({
      isSupported: false,
      isLow: false,
      error: "L'API Network Information n'est pas supportée par ce navigateur",
    })
  }

  return () => {
    if (connection) {
      connection.removeEventListener('change', checkStatus)
    }
  }
}
