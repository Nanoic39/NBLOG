<template>
  <div class="sidebar-wrap">
    <section class="card base-info">
      <div class="avatar">
        <img src="@/static/Avatar.png" alt="Nanoic" />
      </div>
      <div class="info">
        <h2>Nanoic</h2>
        <p>
          <span
            style="
              border-radius: 5px;
              border: 1px solid var(--bg);
              padding: 2px 4px;
              background-color: var(--bg);
            "
            >Java</span
          >后端开发工程师
        </p>
      </div>
    </section>
  </div>
</template>

<style>
.sidebar-wrap {
  max-height: calc(100vh - var(--topbar-h) - var(--gap) * 2);
  overflow: auto;
  border: 1px solid var(--border);
}
.card {
  border-bottom: 1px dashed var(--border);
  padding-bottom: 12px;
  margin-bottom: 12px;
}
.card:last-child {
  border-bottom: 0;
  margin-bottom: 0;
  padding-bottom: 0;
}
.avatar img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
}
.info h2 {
  font-size: 16px;
  margin: 8px 0 4px;
}
.info p {
  margin: 0;
  color: black;
}
</style>
