export default {
    data() {
        return {
            list: [],
            visibleList: [],
            resetCount: 0,
            loadingStatus: {
                upper: false,
                lower: false
            }
        };
    },

    methods: {
        /**
         * 点击 item 事件
         * @param {Object[]} list 数据列表
         * @param {number} index 当前的数据索引
         */
        onClickItem(list, index) {
            const item = list[index];
            const { title } = item;
            const titleList = title.split('-');

            titleList[3] || (titleList[3] = 0);
            titleList[3]++;

            item.title = titleList.join('-');
        },

        /**
         * 监听 滚动到顶部，重置并加载新数据
         */
        onScrolltoupper() {
            if (this.loadingStatus.upper) return;

            console.log('--- onScrolltoupper start ---');
            this.loadingStatus.upper = true;

            setTimeout(() => {
                this.list = [];
                this.resetCount++;
                this.$_mockListData();
                this.$refs.virtualList.resetCache();
                this.loadingStatus.upper = false;

                console.log('--- onScrolltoupper end ---');
            }, 2000);
        },

        /**
         * 监听 滚动到底部，加载数据
         */
        onScrolltolower() {
            if (this.loadingStatus.lower) return;

            console.log('--- onScrolltolower start ---');
            this.loadingStatus.lower = true;

            setTimeout(() => {
                this.$_mockListData();
                this.loadingStatus.lower = false;

                console.log('--- onScrolltolower end ---');
            }, 2000);
        },

        /**
         * 获取 随机糖果色
         * 通过闭包来处理私有变量
         */
        $_getRandomBgColor: (() => {
            let index = 0;

            return function () {
                const colorList = [
                    'rgba(65, 176, 126, 1)',
                    'rgba(65, 176, 126, 0.8)',
                    'rgba(65, 176, 126, 0.6)',
                    'rgba(65, 176, 126, 0.4)',
                    'rgba(65, 176, 126, 0.2)'
                ];

                const val = colorList[index];
                ++index === colorList.length && (index = 0);

                return val;
            };
        })()
    }
};
