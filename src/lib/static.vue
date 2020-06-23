<template>
	<view class="c-statis-virtual-list">
		<scroll-view
			class="virtual-list-container"
			scroll-y
			@scroll="onScroll"
			@scrolltolower="onScrolltolower"
		>
			<div class="container-offset" :style="{ transform: getTransform }">
				<slot />
			</div>
		</scroll-view>
	</view>
</template>

<script>
export default {
	props: {
		// list数据
		list: {
			type: Array,
			default: () => [],
		},

		// v-model
		value: {
			type: Array,
			default: () => [],
		},

		// box标签 height 值
		boxHeight: {
			type: [Number, String],
			default: 50,
		},

		// 动态组件
		dynamic: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
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
		};
	},

	computed: {
		/**
		 * 获取 list数据渲染后占的总 height 值
		 */
		getListAllHeight() {
			return this.list.length * this.boxHeight;
		},

		/**
		 * 获取 渲染后可显示的数量
		 * 像上取整
		 */
		getVisibleListCount() {
			return Math.ceil(this.containerHeight / this.boxHeight);
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
		getTransform() {
			return `translateY(${this.startOffset}px)`;
		},
	},

	watch: {
		/**
		 * 更新 v-model 数据
		 */
		getVisibleListData(val) {
			this.$emit("input", val);
		},
	},

	methods: {
		/**
		 * 初始化数据
		 * @param {string} selector 选择器
		 * @param {object} context 上下文，页面的引用
		 */
		initialization(selector, context) {
			let query = uni.createSelectorQuery();

			// #ifndef MP-ALIPAY
			query = query.in(context);
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
			// 当前滚动高度
			const { scrollTop } = e.detail;

			// list的开始下标
			this.start = Math.floor(scrollTop / this.boxHeight);

			// list的结束下标
			this.end = this.start + this.getVisibleListCount + this.offsetCount;

			// 设置 scroll-view 滚动偏移量
			this.startOffset = scrollTop - (scrollTop % this.boxHeight);
		},

		/**
		 * scroll-view滚动到底部, 派发事件
		 * @param {Object} e $event
		 */
		onScrolltolower(e) {
			this.$emit("scrolltolower", e);
		},
	},
};
</script>

<style></style>
