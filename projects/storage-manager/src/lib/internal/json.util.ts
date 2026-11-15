/**
 * Utilidades internas de serialización. NO forman parte de la API pública.
 */

/**
 * Serializa un valor a JSON sin lanzar excepciones.
 * @returns El texto JSON o `null` si el valor no se puede serializar
 * (referencias circulares, `undefined`, funciones, símbolos…).
 */
export function safeStringify(value: unknown): string | null {
  try {
    return JSON.stringify(value) ?? null;
  } catch {
    return null;
  }
}

/**
 * Convierte un texto JSON en un valor sin lanzar excepciones.
 * @returns El valor o `null` si el texto es `null` o no es JSON válido.
 */
export function safeParse<T>(raw: string | null): T | null {
  if (raw === null) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
