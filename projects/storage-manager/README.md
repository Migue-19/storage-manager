# @miguel190/storage-manager

Librería Angular para gestionar **LocalStorage** y **Cache Storage** con una API sencilla,
tipada y consistente, sin tener que usar directamente las APIs nativas del navegador.

- Servicios standalone (`providedIn: 'root'`): no requieren módulos ni configuración.
- `LocalStorageService`: primitivos y objetos (JSON), sin excepciones.
- `CacheStorageService`: cachés y respuestas HTTP con `async/await`.
- 100% de cobertura de pruebas y documentación técnica con Compodoc.

## Requisitos

Angular `^22.2.0` (`@angular/core` y `@angular/common`). Cache Storage requiere HTTPS o `localhost`.

## Instalación

```bash
npm install @miguel190/storage-manager
```

## Configuración

No hay nada que configurar: inyecte el servicio donde lo necesite.

```typescript
import { Component, inject } from '@angular/core';
import { LocalStorageService, CacheStorageService } from '@miguel190/storage-manager';

@Component({ selector: 'app-demo', template: '' })
export class DemoComponent {
  private readonly local = inject(LocalStorageService);
  private readonly cache = inject(CacheStorageService);
}
```

## LocalStorageService

| Método | Descripción | Retorno |
|---|---|---|
| `set(key, value)` | Guarda un primitivo u objeto (JSON) | `boolean` (`false` si falla) |
| `get<T>(key)` | Consulta un valor | `T \| null` (inexistente o corrupto) |
| `update<T>(key, fn)` | Actualiza a partir del valor actual | `boolean` |
| `has(key)` | ¿Existe la clave? | `boolean` |
| `remove(key)` | Elimina una clave | `void` |
| `clear()` | Elimina todo | `void` |
| `keys()` | Lista las claves | `string[]` |

```typescript
this.local.set('sesion', { usuario: 'ana', activo: true });
const sesion = this.local.get<{ usuario: string; activo: boolean }>('sesion');

this.local.update<number>('visitas', (actual) => (actual ?? 0) + 1);

if (!this.local.set('grande', datos)) {
  console.warn('No se pudo guardar (cuota excedida o no serializable)');
}
```

## CacheStorageService

| Método | Descripción | Retorno |
|---|---|---|
| `isSupported()` | ¿El navegador soporta Cache Storage? | `boolean` |
| `create(cache)` | Crea un caché | `Promise<void>` |
| `has(cache)` | ¿Existe el caché? | `Promise<boolean>` |
| `listCaches()` | Lista los cachés | `Promise<string[]>` |
| `put(cache, request, response)` | Guarda una respuesta | `Promise<void>` |
| `add(cache, url)` | Descarga y guarda un recurso | `Promise<void>` |
| `get(cache, request)` | Consulta un recurso | `Promise<Response \| null>` |
| `listEntries(cache)` | Lista los recursos (`CacheEntryInfo[]`) | `Promise<CacheEntryInfo[]>` |
| `remove(cache, request)` | Elimina un recurso | `Promise<boolean>` |
| `deleteCache(cache)` | Elimina el caché completo | `Promise<boolean>` |

```typescript
if (this.cache.isSupported()) {
  await this.cache.put('api-v1', '/api/perfil', new Response(JSON.stringify({ id: 1 })));

  const respuesta = await this.cache.get('api-v1', '/api/perfil');
  const perfil = respuesta ? await respuesta.json() : null;

  await this.cache.remove('api-v1', '/api/perfil');
  await this.cache.deleteCache('api-v1');
}
```

Si Cache Storage no está disponible, los métodos asíncronos rechazan con un `Error` descriptivo.

## Modelos

```typescript
interface CacheEntryInfo {
  readonly url: string;
  readonly method: string;
}
```

## Desarrollo

```bash
npm install
npm run test:cov    # pruebas + cobertura (umbral 100%)
npm run test:showcase # pruebas del Showcase
npm run lint        # ESLint
npm run docs        # documentación Compodoc en /documentation
npm run build:prod  # build de producción en dist/storage-manager
```

## Enlaces

- [Repositorio](https://github.com/Migue-19/storage-manager)
- [Paquete en NPM](https://www.npmjs.com/package/@miguel190/storage-manager)
- [Showcase](https://migue-19.github.io/storage-manager/)
- [Documentación Compodoc](https://migue-19.github.io/storage-manager/documentation/)

## Licencia

MIT
