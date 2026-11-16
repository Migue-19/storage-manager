import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('set / get', () => {
    it('stores and reads primitives', () => {
      expect(service.set('n', 42)).toBe(true);
      expect(service.set('s', 'hola')).toBe(true);
      expect(service.set('b', false)).toBe(true);
      expect(service.get<number>('n')).toBe(42);
      expect(service.get<string>('s')).toBe('hola');
      expect(service.get<boolean>('b')).toBe(false);
    });

    it('stores and reads objects', () => {
      const user = { name: 'Ana', tags: ['a', 'b'] };
      service.set('user', user);
      expect(service.get<typeof user>('user')).toEqual(user);
    });

    it('returns null for a missing key', () => {
      expect(service.get('nope')).toBeNull();
    });

    it('returns null when the stored JSON is corrupt', () => {
      localStorage.setItem('bad', '{not json');
      expect(service.get('bad')).toBeNull();
    });

    it('returns false when the value cannot be serialized', () => {
      const circular: Record<string, unknown> = {};
      circular['self'] = circular;
      expect(service.set('c', circular)).toBe(false);
      expect(service.set('u', undefined)).toBe(false);
      expect(service.has('c')).toBe(false);
    });

    it('returns false when the browser rejects the write', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });
      expect(service.set('k', 1)).toBe(false);
    });

    it('returns safe defaults when localStorage is unavailable', () => {
      vi.stubGlobal('localStorage', undefined);
      expect(service.set('k', 1)).toBe(false);
      expect(service.get('k')).toBeNull();
      expect(service.has('k')).toBe(false);
      expect(service.keys()).toEqual([]);
      expect(service.update('k', () => 1)).toBe(false);
      expect(() => service.remove('k')).not.toThrow();
      expect(() => service.clear()).not.toThrow();
    });

    it('returns safe defaults when accessing localStorage throws', () => {
      vi.stubGlobal('localStorage', undefined);
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        get: () => {
          throw new DOMException('Blocked', 'SecurityError');
        },
      });
      expect(service.set('k', 1)).toBe(false);
      expect(service.get('k')).toBeNull();
      expect(service.has('k')).toBe(false);
      expect(service.keys()).toEqual([]);
    });

    it('handles storage method errors without throwing', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new DOMException('Blocked', 'SecurityError');
      });
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new DOMException('Blocked', 'SecurityError');
      });
      vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => {
        throw new DOMException('Blocked', 'SecurityError');
      });
      vi.spyOn(Storage.prototype, 'length', 'get').mockReturnValue(1);
      vi.spyOn(Storage.prototype, 'key').mockImplementation(() => {
        throw new DOMException('Blocked', 'SecurityError');
      });
      expect(service.get('k')).toBeNull();
      expect(service.has('k')).toBe(false);
      expect(service.keys()).toEqual([]);
      expect(() => service.remove('k')).not.toThrow();
      expect(() => service.clear()).not.toThrow();
    });
  });

  describe('update', () => {
    it('updates an existing value', () => {
      service.set('count', 1);
      expect(service.update<number>('count', (c) => (c ?? 0) + 1)).toBe(true);
      expect(service.get<number>('count')).toBe(2);
    });

    it('receives null when the key does not exist', () => {
      service.update<number>('new', (c) => (c === null ? 10 : c));
      expect(service.get<number>('new')).toBe(10);
    });
  });

  describe('has / remove / clear / keys', () => {
    it('has detects existing and missing keys', () => {
      service.set('a', 1);
      expect(service.has('a')).toBe(true);
      expect(service.has('b')).toBe(false);
    });

    it('remove deletes a key and ignores missing ones', () => {
      service.set('a', 1);
      service.remove('a');
      service.remove('missing');
      expect(service.has('a')).toBe(false);
    });

    it('clear removes everything', () => {
      service.set('a', 1);
      service.set('b', 2);
      service.clear();
      expect(service.keys()).toEqual([]);
    });

    it('keys lists stored keys', () => {
      service.set('a', 1);
      service.set('b', 2);
      expect(service.keys().sort()).toEqual(['a', 'b']);
    });
  });
});
