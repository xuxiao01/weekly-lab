<script setup lang="ts">
const features = ['周报沉淀', '组会汇报', 'AI 分析']
</script>

<template>
  <div class="authBrand">
    <h1 class="authBrandTitle">Weekly Lab</h1>
    <p class="authBrandDesc">
      让每周的进展，都被看见、沉淀和复盘。<br />
      把周报、组会汇报和项目进展整理成清晰的展示页，<br />
      后续还可以通过 AI 分析你的周报数据。
    </p>
    <div class="authBrandFeatures">
      <span v-for="feature in features" :key="feature" class="authBrandFeature">
        {{ feature }}
      </span>
    </div>
  </div>
</template>
