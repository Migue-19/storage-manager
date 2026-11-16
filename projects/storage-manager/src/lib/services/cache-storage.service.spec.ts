import { TestBed } from '@angular/core/testing';
import { CacheStorageService } from './cache-storage.service';

const urlOf = (r: RequestInfo): string => (typeof r === 'string' ? r : (r as Request).url);

class FakeCache {
  private readonly store = new Map<string, Response>();
  async put(req: RequestInfo, res: Response): Promise<void> {
    this.store.set(urlOf(req), res);
  }
  async add(req: RequestInfo): Promise<void> {
    this.store.set(urlOf(req), new Response('descargado: ' + urlOf(req)));
  }
  async match(req: RequestInfo): Promise<Response | undefined> {
    return this.store.get(urlOf(req));
  }
  async delete(req: RequestInfo): Promise<boolean> {
    return this.store.delete(urlOf(req));
  }
  async keys(): Promise<Request[]> {
    return [...this.store.keys()].map((u) => new Request(u));
  }
}

class FakeCacheStorage {
  private readonly caches = new Map<string, FakeCache>();
  async open(name: string): Promise<FakeCache> {
    if (!this.caches.has(name)) {
      this.caches.set(name, new FakeCache());
    }
    return this.caches.get(name) as FakeCache;
  }
  async has(name: string): Promise<boolean> {
    return this.caches.has(name);
  }
  async keys(): Promise<string[]> {
    return [...this.caches.keys()];
  }
  async delete(name: string): Promise<boolean> {
    return this.caches.delete(name);
  }
}

describe('CacheStorageService', () => {
  let service: CacheStorageService;
  const URL_A = 'https://example.com/a';

  beforeEach(() => {
    vi.stubGlobal('caches', new FakeCacheStorage());
    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheStorageService);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('support detection', () => {
    it('isSupported is true when caches exists', () => {
      expect(service.isSupported()).toBe(true);
    });

    it('isSupported is false and operations fail when caches is missing', async () => {
      vi.stubGlobal('caches', undefined);
      expect(service.isSupported()).toBe(false);
      await expect(service.create('x')).rejects.toThrow('Cache Storage no está disponible');
    });
  });

  describe('cache management', () => {
    it('create / has / listCaches', async () => {
      expect(await service.has('c1')).toBe(false);
      await service.create('c1');
      await service.create('c1');
      await service.create('c2');
      expect(await service.has('c1')).toBe(true);
      expect(await service.listCaches()).toEqual(['c1', 'c2']);
    });

    it('deleteCache removes a whole cache and reports missing ones', async () => {
      await service.create('c1');
      expect(await service.deleteCache('c1')).toBe(true);
      expect(await service.deleteCache('c1')).toBe(false);
      expect(await service.has('c1')).toBe(false);
    });
  });

  describe('resources', () => {
    it('put creates the cache and get returns the response', async () => {
      await service.put('c1', URL_A, new Response('hola'));
      const res = await service.get('c1', URL_A);
      expect(await res?.text()).toBe('hola');
    });

    it('get returns null for a missing resource', async () => {
      await service.create('c1');
      expect(await service.get('c1', URL_A)).toBeNull();
    });

    it('reads from a missing cache without creating it', async () => {
      expect(await service.get('missing', URL_A)).toBeNull();
      expect(await service.listEntries('missing')).toEqual([]);
      expect(await service.remove('missing', URL_A)).toBe(false);
      expect(await service.listCaches()).toEqual([]);
    });

    it('add downloads and stores a resource', async () => {
      await service.add('c1', URL_A);
      const res = await service.get('c1', URL_A);
      expect(await res?.text()).toBe('descargado: ' + URL_A);
    });

    it('listEntries returns url and method of every resource', async () => {
      await service.put('c1', URL_A, new Response('1'));
      await service.put('c1', 'https://example.com/b', new Response('2'));
      expect(await service.listEntries('c1')).toEqual([
        { url: URL_A, method: 'GET' },
        { url: 'https://example.com/b', method: 'GET' },
      ]);
    });

    it('remove deletes a resource and reports missing ones', async () => {
      await service.put('c1', URL_A, new Response('1'));
      expect(await service.remove('c1', URL_A)).toBe(true);
      expect(await service.remove('c1', URL_A)).toBe(false);
      expect(await service.get('c1', URL_A)).toBeNull();
    });
  });
});
