import { TestBed } from '@angular/core/testing';
import { LocalStoragePanel } from './local-storage-panel';

describe('LocalStoragePanel', () => {
  beforeEach(() => localStorage.clear());

  it('saves, reads and removes a key through the public API', async () => {
    const fixture = TestBed.createComponent(LocalStoragePanel);
    const panel = fixture.componentInstance;
    panel['key'].set('demo');
    panel['value'].set('{"a":1}');
    panel['save']();
    expect(localStorage.getItem('demo')).toBe('{"a":1}');
    panel['value'].set('');
    panel['read']();
    expect(panel['value']()).toBe('{"a":1}');
    panel['remove']();
    expect(localStorage.getItem('demo')).toBeNull();
  });

  it('updates and clears all keys', () => {
    const panel = TestBed.createComponent(LocalStoragePanel).componentInstance;
    panel['key'].set('demo');
    panel['value'].set('uno');
    panel['save']();
    panel['value'].set('dos');
    panel['update']();
    expect(panel['value']()).toBe('dos');
    panel['clearAll']();
    expect(localStorage.length).toBe(0);
  });

  it('reports missing keys for read, update and remove', () => {
    const panel = TestBed.createComponent(LocalStoragePanel).componentInstance;
    panel['key'].set('missing');
    panel['read']();
    expect(panel['note']()?.text).toContain('no existe');
    panel['update']();
    expect(panel['note']()?.text).toContain('No se puede actualizar');
    panel['remove']();
    expect(panel['note']()?.text).toContain('no existe');
  });

  it('reports write errors', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    const panel = TestBed.createComponent(LocalStoragePanel).componentInstance;
    panel['key'].set('demo');
    panel['value'].set('uno');
    panel['save']();
    expect(panel['note']()?.kind).toBe('error');
  });

  it('asks for a key before saving', () => {
    const panel = TestBed.createComponent(LocalStoragePanel).componentInstance;
    panel['save']();
    expect(panel['note']()?.kind).toBe('error');
  });
});
