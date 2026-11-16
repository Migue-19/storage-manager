import { Component } from '@angular/core';
import { LocalStoragePanel } from './local-storage-panel';
import { CacheStoragePanel } from './cache-storage-panel';

@Component({
  selector: 'app-root',
  imports: [LocalStoragePanel, CacheStoragePanel],
  template: `
    <main class="shell">
      <header class="intro">
        <h1>Storage Manager</h1>
        <p>
          Pruebe la librería <strong>&#64;miguel190/storage-manager</strong>: guarde, consulte,
          actualice y elimine datos en LocalStorage y en Cache Storage.
        </p>
      </header>
      <div class="bays">
        <app-local-storage-panel />
        <app-cache-storage-panel />
      </div>
    </main>
  `,
})
export class App {}
