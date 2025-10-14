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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
  align-items: center;
}

.hero-content {
  color: white;
}

.title {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.title-uno {
  font-size: 5rem;
  font-weight: 900;
  background: linear-gradient(45deg, #fbbf24, #f59e0b);
}

.title-subtitle {
  font-size: 1.5rem;
  font-weight: 600;
  opacity: 0.9;
}

.description {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  opacity: 0.9;
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
  border-radius: 0.75rem;
  font-size: 1.125rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s ease;
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