<script setup lang="ts">
import logoUrl from '@/assets/images/weekly-lab-logo.png'
import ProductIntro from './ProductIntro.vue'
import AuthCard from './AuthCard.vue'
import '@/styles/auth.css'
</script>

<template>
  <div class="authPage">
    <header class="authHeader">
      <router-link to="/" class="authHeaderLogo">
        <img :src="logoUrl" alt="Weekly Lab" width="28" height="28" />
        <span>Weekly Lab</span>
      </router-link>
      <router-link to="/" class="authHeaderHome">返回首页</router-link>
    </header>

    <main class="authMain">
      <section class="authIntro">
        <ProductIntro />
      </section>
      <section class="authPanel">
        <AuthCard>
          <slot />
        </AuthCard>
      </section>
    </main>
  </div>
</template>
