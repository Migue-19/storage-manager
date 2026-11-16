import { TestBed } from '@angular/core/testing';
import { CacheStoragePanel } from './cache-storage-panel';

class FakeCache {
  private readonly entries = new Map<string, Response>();

  async put(request: RequestInfo, response: Response): Promise<void> {
    this.entries.set(typeof request === 'string' ? request : request.url, response);
  }

  async add(url: string): Promise<void> {
    const response = await fetch(url);
    this.entries.set(url, response);
  }

  async match(request: RequestInfo): Promise<Response | undefined> {
    return this.entries.get(typeof request === 'string' ? request : request.url);
  }

  async delete(request: RequestInfo): Promise<boolean> {
    return this.entries.delete(typeof request === 'string' ? request : request.url);
  }

  async keys(): Promise<Request[]> {
    return [...this.entries.keys()].map((url) => new Request(new URL(url, 'https://example.test')));
  }
}

class FakeCacheStorage {
  private readonly stores = new Map<string, FakeCache>();

  async open(name: string): Promise<FakeCache> {
    if (!this.stores.has(name)) {
      this.stores.set(name, new FakeCache());
    }
    return this.stores.get(name) as FakeCache;
  }

  async has(name: string): Promise<boolean> {
    return this.stores.has(name);
  }

  async keys(): Promise<string[]> {
    return [...this.stores.keys()];
  }

  async delete(name: string): Promise<boolean> {
    return this.stores.delete(name);
  }
}

describe('CacheStoragePanel', () => {
  beforeEach(() => {
    vi.stubGlobal('caches', new FakeCacheStorage());
    vi.stubGlobal('fetch', vi.fn(async () => new Response('descargado', {
      headers: { 'Content-Type': 'text/plain' },
    })));
  });

  afterEach(() => vi.unstubAllGlobals());

  it('creates, saves and reads a resource', async () => {
    const fixture = TestBed.createComponent(CacheStoragePanel);
    const panel = fixture.componentInstance;
    await panel['create']();
    await panel['save']();
    await panel['read']();
    expect(panel['result']()).toBe('Hola desde Cache Storage');
    expect(panel['note']()?.kind).toBe('ok');
  });

  it('downloads, removes an entry and deletes a cache', async () => {
    const fixture = TestBed.createComponent(CacheStoragePanel);
    const panel = fixture.componentInstance;
    await panel['download']();
    expect(vi.mocked(fetch)).toHaveBeenCalledWith('/demo/saludo');
    await panel['read']();
    expect(panel['result']()).toBe('descargado');
    await panel['removeEntry']();
    expect(panel['note']()?.kind).toBe('ok');
    await panel['deleteCache']();
    expect(panel['caches']()).toEqual([]);
  });

  it('reports missing resources and caches', async () => {
    const panel = TestBed.createComponent(CacheStoragePanel).componentInstance;
    await panel['read']();
    expect(panel['note']()?.kind).toBe('error');
    await panel['removeEntry']();
    expect(panel['note']()?.kind).toBe('error');
    await panel['deleteCache']();
    expect(panel['note']()?.kind).toBe('error');
  });

  it('reports service errors and supports selecting a cache', async () => {
    const panel = TestBed.createComponent(CacheStoragePanel).componentInstance;
    await panel['create']();
    await panel['selectCache']('other');
    expect(panel['cacheName']()).toBe('other');
    vi.stubGlobal('caches', undefined);
    await panel['create']();
    expect(panel['note']()?.kind).toBe('error');
  });

  it('warns when Cache Storage is not available', async () => {
    vi.unstubAllGlobals();
    vi.stubGlobal('caches', undefined);
    const fixture = TestBed.createComponent(CacheStoragePanel);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('no ofrece Cache Storage');
    vi.unstubAllGlobals();
  });
});
