<template>
  <header class="topbar">
    <div class="inner">
      <div class="brand">NANO1C的博客</div>
      <nav class="nav">
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
      </nav>
    </div>
  </header>
</template>

<style>
.topbar {
  position: sticky;
  top: 0;
  z-index: 999;
  height: var(--topbar-h);
  box-shadow: var(--theme-hover-box-shadow);
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  background-image: radial-gradient(
    transparent 1px,
    var(--theme-color-white) 1px
  );
  background-size: 4px 4px;
  backdrop-filter: saturate(50%) blur(4px);
  -webkit-backdrop-filter: saturate(50%) blur(4px);
  top: 0;
}
.inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: var(--content-w);
  margin: 0 auto;
  padding: 16px;
}
.brand {
  font-weight: 700;
  color: var(--text);
}
.nav a {
  color: var(--text);
  text-decoration: none;
  margin-left: 16px;
  padding: 6px 10px;
  border-radius: 6px;

  &:hover {
    text-shadow: var(--theme-hover-text-shadow);
  }
}
.nav a.router-link-active {
  background: var(--theme-color-active);
  border: 1px solid var(--theme-color-border);
  color: var(--theme-color-active-text);
  &:hover {
    box-shadow: var(--theme-hover-box-shadow);
  }
}
</style>
