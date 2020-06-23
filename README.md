# virtual-list

<p align="center">
    <img alt="logo" src="https://github.com/2460392754/pocky.virtual-list.uniapp/raw/master/static/logo.png" width="120" height="120" style="margin-bottom: 10px;">
</p>
<h3 align="center" style="margin: 30px 0 30px; font-weight: bold; font-size:40px; ">虚拟列表</h3>
<h3 align="center">一个简约的虚拟列表</h3>

## 介绍

减少大数据量列表造成卡顿，只渲染当前可视区域。

## 平台差异说明

| App     | H5  | 微信小程序 | 支付宝小程序 | 百度小程序 | 头条小程序 | QQ 小程序 | 360 小程序 |
| ------- | --- | ---------- | ------------ | ---------- | ---------- | --------- | ---------- |
| Android | √   | √          | X            | √          | √          | √         | √          |

## 如何安装

您可以使用 Yarn 或 npm 安装该软件包（选择一个）

### yarn

```bash
yarn add uniapp-virtual-list
```

### npm

```bash
npm install uniapp-virtual-list --save
```

## 基本使用

例如页面: pages/list.vue

```vue
<template>
    <view :class="pageClass">
        <v-virtual-list
            ref="virtualList"
            v-model="visibleList"
            height="500px"
            item-height="70"
            :list="list"
        >
            <view
                v-for="item in visibleList"
                :key="item.id"
                :id="'item-virtual-' + item._virtualId"
                :class="itemClass"
                :style="item._virtualStyle"
                @click="onClickItem(list, String(item._virtualId))"
            >
                <view class="content">{{ item.title }}</view>
            </view>
        </v-virtual-list>
    </view>
</template>

<script>
import VirtualList from 'uniapp-virtual-list';

export default {
    components: {
        VirtualList
    },

    data() {
        return {
            pageClass: 'page-list',
            itemClass: 'item-virtual',
            visibleList: [],
            list: [
                {
                    title: 'test-1'
                },
                {
                    title: 'test-2'
                },
                {
                    title: 'test-2'
                }
                // ...
            ]
        };
    },

    mounted() {
        this.$_initVirtualList();
    },

    methods: {
        $_initVirtualList() {
            this.$refs.virtualList.initialization({
                pageContext: this,
                containerSelector: '.' + this.pageClass,
                itemSelector: '.' + this.itemClass
            });
        },

        onClickItem(list, index) {
            // ...
        },

        /**
         * 监听 滚动到顶部，重置并加载新数据
         */
        onScrolltoupper() {
            if (this.loadingStatus.upper) return;

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
        }
    }
};
</script>
```

### 完整实例

```vue
<template>
    <view :class="pageClass">
        <v-virtual-list ref="virtualList" v-model="visibleList" item-height="70" :list="list">
            <!-- header slot 一个上拉刷新数据demo-->
            <template #header>
                <u-loadmore
                    v-if="loadingStatus.upper"
                    status="loading"
                    icon-type="iconType"
                    :load-text="{ loading: '上拉刷新中...' }"
                    @scrolltoupper="onScrolltoupper"
                    @scrolltolower="onScrolltolower"
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
                    <view class="content">{{ item.title }}</view>
                </view>
            </template>

            <!-- footer slot 一个下拉加载数据demo-->
            <template #footer>
                <u-loadmore
                    v-if="loadingStatus.lower"
                    status="loading"
                    icon-type="iconType"
                    :load-text="{ loading: '下拉加载中...' }"
                />
            </template>
        </v-virtual-list>
    </view>
</template>

<script>
import VirtualList from 'uniapp-virtual-list';

export default {
    components: {
        VirtualList
    },

    data() {
        return {
            pageClass: 'page-list',
            itemClass: 'item-virtual',
            visibleList: [],
            list: [
                {
                    title: 'test-1'
                },
                {
                    title: 'test-2'
                },
                {
                    title: 'test-2'
                }
                // ...
            ]
        };
    },

    mounted() {
        this.$_initVirtualList();
    },

    methods: {
        $_initVirtualList() {
            this.$refs.virtualList.initialization({
                pageContext: this,
                containerSelector: '.' + this.pageClass,
                itemSelector: '.' + this.itemClass
            });
        },

        onClickItem(list, index) {
            // ...
        }
    }
};
</script>
```

## 注意事项

## Api

### Props

| 属性名       | 说明                                                                                                     | 类型           | 默认值 | 是否必填 |
| ------------ | -------------------------------------------------------------------------------------------------------- | -------------- | ------ | -------- |
| list         | 列表数据                                                                                                 | Array          | []     | true     |
| v-model      | 当前可视区域内能渲染的列表数据(不需要主动传入数据，定义一个空数组就行了，用来接收可视区内的数据进行渲染) | Array          | []     | true     |
| buffer-scale | 数据预加载比例                                                                                           | Number         | 1      | -        |
| height       | 虚拟列表容器高度                                                                                         | Number、String | 300    | -        |
| item-height  | 列表中每个`item`渲染后 dom 的所占高度的预估值                                                            | Number         | 100    | -        |
| dynamic      | 列表中每个`item`渲染后的 dom 实际所占高度是否是不同的                                                    | Boolean        | false  | -        |

### Event

| 属性名        | 说明                             | 类型     | 默认值 | 是否必填 |
| ------------- | -------------------------------- | -------- | ------ | -------- |
| scrolltoupper | `scroll-view` 滚动到顶部触发事件 | Function | -      | false    |
| scrolltolower | `scroll-view` 滚动到底部触发事件 | Function | -      | false    |

### Ref

| 属性名     | 说明                                                                                     | 类型     |
| ---------- | ---------------------------------------------------------------------------------------- | -------- |
| resetCache | 在`dynamic`为`true`时，且运行`scrolltoupper`函数，需要在数据刷新完成之后进行重置插件缓存 | Function |

### Slots

| 名称    | 说明                     |
| ------- | ------------------------ |
| default | 传入列表中自定义渲染内容 |
| header  | 传入上拉刷新内容         |
| footer  | 传入下拉加载内容         |

## 预览

<img src="https://github.com/2460392754/pocky.virtual-list.uniapp/raw/master/static/qrcode.png" width="150">
