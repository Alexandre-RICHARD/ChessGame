<template>
    <div class="loading-cache">
        <div class="loading-logo-box">
            <div />
            <div />
        </div>
    </div>
</template>

<style lang="scss">
@import "@styles/variables.scss";

.loading-cache {
    z-index: $z-index-loading-logo;
    background-color: $loading-logo-cache;
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    .loading-logo-box {
        background-color: transparent;
        position: relative;
        width: calc($loading-logo-size * 12);

        div {
            position: absolute;
            width: $loading-logo-size;
            height: $loading-logo-size;
            border-radius: calc($loading-logo-size / 2);
            background-color: $color0;
            border: 1px solid $loading-logo-transparent;

            &:nth-child(1) {
                animation: loading-animation1 1.4s infinite ease-in-out;
            }

            &:nth-child(2) {
                animation: loading-animation2 1.4s infinite ease-in-out;
            }
        }
    }

    @keyframes loading-animation1 {
        0% {
            width: $loading-logo-size;
            margin-left: 0;
        }
        10% {
            width: $loading-logo-size;
            margin-left: 0;
        }
        50% {
            width: calc($loading-logo-size * $loading-logo-size-coefficient);
            margin-left: 0;
        }
        90% {
            width: $loading-logo-size;
            margin-left: calc(
                $loading-logo-size * ($loading-logo-size-coefficient - 1)
            );
            opacity: 1;
        }
        100% {
            width: $loading-logo-size;
            margin-left: calc(
                $loading-logo-size * ($loading-logo-size-coefficient - 1)
            );
            opacity: 0;
        }
    }

    @keyframes loading-animation2 {
        0% {
            opacity: 0;
        }
        96% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }
}
</style>
