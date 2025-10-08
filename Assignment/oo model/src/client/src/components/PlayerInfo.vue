<!--
<template>
  <div class="player-info" :class="{ 'is-current': isCurrent, 'uno-alert': isUnoAlert }">
    <div class="player-header">
      <PlayerAvatar 
        :player-name="playerName" 
        size="medium"
        :online="true"
        :show-status="true"
      />
      <div class="player-details">
        <h4 class="player-name">
          {{ playerName }}
          <span v-if="isCurrent" class="current-badge">Playing</span>
        </h4>
        <div class="card-count">
          <div class="count-display">
            <span class="count-badge">{{ cardCount }}</span>
            <span class="count-label">{{ cardCount === 1 ? 'card' : 'cards' }}</span>
          </div>
          <div v-if="cardCount === 1" class="uno-warning">
            <span class="warning-icon">⚠️</span>
            <span>UNO!</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showActions && canCatchUno" class="player-actions">
      <button 
        @click="$emit('catch-uno')"
        class="btn-catch-uno"
      >
        <span class="catch-icon">👆</span>
        <span>Catch UNO Failure!</span>
      </button>
    </div>
    
    <div v-if="isCurrent" class="current-indicator">
      <div class="indicator-animation">
        <span class="pulse-ring"></span>
        <span class="pulse-dot"></span>
      </div>
      <span class="indicator-text">Turn in progress...</span>
    </div>

    <div class="card-fan" v-if="cardCount > 0">
      <div 
        v-for="n in Math.min(cardCount, 7)" 
        :key="n"
        class="fan-card"
        :style="getFanCardStyle(n, Math.min(cardCount, 7))"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PlayerAvatar
-->