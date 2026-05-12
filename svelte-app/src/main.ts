import { mount } from 'svelte';
import { migrate } from './lib/migrations';
import './app.css';
import App from './App.svelte';

if (typeof localStorage !== 'undefined') {
  try {
    migrate(localStorage);
  } catch {
    // migration is best-effort — never block app boot
  }
}

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;
