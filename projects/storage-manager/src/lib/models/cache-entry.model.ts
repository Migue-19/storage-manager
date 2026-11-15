/**
 * Describe un recurso almacenado dentro de un Cache Storage.
 */
export interface CacheEntryInfo {
  /** URL absoluta con la que se guardó el recurso. */
  readonly url: string;
  /** Método HTTP de la petición asociada (normalmente `GET`). */
  readonly method: string;
}
