import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  it('renders both storage panels', async () => {
    TestBed.configureTestingModule({ imports: [App] });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Storage Manager');
    expect(el.querySelector('app-local-storage-panel')).toBeTruthy();
    expect(el.querySelector('app-cache-storage-panel')).toBeTruthy();
  });
});
