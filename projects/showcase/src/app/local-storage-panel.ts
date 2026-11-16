import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LocalStorageService } from '@miguel190/storage-manager';

interface Entry { key: string; value: string }
interface Note { kind: 'ok' | 'error'; text: string }

@Component({
  selector: 'app-local-storage-panel',
  imports: [FormsModule],
  template: `
    <section class="bay" aria-labelledby="ls-title">
      <div class="bay-head">
        <h2 id="ls-title">LocalStorage</h2>
        <span class="plate">{{ entries().length }} {{ entries().length === 1 ? 'clave' : 'claves' }}</span>
      </div>
      <div class="bay-body">
        <label>Clave
          <input [(ngModel)]="key" placeholder="usuario" autocomplete="off" />
        </label>
        <label>Valor
          <textarea [(ngModel)]="value" placeholder='Texto, número o JSON, por ejemplo {"nombre":"Ana"}'></textarea>
          <span class="hint">Si el valor es JSON válido se guarda como objeto; si no, como texto.</span>
        </label>
        <div class="actions">
          <button class="primary" type="button" (click)="save()">Guardar</button>
          <button type="button" (click)="read()">Consultar</button>
          <button type="button" (click)="update()">Actualizar</button>
          <button class="danger" type="button" (click)="remove()">Eliminar</button>
          <button class="danger" type="button" (click)="clearAll()">Vaciar todo</button>
        </div>
        @if (note(); as n) {
          <p class="note" [class.error]="n.kind === 'error'" role="status">{{ n.text }}</p>
        }
        <div class="inventory">
          <h3>Claves guardadas</h3>
          @if (entries().length) {
            <ul class="rows">
              @for (e of entries(); track e.key) {
                <li>
                  <button type="button" (click)="load(e)">
                    <span class="k">{{ e.key }}</span><span class="v">{{ e.value }}</span>
                  </button>
                </li>
              }
            </ul>
          } @else {
            <p class="empty">Todavía no hay claves. Escriba una clave y un valor, y pulse Guardar.</p>
          }
        </div>
      </div>
    </section>
  `,
})
export class LocalStoragePanel implements OnInit {
  private readonly storage = inject(LocalStorageService);
  protected readonly key = signal('');
  protected readonly value = signal('');
  protected readonly entries = signal<Entry[]>([]);
  protected readonly note = signal<Note | null>(null);

  ngOnInit(): void {
    this.refresh();
  }

  protected save(): void {
    if (!this.requireKey()) return;
    const ok = this.storage.set(this.key(), this.parse(this.value()));
    this.finish(ok, `Se guardó «${this.key()}».`, 'No se pudo guardar: el navegador rechazó la escritura o el valor no es serializable.');
  }

  protected read(): void {
    if (!this.requireKey()) return;
    if (!this.storage.has(this.key())) {
      this.note.set({ kind: 'error', text: `La clave «${this.key()}» no existe. Guárdela primero.` });
      return;
    }
    this.value.set(this.display(this.storage.get<unknown>(this.key())));
    this.note.set({ kind: 'ok', text: `Valor de «${this.key()}» cargado en el campo Valor.` });
  }

  protected update(): void {
    if (!this.requireKey()) return;
    if (!this.storage.has(this.key())) {
      this.note.set({ kind: 'error', text: `No se puede actualizar «${this.key()}» porque no existe. Use Guardar.` });
      return;
    }
    const next = this.parse(this.value());
    const ok = this.storage.update<unknown>(this.key(), () => next);
    this.finish(ok, `Se actualizó «${this.key()}».`, 'No se pudo actualizar el valor.');
  }

  protected remove(): void {
    if (!this.requireKey()) return;
    if (!this.storage.has(this.key())) {
      this.note.set({ kind: 'error', text: `La clave «${this.key()}» no existe, no hay nada que eliminar.` });
      return;
    }
    this.storage.remove(this.key());
    this.finish(true, `Se eliminó «${this.key()}».`, '');
  }

  protected clearAll(): void {
    this.storage.clear();
    this.finish(true, 'Se eliminaron todas las claves.', '');
  }

  protected load(entry: Entry): void {
    this.key.set(entry.key);
    this.value.set(entry.value);
  }

  private requireKey(): boolean {
    if (this.key().trim() === '') {
      this.note.set({ kind: 'error', text: 'Escriba una clave para continuar.' });
      return false;
    }
    return true;
  }

  private finish(ok: boolean, success: string, failure: string): void {
    this.note.set(ok ? { kind: 'ok', text: success } : { kind: 'error', text: failure });
    this.refresh();
  }

  private refresh(): void {
    this.entries.set(
      this.storage.keys().map((key) => ({ key, value: this.display(this.storage.get<unknown>(key)) })),
    );
  }

  private parse(raw: string): unknown {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }

  private display(value: unknown): string {
    return typeof value === 'string' ? value : JSON.stringify(value) ?? '';
  }
}
