import { random } from '../utils';
import color from 'uview-ui/libs/function/color';

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
         */
        $_getRandomBgColor: (() => {
            let index = 0;

            return function () {
                // #1
                // const colorList = [
                //     '#ffd3b6',
                //     '#fd907c',
                //     '#ffb57e',
                //     '#ffb842',
                //     '#ffd83d',
                //     '#bbdd2f',
                //     '#abece4',
                //     '#fe7167',
                //     '#f3daa2',
                //     '#f4e976',
                //     '#b9e5fe',
                //     '#caa9e2',
                //     '#c9e9c0',
                //     '#c6ebf1',
                //     '#f4cae0',
                //     '#fe6a9e'
                // ];

                // #2
                // const colorList = ['#38beb7', '#dbe380', '#fba89a', '#fe7352', '#e86ca2'];

                // #3
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
