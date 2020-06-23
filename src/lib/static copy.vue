<template>
    <view class="c-statis-virtual-list">
        <scroll-view
            class="virtual-list-container"
            :scroll-y="true"
            @scroll="onScroll"
            @scrolltoupper="onScrolltoupper"
            @scrolltolower="onScrolltolower"
        >
            <div class="container-offset" :style="getStyles">
                <slot name="header" />
                <slot />
                <slot name="footer" />
            </div>
        </scroll-view>
    </view>
</template>

<script>
import { debounce } from '../utils';

export default {
    props: {
        // list数据
        list: {
            type: Array,
            default: () => []
        },

        // v-model
        value: {
            type: Array,
            default: () => []
        },

        // // box标签 height 值
        // boxHeight: {
        //     type: [Number, String],
        //     default: 50
        // },

        // 动态组件
        dynamic: {
            type: [Boolean, String],
            default: false
        }
    },

    data() {
        return {
            // 页面上下文
            pageContext: null,

            itemSelector: null,

            // box标签 height 值
            itemHeight: 0,

            // 开始下标
            start: 0,

            // 结束下标
            end: 0,

            // 偏移数量
            offsetCount: 4,

            // 容器 height 值
            containerHeight: 0,

            // 显示偏移量
            startOffset: 0
        };
    },

    computed: {
        /**
         * 获取 list数据渲染后占的总 height 值
         */
        getListAllHeight() {
            return this.list.length * this.itemHeight;
        },

        /**
         * 获取 渲染后可显示的数量
         * 像上取整
         */
        getVisibleListCount() {
            return Math.ceil(this.containerHeight / this.itemHeight);
        },

        /**
         * 获取 渲染后真实显示的数据
         */
        getVisibleListData() {
            const start = this.start;
            const end = Math.min(this.end, this.list.length);

            return this.list.slice(start, end);
        },

        /**
         * 偏移量对应的style
         */
        getStyles() {
            return { transform: `translateY(${this.startOffset}px)` };
        }
    },

    watch: {
        /**
         * 更新 v-model 数据
         */
        getVisibleListData(val) {
            this.$emit('input', val);
        }
    },

    updated() {
        // console.log('vue-life updated');

        let query = uni.createSelectorQuery();

        // 兼容 支付宝小程序
        // #ifndef MP-ALIPAY
        query = query.in(this.pageContext);
        // #endif

        query
            .selectAll(this.itemSelector)
            .boundingClientRect()
            .exec((data) => {
                if (typeof data === 'undefined') return;

                console.log(data);
                let tempHeightSum = 0;

                data[0].forEach((item) => {
                    // console.log(item);
                    tempHeightSum += item.height;
                });

                this.itemHeight = tempHeightSum / data[0].length;

                console.log(this.itemHeight);
            });
    },

    methods: {
        /**
         * 初始化数据
         * @param {Object} o
         * @param {object} o.pageContext 容器上下文
         * @param {string} o.containerSelector 容器选择器
         * @param {string} o.itemSelector list数据遍历后每个相同的选择器
         */
        initialization({ pageContext, containerSelector, itemSelector }) {
            this.itemSelector = itemSelector;
            this.pageContext = pageContext;
            this.$_initContainer(containerSelector);
        },

        $_initContainer(selector) {
            let query = uni.createSelectorQuery();

            // 兼容 支付宝小程序
            // #ifndef MP-ALIPAY
            query = query.in(this.pageContext);
            // #endif

            query
                .select(selector)
                .boundingClientRect()
                .exec((data) => {
                    this.containerHeight = data[0].height;
                    this.end = this.start + this.getVisibleListCount;
                });
        },

        /**
         * 监听滚动条
         * @param {Object} e
         */
        onScroll(e) {
            // console.log(e);
            // 当前滚动高度
            const { scrollTop } = e.detail;

            // list的开始下标
            this.start = Math.floor(scrollTop / this.itemHeight);

            // list的结束下标
            this.end = this.start + this.getVisibleListCount + this.offsetCount;

            // 设置 scroll-view 滚动偏移量
            this.startOffset = scrollTop - (scrollTop % this.itemHeight);
        },

        /**
         * scroll-view滚动到顶部, 派发事件
         */
        // onScrolltoupper() {
        //     this.$emit('scrolltoupper', ...arguments);
        // },

        /**
         * scroll-view滚动到底部, 派发事件
         */
        // onScrolltolower() {
        //     this.$emit('scrolltolower', ...arguments);
        // }

        /**
         * scroll-view滚动到顶部, 派发事件
         */
        onScrolltoupper: debounce(function (e) {
            this.$emit('scrolltoupper', e);
        }),

        /**
         * scroll-view滚动到底部, 派发事件
         */
        onScrolltolower: debounce(function (e) {
            this.$emit('scrolltolower', e);
        })
    }
};
</script>

<style></style>
