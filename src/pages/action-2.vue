<template>
    <view class="page-action-2">
        <u-navbar :is-back="false" title="方法2 - 动态高度" />

        <v-static-virtual-list
            ref="static"
            v-model="visibleList"
            :list="list"
            item-height="70"
            @scrolltolower="onScrolltolower"
        >
            <!-- header slot -->
            <template #header>
                <u-loadmore
                    v-if="loadingStatus.upper"
                    status="loading"
                    icon-type="iconType"
                    :load-text="{ loading: '上拉刷新中...' }"
                />
            </template>

            <!-- default slot -->
            <template>
                <view
                    v-for="item in visibleList"
                    :key="item.id"
                    :id="'item-virtual-' + item.id"
                    :class="itemSelector"
                    dynamic="true"
                >
                    <!-- <view v-for="n in item.random" :key="n" :style="item.bg">{{ item.title }}</view> -->
                    <view class="content" :style="{ backgroundColor: item.bg }">
                        <view v-for="n in item.random" :key="n">{{ item.title }}</view>
                    </view>
                </view>
            </template>

            <!-- footer slot -->
            <template #footer>
                <u-loadmore
                    v-if="loadingStatus.lower"
                    status="loading"
                    icon-type="iconType"
                    :load-text="{ loading: '下拉加载中...' }"
                />
            </template>
        </v-static-virtual-list>

        <view class="center">动态高度</view>

        <!-- <view class="center">动态高度开发中...</view> -->
    </view>
</template>

<script>
import VStaticVirtualList from '@/lib/static';
import MPage from '../mixins/page';
import { random } from '../utils';

export default {
    name: 'PageAction2',

    mixins: [MPage],

    components: {
        VStaticVirtualList
    },

    data() {
        return {
            itemSelector: 'item-virtual'
        };
    },

    created() {
        this.$_mockListData();
    },

    mounted() {
        this.$refs.static.initialization({
            pageContext: this,
            containerSelector: '.page-action-2',
            itemSelector: '.' + this.itemSelector
        });
    },

    methods: {
        /**
         * 模拟 list 数据
         */
        $_mockListData() {
            const tempList = [];

            for (let i = 0; i < 100; i++) {
                const n = i + this.list.length;

                tempList.push({
                    id: n,
                    title: 'list-' + this.resetCount + '-' + Number(n + 1),
                    random: random(1, 3),
                    bg: this.$_getRandomBgColor()
                });
            }

            this.list = [].concat(this.list, tempList);
        }
    }
};
</script>

<style lang="scss">
.page-action-2 {
    /deep/ .virtual-list-container {
        margin-top: 20rpx;
        height: calc(100vh - 100px - 80rpx);
        overflow: scroll;
    }
}
</style>
