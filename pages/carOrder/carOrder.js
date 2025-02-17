// pages/carOrder/carOrder.js
const app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        pool: {
            T1: [],
            T2: [],
            show: [],
        },
        height: null,
        timer: 0,
        switchChecked: false,
        carid: "",
        current: {
            index: -1,
            page: 0,
        },
        targetCarID: {
            index: -1,
            page: -1,
        },
    },

    onCarIdInput(e) {
        this.setData({
            carid: e.detail.value.toUpperCase()
        });
    },

    onSwiperChange(e) {
        this.setData({
            "current.page": e.detail.current,
        });
        console.log(this.data.current);
    },

    filterCarID() {
        let index = -1;
        const { carid, pool } = this.data;
        console.log(carid, pool);
        for (let page = 0; page < pool.show.length; page++) {
            console.log(pool.show[page]);
            for (let index = 0; index < pool.show[page].length; index++) {
                if (pool.show[page][index].CAR_ID == carid.toUpperCase()) {
                    console.log(page, index);
                    return this.setData({
                        ["current.index"]: index,
                        ["current.page"]: page,
                        carid: "",
                        ["targetCarID.index"]: index,
                        ["targetCarID.page"]: page,
                    });
                }
            }
        }

        wx.showToast({
            title: "没有找到匹配的车牌号",
            icon: "error",
        });
        return this.setData({
            carid: "",
        });
    },

    switchBtn(e) {
        const switchChecked = e.detail.value;
        if (switchChecked) {
            this.setData({
                switchChecked,
                ["pool.show"]: this.data.pool.T2,
            });
        } else {
            this.setData({
                switchChecked,
                ["pool.show"]: this.data.pool.T1,
            });
        }
        console.log(this.data.pool.show);
    },

    jumpTo(e) {
        console.log(e.currentTarget);
        const carid = e.currentTarget.dataset.carid;
        wx.setStorageSync("carid", carid);
        wx.switchTab({
            url: "/pages/record/record",
        });
    },

    getData() {
        const that = this;
        wx.request({
            url: "https://tsms1.sctfia.com/api/pool_in_order_top",
            method: "GET",
            data: {
                topnum: 100,
            },
            success(res) {
                const arrT1 = [],
                    arrT2 = [];
                for (let i = 0; i < res.data.T1.length; i += 25) {
                    arrT1.push(res.data.T1.slice(i, i + 25));
                }
                for (let i = 0; i < res.data.T2.length; i += 25) {
                    arrT2.push(res.data.T2.slice(i, i + 25));
                }
                that.setData({
                    ["pool.T1"]: arrT1,
                    ["pool.T2"]: arrT2,
                    ["pool.show"]: that.data.switchChecked ? arrT2 : arrT1,
                });
            },
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        const that = this;
        that.getData();
        const timer = setInterval(() => {
            that.getData();
        }, 5000);
        that.setData({
            timer,
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        const that = this;
        let height = app.globalData.pgHeight;
        const timer = setInterval(() => {}, 5000);
        this.setData({
            height,
            timer,
        });
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {},

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {},

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {},

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {},
});
