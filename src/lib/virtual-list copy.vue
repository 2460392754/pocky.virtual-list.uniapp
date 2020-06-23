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
// 小程序端在data里保存this引用会出现错误
let _pageContext = null;

const throttle = function (func, wati = 1000 / 60) {
    let timer = null;

    return function () {
        if (!timer) {
            timer = setTimeout(() => {
                func.apply(this, arguments);
                timer = null;
            }, wati);
        }
    };
};

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
         * 数据预加载比例
         */
        bufferScale: {
            type: Number,
            default: 1,
            validator: (val) => val >= 0
        },

        /**
         * item预估height值
         */
        itemHeight: {
            type: [Number, String],
            default: 100,
            validator: (val) => val > 0
        },

        /**
         * item中的height是否是动态的
         */
        dynamic: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            /**
             * 缓存 list渲染后的节点信息
             */
            listPosition: [],

            /**
             * item 选择器名称
             */
            itemSelector: null,

            /**
             * 开始下标
             */
            start: 0,

            /**
             * 结束下标
             */
            end: 0,

            /**
             * 容器 height 值
             */
            containerHeight: 0,

            /**
             * 滚动条偏移量
             */
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

    updated() {
        // list数据更新后，与缓存数据长度不相等
        if (this.list.length !== this.listPosition.length) {
            this.dynamic && this.$_initItemPosition();
        }

        // dynamic状态，更新每个节点的属性值
        this.dynamic &&
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
         * dynamic状态
         */
        $_initItemPosition() {
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
         * dynamic状态
         */
        $_updateItemSize() {
            return new Promise((resolve) => {
                let query = uni.createSelectorQuery();

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

                        resolve();
                    });
            });
        },

        /**
         * 设置 滚动偏移量
         * @param {number} scrollTop 在`dynamic`为假值时，滚动条的高度
         */
        $_setStartOffset(scrollTop) {
            let startOffset = 0;

            if (!this.dynamic) {
                // 跳过 向上预加载的数据高度
                startOffset = Math.max(
                    0,
                    scrollTop - (scrollTop % this.itemHeight) - this.getAboveCount * this.itemHeight
                );

                console.log('=========');
                console.log('start: ', this.start);
                console.log('scrollTop: ', scrollTop);
                console.log('startOffset: ', this.startOffset);
                console.log('\n');
            } else if (this.start > 0) {
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
         * 二分查找
         * @param {*} list list数据
         * @param {number} value 滚动高度
         */
        $_binarySearch(list, value) {
            let start = 0;
            let end = list.length - 1;
            let tempIndex = null;

            while (start <= end) {
                let midIndex = parseInt((start + end) / 2);
                let midValue = list[midIndex].bottom;

                if (midValue === value) {
                    return midIndex + 1;
                } else if (midValue < value) {
                    start = midIndex + 1;
                } else if (midValue > value) {
                    if (tempIndex === null || tempIndex > midIndex) {
                        tempIndex = midIndex;
                    }

                    end = end - 1;
                }
            }

            return tempIndex;
        },

        /**
         * 监听滚动条
         * @param {Object} e
         */
        onScroll: throttle(function (e) {
            // 当前滚动高度
            const { scrollTop } = e.detail;

            if (this.dynamic) {
                if (
                    scrollTop > this.listPosition[this.start].bottom ||
                    scrollTop < this.listPosition[this.start].top
                ) {
                    // 可视渲染的开始索引
                    this.start = this.$_binarySearch(this.listPosition, scrollTop);

                    // 可视渲染的结束索引
                    this.end = this.start + this.getVisibleListCount;

                    // 更新滚动偏移量
                    this.$_setStartOffset();
                }
            } else {
                // list的开始下标
                this.start = Math.floor(scrollTop / this.itemHeight);

                // list的结束下标
                this.end = this.start + this.getVisibleListCount;

                // 更新滚动偏移量
                this.$_setStartOffset(scrollTop);
            }
        }, 150),

        /**
         * scroll-view滚动到顶部, 派发事件
         * @param {Object} e $event
         */
        onScrolltoupper(e) {
            this.$emit('scrolltoupper', e);
        },

        /**
         * scroll-view滚动到底部, 派发事件
         * @param {Object} e $event
         */
        onScrolltolower(e) {
            this.$emit('scrolltolower', e);
        }
    }
};
</script>

<style lang="scss">
.virtual-list-container {
    .container-offset {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        z-index: 1;
    }
}
</style>
