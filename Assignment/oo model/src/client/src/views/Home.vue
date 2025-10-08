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
          <router-link to="/auth?mode=register" class="btn btn-secondary">
            <span class="btn-icon">✨</span>
            <span>Create Account</span>
          </router-link>
        </div>
      </div>
      
      <div class="hero-illustration">
        <div class="card-showcase">
          <div 
            v-for="(card, index) in showcaseCards" 
            :key="index"
            class="showcase-card"
            :class="card.color"
            :style="{ 
              transform: `rotate(${card.rotation}deg) translateY(${card.offsetY}px)`,
              animationDelay: `${index * 0.2}s`
            }"
          >
            <div class="card-value">{{ card.value }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="features-section">
      <h2 class="section-title">Why Play UNO Online?</h2>
      <div class="features-grid">
        <div v-for="feature in features" :key="feature.title" class="feature-card">
          <div class="feature-icon">{{ feature.icon }}</div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const showcaseCards = [
  { value: '7', color: 'card-red', rotation: -15, offsetY: 0 },
  { value: 'SKIP', color: 'card-blue', rotation: -5, offsetY: -20 },
  { value: '3', color: 'card-green', rotation: 5, offsetY: 0 },
  { value: '+2', color: 'card-yellow', rotation: 15, offsetY: -20 },
  { value: 'WILD', color: 'card-wild', rotation: 0, offsetY: -40 }
]

const features = [
  {
    icon: '🌍',
    title: 'Global Multiplayer',
    description: 'Play with friends or match with players from around the world in real-time'
  },
  {
    icon: '⚡',
    title: 'Real-time Updates',
    description: 'Experience smooth gameplay with instant synchronization across all devices'
  },
  {
    icon: '🏆',
    title: 'Track Your Progress',
    description: 'Keep track of your wins, scores, and climb the leaderboard'
  },
  {
    icon: '🎯',
    title: 'Official Rules',
    description: 'Play with authentic UNO rules including all special cards and penalties'
  }
]
</script>

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
  letter-spacing: 0.1em;
  background: linear-gradient(45deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 4px 20px rgba(251, 191, 36, 0.5);
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

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.5rem;
}

.hero-illustration {
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-showcase {
  position: relative;
  width: 400px;
  height: 400px;
}

.showcase-card {
  position: absolute;
  width: 100px;
  height: 150px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  left: 50%;
  top: 50%;
  margin-left: -50px;
  margin-top: -75px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.card-value {
  font-size: 2rem;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.card-red {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.card-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.card-green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.card-yellow {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.card-wild {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #ec4899 100%);
}

.features-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 4rem 2rem;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  transition: transform 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.feature-card:hover {
  transform: translateY(-5px);
  border-color: rgba(251, 191, 36, 0.5);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.75rem;
}

.feature-description {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero-section {
    grid-template-columns: 1fr;
  }
  
  .title-uno {
    font-size: 3rem;
  }
}
</style>