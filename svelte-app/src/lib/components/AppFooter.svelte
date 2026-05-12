<script lang="ts">
  const version = __APP_VERSION__;
</script>

<footer>
  <span>v{version}</span>
  <span class="dot">·</span>
  <a href="https://github.com/MinhQuangVu0101/Laeufer_Randomizer" target="_blank" rel="noopener">
    GitHub
  </a>
</footer>

<style>
  footer {
    margin-top: 32px;
    padding: 16px 0 24px;
    text-align: center;
    color: var(--text-3);
    font-size: 0.72rem;
    font-family: var(--font-mono);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
  .dot {
    opacity: 0.5;
  }
  footer a {
    color: var(--text-3);
    text-decoration: none;
    transition: color 0.15s;
  }
  footer a:hover {
    color: var(--accent);
  }
</style>
