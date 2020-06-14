<script>
import { version, description } from '../../package.json';

export default {
    data() {
        return {
            version,
            description
        };
    },

    methods: {
        onClickRedirect() {
            uni.switchTab({
                url: '/src/pages/action-1'
            });
        }
    }
};
</script>

<template>
    <view class="page-home">
        <view class="top">
            <image class="logo" src="/static/logo.png" mode="widthFix" />
            <view class="title">VIRTUAL-LIST</view>
            <view class="desc">{{ description }}</view>
            <view class="version">v{{ version }}</view>
        </view>

        <u-button :ripple="true" ripple-bg-color="#95d1b6" @click="onClickRedirect"
            >开始使用</u-button
        >
    </view>
</template>

<style lang="scss">
.page-home {
    text-align: center;
    position: relative;
    min-height: 100vh;
    overflow: hidden;

    .top {
        margin: 100rpx 0;

        .logo {
            width: 150rpx;
        }

        .title {
            font-weight: bold;
            color: $color-green;
            font-size: 60rpx;
            margin-bottom: 40rpx;
        }
    }

    // #ifdef H5
    .u-btn {
        position: absolute;
        width: calc(100% - 20rpx * 2);
        left: 50%;
        bottom: 50rpx;
        transform: translateX(-50%);
    }
    // #endif

    // #ifndef H5
    u-button {
        position: absolute;
        width: calc(100% - 20rpx * 2);
        left: 50%;
        bottom: 50rpx;
        transform: translateX(-50%);
    }
    // #endif
}
</style>
