# Storage Manager

Workspace Angular 22 con la librería `@miguel190/storage-manager` para LocalStorage y
Cache Storage, y un Showcase funcional.

- [Repositorio](https://github.com/Migue-19/storage-manager)
- [Paquete en NPM](https://www.npmjs.com/package/@miguel190/storage-manager)
- [Showcase](https://migue-19.github.io/storage-manager/)
- [Documentación Compodoc](https://migue-19.github.io/storage-manager/documentation/)
- [README de la librería](projects/storage-manager/README.md)

## Scripts

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias |
| `npm run test:cov` | Pruebas de la librería con cobertura (falla si baja del 100%) |
| `npm run test:showcase` | Pruebas del Showcase |
| `npm run test:showcase:cov` | Pruebas del Showcase con cobertura |
| `npm run lint` | Comprueba ESLint en librería y Showcase |
| `npm run docs` | Genera la documentación técnica con Compodoc en `documentation/` |
| `npm run build:prod` | Compila la librería a `dist/storage-manager` |
| `npm run publish:lib` | Pruebas + build + `npm publish` (requiere `npm login`) |
| `npm run start:showcase` | Compila la librería y abre el Showcase en `localhost:4200` |
| `npm run build:showcase` | Compila librería y Showcase |

El Showcase local está configurado para consumir la librería compilada desde `dist/`.

## Publicar en NPM

```powershell
npm login
npm run publish:lib
```

Si NPM responde `E403` indicando que se requiere autenticación de dos factores,
active 2FA para publicaciones en la configuración de su cuenta y vuelva a ejecutar
`npm run publish:lib`; NPM solicitará el código OTP. Como alternativa, cree en NPM
un granular access token con permiso de escritura para este paquete y la opción
`bypass 2FA` habilitada. No comparta ni registre ese token en el repositorio.

Después de publicar, verifique el paquete con:

```powershell
npm view @miguel190/storage-manager
```

## Conventional Commits

`feat`, `fix`, `docs`, `test`, `refactor`, `chore`, p. ej. `feat(local-storage): add update method`.
