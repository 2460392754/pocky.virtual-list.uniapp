<template>
    <view class="page-action-2">
        <u-navbar :is-back="false" title="方法2 - 动态高度" />

        <!-- <v-static-virtual-list
			ref="static"
			v-model="visibleList"
			:list="list"
			@scrolltolower="onScrolltolower"
		>
			<view v-for="item in visibleList" :key="item.id" class="box">
				<view v-for="n in item.random" :key="n">{{ item.title }}</view>
			</view>

			<u-loadmore
				v-if="loadingStatus"
				status="loading"
				icon-type="iconType"
				:load-text="{ loading: '加载中' }"
			/>
		</v-static-virtual-list>

		<view class="center">动态高度</view> -->

        <view class="center">动态高度开发中...</view>
    </view>
</template>

<script>
import VStaticVirtualList from '@/lib/static';

export default {
    components: {
        VStaticVirtualList
    },

    data() {
        return {
            list: [],
            visibleList: [],
            loadingStatus: false
        };
    },

    created() {
        this.$_mockListData();
    },

    mounted() {
        this.$refs.static.initialization('.page-action-2', this);
    },

    methods: {
        /**
         * 模拟 list 数据
         */
        $_mockListData() {
            const tempList = [];

            for (let i = 1; i <= 30; i++) {
                tempList.push({
                    id: i,
                    title: 'list-' + Number(this.list.length + i),
                    random: Math.floor(Math.random() * 2) + 1
                });
            }

            this.list = [].concat(this.list, tempList);
        },

        /**
         * 监听 滚动到底部，加载数据
         */
        onScrolltolower() {
            if (this.loadingStatus) return;
            this.loadingStatus = true;

            setTimeout(() => {
                this.$_mockListData();
                this.loadingStatus = false;
            }, 1000);
        }
    }
};
</script>

<style lang="scss">
.page-action-2 {
    /deep/ .virtual-list-container {
        margin-top: 20rpx;
        background: #f3f4f6;
        // height: 50vh;
        height: calc(100vh - 100px - 80rpx);
        overflow: scroll;
    }
}
</style>
