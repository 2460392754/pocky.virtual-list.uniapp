<template>
    <scroll-view
        class="virtual-list-container"
        :scroll-y="true"
        :lower-threshold="100"
        @scroll="onScroll"
        @scrolltoupper="onScrolltoupper"
        @scrolltolower="onScrolltolower"
    >
        <view class="container-offset" :style="{ transform: getTransform }">
            <slot name="header" />
            <slot />
            <slot name="footer" />
        </view>
    </scroll-view>
</template>

<script>
import { debounce, binarySearch } from '../utils';

// 小程序端在data里保持this引用会出现错误
let _pageContext = null;

export default {
    props: {
        /**
         * list数据
         */
        list: {
            type: Array,
            default: () => []
        },

        /**
         * v-model值
         * 可渲染的list数据
         */
        value: {
            type: Array,
            default: () => []
        },

        /**
         * 缓冲区比例
         */
        bufferScale: {
            type: Number,
            default: 1,
            validator: (val) => val > 0
        },

        /**
         * item预估height值
         */
        itemHeight: {
            type: [Number, String],
            default: 100,
            validator: (val) => val > 0
        }
    },

    data() {
        return {
            // 缓存 list渲染后的节点信息
            listPosition: [],

            // 页面上下文
            pageContext: null,

            // item 选择器
            itemSelector: null,

            // 开始下标
            start: 0,

            // 结束下标
            end: 0,

            // 偏移数量
            offsetCount: 4,

            // 容器 height 值
            containerHeight: 0,

            // 显示偏移量
            startOffset: 0,

            scrollTop: 0
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
         * 获取 向上的缓冲数据数量
         */
        getAboveCount() {
            return Math.min(this.start, this.bufferScale * this.getVisibleListCount);
        },

        /**
         * 获取 向下的缓存数据数量
         */
        getBelowCount() {
            return Math.min(
                this.list.length - this.end,
                this.bufferScale * this.getVisibleListCount
            );
        },

        /**
         * 获取 渲染后真实可显示的数据
         */
        getVisibleListData() {
            const start = this.start - this.getAboveCount;
            const end = this.end + this.getBelowCount;

            return this.list.slice(start, end);
        },

        /**
         * 获取 偏移量对应的style
         */
        getTransform() {
            return `translateY(${this.startOffset}px)`;
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

    mounted() {
        console.log('=== mounted ===');
    },

    updated() {
        // list数据更新后，与缓存数据长度不相等
        if (this.list.length !== this.listPosition.length) {
            this.$_initItemPosition();
        }

        this.$nextTick(async () => {
            await this.$_updateItemSize();
            this.$_setStartOffset();
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
            _pageContext = pageContext;

            this.itemSelector = itemSelector;
            this.$_initContainer(containerSelector);
        },

        /**
         * 初始化 container 数据
         * @param {string} selector 选择器
         */
        $_initContainer(selector) {
            let query = uni.createSelectorQuery();

            // 兼容 支付宝小程序
            // #ifndef MP-ALIPAY
            query = query.in(_pageContext);
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
         * 初始化获取 item 属性
         */
        $_initItemPosition() {
            // this.listPosition = this.list.map((item, index) => {
            //     return {
            //         index,
            //         height: Number(this.itemHeight),
            //         top: this.itemHeight * index,
            //         bottom: this.itemHeight * (index + 1)
            //     };
            // });

            this.list.forEach((item, i) => {
                const index = Number(String(item.id).match(/\d+/)[0]);
                const hasIndex = this.listPosition.find((item) => item.index === index);
                const prevItem = this.listPosition[i - 1];
                const curData = this.listPosition[index];

                // 默认数据
                let height = Number(this.itemHeight);
                let top = this.itemHeight * index;
                let bottom = this.itemHeight * (index + 1);

                // 缓存 `this.list` 数据变化后一些之前的节点数据
                if (typeof curData !== 'undefined') {
                    height = curData.height;
                    top = curData.top;
                    bottom = curData.bottom;

                    // 跳过 索引为0的数据
                } else if (typeof prevItem !== 'undefined') {
                    top = prevItem.top + prevItem.height;
                    bottom = height + top;
                }

                const data = { index, height, top, bottom };

                if (typeof hasIndex === 'undefined') {
                    this.listPosition.push(data);
                } else {
                    this.listPosition[hasIndex] = data;
                }
            });
        },

        /**
         * 初始化 item 高度
         */
        $_updateItemSize() {
            return new Promise((resolve) => {
                let query = uni.createSelectorQuery();

                console.log('_updateItemSize _pageContext', _pageContext);

                // 兼容 支付宝小程序
                // #ifndef MP-ALIPAY
                query = query.in(_pageContext);
                // #endif

                query
                    .selectAll(this.itemSelector)
                    .boundingClientRect()
                    .exec((data) => {
                        if (data[0] === null) return;

                        data[0].forEach((node) => {
                            const index = Number(node.id.match(/\d+/)[0]);
                            const { height } = node;
                            const itemQuote = this.listPosition[index];

                            // 避免数据渲染时触发updated钩子，因节点未完全生成导致
                            if (typeof itemQuote === 'undefined') return true;

                            const oldHeight = itemQuote.height;
                            const dVal = oldHeight - height;

                            // console.log(
                            //     'index:',
                            //     index,
                            //     'oldH:',
                            //     height,
                            //     'newH:',
                            //     oldHeight,
                            //     'dVal:',
                            //     dVal
                            // );

                            // 当前遍历的item容器尺寸发生变化
                            if (dVal) {
                                itemQuote.bottom -= dVal;
                                itemQuote.height = height;

                                for (let i = index + 1; i < this.listPosition.length; i++) {
                                    this.listPosition[i].top = this.listPosition[i - 1].bottom;
                                    this.listPosition[i].bottom -= dVal;
                                }
                            }
                        });

                        // console.log(
                        //     'updateItemSize',
                        //     'index:',
                        //     this.start - this.getAboveCount,
                        //     'height:',
                        //     this.listPosition[this.start - this.getAboveCount].height
                        // );

                        resolve();
                    });
            });
        },

        /**
         * 设置 滚动偏移量
         * @param {number} scrollTop
         */
        $_setStartOffset(scrollTop) {
            let startOffset = 0;

            if (this.start > 0) {
                let size =
                    this.listPosition[this.start].top -
                    (this.listPosition[this.start - this.getAboveCount]
                        ? this.listPosition[this.start - this.getAboveCount].top
                        : 0);
                startOffset = this.listPosition[this.start - 1].bottom - size;
            }

            this.startOffset = startOffset;
        },

        /**
         * 监听滚动条
         * @param {Object} e
         */
        onScroll(e) {
            // 当前滚动高度
            const { scrollTop } = e.detail;

            // console.log(`%c === scroll === ${scrollTop}`, 'color:red');

            if (
                scrollTop > this.listPosition[this.start].bottom ||
                scrollTop < this.listPosition[this.start].top
            ) {
                // console.log(
                //     `%c === data === ${JSON.stringify(this.listPosition[this.start])}`,
                //     'color:blue'
                // );
                this.scrollTop = scrollTop;

                // 可视渲染的开始索引
                this.start = binarySearch(this.listPosition, scrollTop);

                // 可视渲染的结束索引
                this.end = this.start + this.getVisibleListCount + this.offsetCount;

                // 更新滚动偏移量
                this.$_setStartOffset(scrollTop);
            }
        },

        /**
         * scroll-view滚动到顶部, 派发事件
         */
        onScrolltoupper(e) {
            this.$emit('scrolltoupper', e);
        },

        /**
         * scroll-view滚动到底部, 派发事件
         */
        onScrolltolower(e) {
            this.$emit('scrolltolower', e);
        }
    }
};
</script>

<style lang="scss">
.virtual-list-container {
    .fill {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        z-index: -1;
    }

    .container-offset {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        z-index: 1;
    }
}
</style>
