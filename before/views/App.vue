<script setup>
import ChessGame from "@views/Page/ChessGame.vue";
import LoadingLogo from "@parts/LoadingLogo.vue";

import { useMainStore } from "@store/Main";
const MainStore = useMainStore();
const { loading } = MainStore;
</script>

<template>
    <LoadingLogo v-if="loading.loading === true" />
    <ChessGame />
</template>

<style lang="scss">
@import "@styles/variables.scss";

#app {
    font-family: $kanit;
    width: 100%;
    min-width: 200px;
    min-height: 100vh;
}
</style>
