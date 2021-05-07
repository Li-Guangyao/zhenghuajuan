Component({
    /**
     * 组件的属性列表
     * 里面存放的是 要从父组件中接收的数据
     */
    properties: {
        tabbar: {
            type: Array,
            value: []
        }
    },

    /**
     * 组件的初始数据
     */
    data: {},

    /**
     * 组件的方法列表
     */
    methods: {
        handleTabbarTap(e) {
            // 组件触发事件时,逻辑层绑定该事件的处理函数会收到一个事件对象,在这里就是e
            // js文件代表逻辑层,我感觉一个js文件就是一个类/对象,所以在下面可以用this.data,就代表上面的data
            // currentTarget代表事件绑定的当前组件,id是当前组件的id,dataset是当前组件上由data-开头的自定义属性组成的集合
            // 如果我前面写了data-indexa=index，所以这里dataset.indexa就是index的值
            const {index} = e.currentTarget.dataset;
            // let tabbar=this.data.tabbar;

            // tabbar.forEach((v,i)=>i===index?v.isChosen=true:v.isChosen=false);
            // this.setData({
            // 	tabbar
            // })
            // console.log({index});
            this.triggerEvent("tabbarChange", {index});
        },
    }
})