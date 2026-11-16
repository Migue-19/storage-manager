import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CacheEntryInfo, CacheStorageService } from '@miguel190/storage-manager';

interface Note { kind: 'ok' | 'error'; text: string }

@Component({
  selector: 'app-cache-storage-panel',
  imports: [FormsModule],
  template: `
    <section class="bay" aria-labelledby="cs-title">
      <div class="bay-head">
        <h2 id="cs-title">Cache Storage</h2>
        <span class="plate">{{ caches().length }} {{ caches().length === 1 ? 'caché' : 'cachés' }}</span>
      </div>
      <div class="bay-body">
        @if (!supported) {
          <p class="note warn" role="alert">
            Este navegador no ofrece Cache Storage. Abra el Showcase desde HTTPS o desde localhost.
          </p>
        }
        <label>Nombre del caché
          <input [(ngModel)]="cacheName" autocomplete="off" />
        </label>
        <label>URL del recurso
          <input [(ngModel)]="url" autocomplete="off" />
          <span class="hint">«Descargar y guardar» trae el contenido de esta URL, por ejemplo /favicon.ico.</span>
        </label>
        <label>Contenido de la respuesta
          <textarea [(ngModel)]="body"></textarea>
        </label>
        <div class="actions">
          <button type="button" (click)="create()">Crear caché</button>
          <button class="primary" type="button" (click)="save()">Guardar recurso</button>
          <button type="button" (click)="download()">Descargar y guardar</button>
          <button type="button" (click)="read()">Consultar</button>
          <button class="danger" type="button" (click)="removeEntry()">Eliminar recurso</button>
          <button class="danger" type="button" (click)="deleteCache()">Eliminar caché</button>
        </div>
        @if (note(); as n) {
          <p class="note" [class.error]="n.kind === 'error'" role="status">{{ n.text }}</p>
        }
        @if (result() !== null) {
          <pre class="result">{{ result() }}</pre>
        }
        <div class="inventory">
          <h3>Cachés</h3>
          @if (caches().length) {
            <ul class="rows">
              @for (c of caches(); track c) {
                <li [class.sel]="c === cacheName()">
                  <button type="button" (click)="selectCache(c)"><span class="k">{{ c }}</span></button>
                </li>
              }
            </ul>
          } @else {
            <p class="empty">No hay cachés. Escriba un nombre y pulse Crear caché.</p>
          }
        </div>
        <div class="inventory">
          <h3>Recursos de «{{ cacheName() }}»</h3>
          @if (entries().length) {
            <ul class="rows">
              @for (e of entries(); track e.url) {
                <li>
                  <button type="button" (click)="url.set(e.url)">
                    <span class="k">{{ e.url }}</span><span class="v">{{ e.method }}</span>
                  </button>
                </li>
              }
            </ul>
          } @else {
            <p class="empty">Este caché no tiene recursos.</p>
          }
        </div>
      </div>
    </section>
  `,
})
export class CacheStoragePanel implements OnInit {
  private readonly cache = inject(CacheStorageService);
  protected readonly supported = this.cache.isSupported();
  protected readonly cacheName = signal('showcase-v1');
  protected readonly url = signal('/demo/saludo');
  protected readonly body = signal('Hola desde Cache Storage');
  protected readonly caches = signal<string[]>([]);
  protected readonly entries = signal<CacheEntryInfo[]>([]);
  protected readonly note = signal<Note | null>(null);
  protected readonly result = signal<string | null>(null);

  ngOnInit(): void {
    void this.refresh();
  }

  protected create(): Promise<void> {
    return this.run(async () => {
      await this.cache.create(this.cacheName());
      return `Caché «${this.cacheName()}» listo.`;
    });
  }

  protected save(): Promise<void> {
    return this.run(async () => {
      const response = new Response(this.body(), { headers: { 'Content-Type': 'text/plain' } });
      await this.cache.put(this.cacheName(), this.url(), response);
      return `Se guardó ${this.url()} en «${this.cacheName()}».`;
    });
  }

  protected download(): Promise<void> {
    return this.run(async () => {
      await this.cache.add(this.cacheName(), this.url());
      return `Se descargó y guardó ${this.url()}. Pulse Consultar para ver su contenido.`;
    });
  }

  protected read(): Promise<void> {
    return this.run(async () => {
      const response = await this.cache.get(this.cacheName(), this.url());
      if (response === null) {
        throw new Error(`No hay un recurso ${this.url()} en «${this.cacheName()}». Guárdelo primero.`);
      }
      const type = response.headers.get('Content-Type') ?? '';
      this.result.set(type.startsWith('text/') || type.includes('json') ? await response.text() : `(${type || 'contenido binario'})`);
      return `Recurso ${this.url()} consultado.`;
    });
  }

  protected removeEntry(): Promise<void> {
    return this.run(async () => {
      if (!(await this.cache.remove(this.cacheName(), this.url()))) {
        throw new Error(`El recurso ${this.url()} no existe en «${this.cacheName()}».`);
      }
      return `Se eliminó ${this.url()}.`;
    });
  }

  protected deleteCache(): Promise<void> {
    return this.run(async () => {
      if (!(await this.cache.deleteCache(this.cacheName()))) {
        throw new Error(`El caché «${this.cacheName()}» no existe.`);
      }
      return `Se eliminó el caché «${this.cacheName()}».`;
    });
  }

  protected selectCache(name: string): Promise<void> {
    this.cacheName.set(name);
    return this.refresh();
  }

  private async run(action: () => Promise<string>): Promise<void> {
    this.result.set(null);
    try {
      this.note.set({ kind: 'ok', text: await action() });
    } catch (error) {
      this.note.set({ kind: 'error', text: error instanceof Error ? error.message : 'Ocurrió un error inesperado.' });
    }
    try {
      await this.refresh();
    } catch (error) {
      this.note.set({ kind: 'error', text: error instanceof Error ? error.message : 'Ocurrió un error inesperado.' });
    }
  }

  private async refresh(): Promise<void> {
    if (!this.supported) return;
    this.caches.set(await this.cache.listCaches());
    this.entries.set((await this.cache.has(this.cacheName())) ? await this.cache.listEntries(this.cacheName()) : []);
  }
}
