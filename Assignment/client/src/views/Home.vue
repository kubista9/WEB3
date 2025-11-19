<template>
  <div class="home-view">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="title">
          <span class="title-uno">UNO</span>
          <span class="title-subtitle">Online Multiplayer</span>
        </h1>
        <p class="description">
          Play the classic card game with friends around the world in real-time!
        </p>
        
        <div class="cta-buttons">
          <router-link to="/auth?mode=login" class="btn btn-primary">
            <span class="btn-icon">🎮</span>
            <span>Play Now</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
}

.hero-section {
  display: grid;
  grid-template-columns: 4fr 1fr;
  gap: 4rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
  align-items: center;
}

.title {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.title-uno {
  font-size: 5rem;
}

.title-subtitle {
  font-size: 1.5rem;
}

.description {
  margin-bottom: 2rem;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}

.btn-primary {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #1f2937;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
}

</style>