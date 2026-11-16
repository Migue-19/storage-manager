import { Injectable } from '@angular/core';
import { CacheEntryInfo } from '../models/cache-entry.model';

/**
 * Servicio para administrar recursos y respuestas HTTP mediante Cache Storage.
 *
 * Todas las operaciones son asíncronas. Si el navegador no ofrece Cache Storage
 * (por ejemplo, en un contexto no seguro) las operaciones fallan con un `Error`
 * descriptivo; use {@link CacheStorageService.isSupported} para comprobarlo.
 *
 * @example
 * ```typescript
 * private readonly cache = inject(CacheStorageService);
 *
 * await this.cache.put('api-v1', '/datos', new Response('{"ok":true}'));
 * const respuesta = await this.cache.get('api-v1', '/datos');
 * ```
 */
@Injectable({ providedIn: 'root' })
export class CacheStorageService {
  /**
   * Indica si el entorno actual soporta Cache Storage.
   */
  isSupported(): boolean {
    return typeof caches !== 'undefined';
  }

  /**
   * Crea un caché. Si ya existe, no hace nada.
   * @param cacheName Nombre del caché.
   */
  async create(cacheName: string): Promise<void> {
    await this.storage().open(cacheName);
  }

  /**
   * Indica si existe un caché.
   * @param cacheName Nombre del caché.
   */
  async has(cacheName: string): Promise<boolean> {
    return this.storage().has(cacheName);
  }

  /**
   * Lista los nombres de todos los cachés.
   */
  async listCaches(): Promise<string[]> {
    return this.storage().keys();
  }

  /**
   * Guarda una respuesta asociada a una petición. Crea el caché si no existe.
   * @param cacheName Nombre del caché.
   * @param request URL o petición con la que se identifica el recurso.
   * @param response Respuesta a almacenar.
   */
  async put(cacheName: string, request: RequestInfo, response: Response): Promise<void> {
    const cache = await this.storage().open(cacheName);
    await cache.put(request, response);
  }

  /**
   * Descarga un recurso de la red y lo guarda en el caché.
   * @param cacheName Nombre del caché.
   * @param url URL del recurso a descargar y almacenar.
   */
  async add(cacheName: string, url: string): Promise<void> {
    const cache = await this.storage().open(cacheName);
    await cache.add(url);
  }

  /**
   * Consulta un recurso almacenado.
   * @param cacheName Nombre del caché.
   * @param request URL o petición del recurso.
   * @returns La respuesta almacenada o `null` si no existe.
   */
  async get(cacheName: string, request: RequestInfo): Promise<Response | null> {
    if (!(await this.storage().has(cacheName))) {
      return null;
    }
    const cache = await this.storage().open(cacheName);
    return (await cache.match(request)) ?? null;
  }

  /**
   * Lista los recursos almacenados en un caché.
   * @param cacheName Nombre del caché.
   */
  async listEntries(cacheName: string): Promise<CacheEntryInfo[]> {
    if (!(await this.storage().has(cacheName))) {
      return [];
    }
    const cache = await this.storage().open(cacheName);
    const requests = await cache.keys();
    return requests.map((r) => ({ url: r.url, method: r.method }));
  }

  /**
   * Elimina un recurso de un caché.
   * @param cacheName Nombre del caché.
   * @param request URL o petición del recurso.
   * @returns `true` si el recurso existía y fue eliminado.
   */
  async remove(cacheName: string, request: RequestInfo): Promise<boolean> {
    if (!(await this.storage().has(cacheName))) {
      return false;
    }
    const cache = await this.storage().open(cacheName);
    return cache.delete(request);
  }

  /**
   * Elimina un caché completo con todos sus recursos.
   * @param cacheName Nombre del caché.
   * @returns `true` si el caché existía y fue eliminado.
   */
  async deleteCache(cacheName: string): Promise<boolean> {
    return this.storage().delete(cacheName);
  }

  private storage(): CacheStorage {
    if (!this.isSupported()) {
      throw new Error('Cache Storage no está disponible en este entorno (requiere HTTPS o localhost).');
    }
    return caches;
  }
}
