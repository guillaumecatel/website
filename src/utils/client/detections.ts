/**
 * Interface pour l'API Battery Status
 */
export interface BatteryManager extends EventTarget {
  charging: boolean
  chargingTime: number
  dischargingTime: number
  level: number
  onchargingchange: ((this: BatteryManager, ev: Event) => unknown) | null
  onchargingtimechange: ((this: BatteryManager, ev: Event) => unknown) | null
  ondischargingtimechange: ((this: BatteryManager, ev: Event) => unknown) | null
  onlevelchange: ((this: BatteryManager, ev: Event) => unknown) | null
}

export interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>
}

/**
 * Options de configuration pour la détection de batterie faible
 */
export interface LowBatteryOptions {
  /** Seuil en pourcentage en dessous duquel la batterie est considérée comme faible (par défaut: 0.2 soit 20%) */
  threshold?: number
  /** Temps de décharge restant en secondes en dessous duquel la batterie est considérée comme faible (par défaut: 30 min = 1800s) */
  dischargingTimeThreshold?: number
  /** Si vrai, la batterie n'est considérée comme faible que si l'appareil n'est pas en charge (par défaut: true) */
  onlyIfNotCharging?: boolean
}

/**
 * Type de retour de la fonction isLowBattery
 */
export interface BatteryStatus {
  /** Si l'API Battery est supportée */
  isSupported: boolean
  /** Si la batterie est faible selon les seuils définis */
  isLow: boolean
  /** Niveau actuel de la batterie (entre 0 et 1) */
  level?: number
  /** Si l'appareil est en charge */
  charging?: boolean
  /** Temps estimé en secondes avant décharge complète */
  dischargingTime?: number
  /** Message d'erreur en cas de problème */
  error?: string
}

/**
 * Détecte si la batterie de l'appareil est faible
 *
 * @param options Options de configuration pour la détection
 * @returns Promesse avec le statut de la batterie
 *
 * @example
 * // Vérification simple avec les paramètres par défaut
 * const batteryStatus = await isLowBattery();
 * if (batteryStatus.isSupported && batteryStatus.isLow) {
 *   console.log("Batterie faible !");
 * }
 *
 * @example
 * // Avec options personnalisées
 * const batteryStatus = await isLowBattery({
 *   threshold: 0.3,                  // Considère la batterie faible en dessous de 30%
 *   dischargingTimeThreshold: 3600,  // Ou moins d'une heure restante
 *   onlyIfNotCharging: false         // Même si en charge
 * });
 */
export async function isLowBattery(
  options: LowBatteryOptions = {},
): Promise<BatteryStatus> {
  // Valeurs par défaut
  const {
    threshold = 0.2, // 20% par défaut
    dischargingTimeThreshold = 1800, // 30 minutes par défaut
    onlyIfNotCharging = true, // Uniquement si pas en charge par défaut
  } = options

  // Vérifier si l'API Battery est supportée
  const nav = navigator as NavigatorWithBattery

  if (!nav.getBattery) {
    return {
      isSupported: false,
      isLow: false,
      error: "L'API Battery Status n'est pas supportée par ce navigateur",
    }
  }

  try {
    // Récupérer les informations de la batterie
    const battery = await nav.getBattery()

    // Si l'appareil est en charge et qu'on vérifie uniquement si pas en charge
    if (battery.charging && onlyIfNotCharging) {
      return {
        isSupported: true,
        isLow: false,
        level: battery.level,
        charging: battery.charging,
        dischargingTime: battery.dischargingTime,
      }
    }

    // Vérifier si le niveau est bas
    const isLevelLow = battery.level <= threshold

    // Vérifier si le temps de décharge est bas et valide (pas Infinity ou 0)
    const isDischargingTimeLow =
      battery.dischargingTime !== Number.POSITIVE_INFINITY &&
      battery.dischargingTime > 0 &&
      battery.dischargingTime <= dischargingTimeThreshold

    // La batterie est considérée comme faible si le niveau est bas OU si le temps de décharge est bas
    const isLow = isLevelLow || isDischargingTimeLow

    return {
      isSupported: true,
      isLow,
      level: battery.level,
      charging: battery.charging,
      dischargingTime: battery.dischargingTime,
    }
  } catch (error) {
    return {
      isSupported: true,
      isLow: false,
      error: `Erreur lors de l'accès aux informations de la batterie: ${error}`,
    }
  }
}

/**
 * S'abonne aux changements de batterie et appelle le callback lorsque l'état "batterie faible" change
 *
 * @param callback Fonction appelée lorsque l'état de la batterie change
 * @param options Options de configuration pour la détection
 * @returns Fonction pour se désabonner des événements
 *
 * @example
 * // S'abonner aux changements d'état de la batterie
 * const unsubscribe = watchBatteryStatus(
 *   (status) => {
 *     if (status.isLow) {
 *       console.log("La batterie est devenue faible !");
 *     } else {
 *       console.log("La batterie n'est plus faible");
 *     }
 *   },
 *   { threshold: 0.15 }
 * );
 *
 * // Plus tard, pour se désabonner
 * unsubscribe();
 */
export function subscribeBatteryStatus(
  callback: (status: BatteryStatus) => void,
  options: LowBatteryOptions = {},
): () => void {
  let battery: BatteryManager | null = null
  const nav = navigator as NavigatorWithBattery

  // Fonction pour vérifier et notifier du changement d'état
  const checkBatteryStatus = async () => {
    const status = await isLowBattery(options)
    callback(status)
  }

  // S'abonner aux événements de la batterie si disponible
  if (nav.getBattery) {
    nav.getBattery().then((batteryManager) => {
      battery = batteryManager

      // Vérifier immédiatement
      checkBatteryStatus()

      // S'abonner aux changements pertinents
      battery.addEventListener('levelchange', checkBatteryStatus)
      battery.addEventListener('chargingchange', checkBatteryStatus)
      battery.addEventListener('dischargingtimechange', checkBatteryStatus)
    })
  } else {
    // API non supportée, notifier une seule fois
    callback({
      isSupported: false,
      isLow: false,
      error: "L'API Battery Status n'est pas supportée par ce navigateur",
    })
  }

  // Fonction pour se désabonner
  return () => {
    if (battery) {
      battery.removeEventListener('levelchange', checkBatteryStatus)
      battery.removeEventListener('chargingchange', checkBatteryStatus)
      battery.removeEventListener('dischargingtimechange', checkBatteryStatus)
    }
  }
}

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

export function isWebglAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}
