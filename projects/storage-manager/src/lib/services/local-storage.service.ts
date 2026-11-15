import { Injectable } from '@angular/core';
import { safeParse, safeStringify } from '../internal/json.util';

/**
 * Servicio para administrar información en `localStorage`.
 *
 * Soporta valores primitivos y objetos (serialización JSON) y nunca lanza
 * excepciones: ante un error devuelve `false` o `null` según el método.
 *
 * @example
 * ```typescript
 * private readonly storage = inject(LocalStorageService);
 *
 * this.storage.set('usuario', { nombre: 'Ana' });
 * const usuario = this.storage.get<{ nombre: string }>('usuario');
 * ```
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  /**
   * Guarda un valor (primitivo u objeto) serializado como JSON.
   * @param key Clave con la que se guarda el valor.
   * @param value Valor a guardar.
   * @returns `true` si se guardó; `false` si no se pudo serializar o si el
   * navegador rechazó la escritura (cuota excedida, almacenamiento bloqueado…).
   */
  set<T>(key: string, value: T): boolean {
    const serialized = safeStringify(value);
    if (serialized === null) {
      return false;
    }
    const storage = this.storage();
    if (storage === null) {
      return false;
    }
    try {
      storage.setItem(key, serialized);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Consulta un valor.
   * @param key Clave a consultar.
   * @returns El valor deserializado, o `null` si no existe o está corrupto.
   */
  get<T>(key: string): T | null {
    const storage = this.storage();
    if (storage === null) {
      return null;
    }
    try {
      return safeParse<T>(storage.getItem(key));
    } catch {
      return null;
    }
  }

  /**
   * Actualiza un valor existente a partir de su valor actual.
   * @param key Clave a actualizar.
   * @param updater Función que recibe el valor actual (o `null`) y devuelve el nuevo.
   * @returns `true` si se guardó el nuevo valor.
   */
  update<T>(key: string, updater: (current: T | null) => T): boolean {
    return this.set(key, updater(this.get<T>(key)));
  }

  /**
   * Indica si existe una clave.
   * @param key Clave a verificar.
   */
  has(key: string): boolean {
    const storage = this.storage();
    if (storage === null) {
      return false;
    }
    try {
      return storage.getItem(key) !== null;
    } catch {
      return false;
    }
  }

  /**
   * Elimina una clave. No hace nada si no existe.
   * @param key Clave a eliminar.
   */
  remove(key: string): void {
    const storage = this.storage();
    if (storage === null) {
      return;
    }
    try {
      storage.removeItem(key);
    } catch {
      // El navegador puede rechazar el acceso al almacenamiento.
    }
  }

  /** Elimina todas las claves del `localStorage`. */
  clear(): void {
    const storage = this.storage();
    if (storage === null) {
      return;
    }
    try {
      storage.clear();
    } catch {
      // El navegador puede rechazar el acceso al almacenamiento.
    }
  }

  /**
   * Lista las claves almacenadas.
   * @returns Arreglo con todas las claves.
   */
  keys(): string[] {
    const storage = this.storage();
    if (storage === null) {
      return [];
    }
    const keys: string[] = [];
    try {
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key !== null) {
          keys.push(key);
        }
      }
    } catch {
      return [];
    }
    return keys;
  }

  private storage(): Storage | null {
    try {
      if (typeof localStorage === 'undefined') {
        return null;
      }
      return localStorage;
    } catch {
      return null;
    }
  }
}
