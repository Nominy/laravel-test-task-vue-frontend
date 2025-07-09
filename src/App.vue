<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <h1>&nbsp; Бизнес-аналитика</h1>
        </div>
        <nav class="main-nav">
          <RouterLink to="/stocks" class="nav-link">Stocks</RouterLink>
          <RouterLink to="/incomes" class="nav-link">Incomes</RouterLink>
          <RouterLink to="/sales" class="nav-link">Sales</RouterLink>
          <RouterLink to="/orders" class="nav-link">Orders</RouterLink>
          &nbsp;
        </nav>
      </div>
    </header>

    <main class="main-content">
      <RouterView />
    </main>

    <footer class="app-footer">
      <p>&copy; 2025 Бизнес-аналитика. Создано с помощью Vue 3 & TypeScript.</p>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8fafc;
  overflow-x: hidden;
  /* Prevent horizontal scroll */
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
}

.header-content {
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
}

.main-nav {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.nav-link {
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
}

.main-content {
  flex: 1;
  background: #f8fafc;
  min-height: calc(100vh - 140px);
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.app-footer {
  background: #1f2937;
  color: #d1d5db;
  text-align: center;
  padding: 1rem;
  font-size: 0.875rem;
  width: 100%;
}

/* Responsive breakpoints */
@media (max-width: 1024px) {
  .header-content {
    padding: 1rem 0;
  }

  .logo h1 {
    font-size: 1.375rem;
  }

  .nav-link {
    padding: 0.45rem 0.875rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 0;
    text-align: center;
  }

  .logo h1 {
    font-size: 1.25rem;
  }

  .main-nav {
    justify-content: center;
    gap: 0.25rem;
    width: 100%;
  }

  .nav-link {
    padding: 0.4rem 0.8rem;
    font-size: 0.875rem;
    flex: 1;
    text-align: center;
    max-width: 100px;
    /* Prevent links from being too wide */
  }

  .main-content {
    min-height: calc(100vh - 160px);
    /* Account for taller header */
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 0.75rem 0;
    gap: 0.75rem;
  }

  .logo h1 {
    font-size: 1.125rem;
  }

  .main-nav {
    width: 100%;
    gap: 0.125rem;
  }

  .nav-link {
    flex: 1;
    text-align: center;
    font-size: 0.8rem;
    padding: 0.375rem 0.5rem;
    max-width: none;
    /* Allow full width distribution */
  }

  .app-footer {
    padding: 0.75rem;
    font-size: 0.8rem;
  }

  .main-content {
    min-height: calc(100vh - 140px);
  }
}

/* Ensure no horizontal scrolling */
@media (max-width: 320px) {
  .header-content {
    padding: 0.5rem 0;
  }

  .logo h1 {
    font-size: 1rem;
  }

  .nav-link {
    font-size: 0.75rem;
    padding: 0.3rem 0.4rem;
  }
}
</style>
