<template>
    <view :class="pageClass">
        <u-navbar :is-back="false" title="方法1 - 固定高度" />

        <v-virtual-list
            ref="virtualList"
            v-model="visibleList"
            item-height="70"
            height="calc(100vh - 100px - 80rpx)"
            :list="list"
            @scrolltoupper="onScrolltoupper"
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
                    :id="'item-virtual-' + item._virtualId"
                    :class="itemClass"
                    :style="item._virtualStyle"
                    @click="onClickItem(list, String(item._virtualId))"
                >
                    <view class="content" :style="{ backgroundColor: item.bg }">{{
                        item.title
                    }}</view>
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
        </v-virtual-list>

        <view class="center">静态高度</view>
    </view>
</template>

<script>
import VVirtualList from '../lib/virtual-list';
import MPage from '../mixins/page';

export default {
    name: 'PageStatic',

    mixins: [MPage],

    components: {
        VVirtualList
    },

    data() {
        return {
            pageClass: 'page-static',
            itemClass: 'item-virtual'
        };
    },

    created() {
        this.$_mockListData();
    },

    mounted() {
        this.$refs.virtualList.initialization({
            pageContext: this,
            containerSelector: '.' + this.pageClass,
            itemSelector: '.' + this.itemClass
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
                    // _virtualId: n,
                    title: 'list-' + this.resetCount + '-' + n,
                    bg: this.$_getRandomBgColor()
                });
            }

            this.list = [].concat(this.list, tempList);
        }
    }
};
</script>

<style lang="scss">
.page-static {
    /deep/ .virtual-list {
        margin-top: 20rpx;
        // height: calc(100vh - 100px - 80rpx);
    }
}
</style>
