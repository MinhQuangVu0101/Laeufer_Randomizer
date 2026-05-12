<script lang="ts">
  import { toast } from '../stores/toast.svelte';
</script>

{#if toast.message}
  <div class="toast" role="status">{toast.message}</div>
{/if}

<style>
  .toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--text-1);
    color: var(--bg-1);
    padding: 10px 16px;
    border-radius: var(--radius);
    font-size: 0.88rem;
    font-weight: 500;
    z-index: 1000;
    pointer-events: none;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
    animation: toast-in 0.2s ease-out;
  }
  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
</style>
