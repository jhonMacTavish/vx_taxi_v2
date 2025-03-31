// pages/channelDetail/channelDetail.js
const app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        height: null,
        listData: [
            { id: 1, name: "苹果", type: "水果" },
            { id: 2, name: "胡萝卜", type: "蔬菜" },
            { id: 3, name: "牛肉", type: "肉类" },
            { id: 4, name: "三文鱼", type: "海鲜" },
        ],
        current: {
            statJmpTo: false,
            index: -1,
            page: 0,
        },
        timer: 0,
    },

    init(itemID) {
        const that = this;
        let terminal = "T1";
        let type = "long";
        let line = "1";

        switch (itemID) {
            case "0":
                type = "pd";
                break;
            case "1":
                break;
            case "2":
                line = "2";
                break;
            case "3":
                terminal = "T2";
                break;
            case "4":
                terminal = "T2";
                line = "2";
                break;
            case "5":
                terminal = "T2";
                type = "pd";
                break;
            default:
                break;
        }
        console.log(itemID, terminal, type, line);
        wx.request({
            url: "https://tsms1.sctfia.com/api/get_taxi_list",
            method: "GET",
            data: {
                location: "terminal",
                terminal,
                type,
                line,
            },
            success(res) {
                if (res.statusCode === 200) {
                    const arr = res.data;
                    const listData = [];
                    for (let i = 0; i < arr.length; i += 15) {
                        listData.push(arr.slice(i, i + 15));
                    }
                    that.setData({
                        listData,
                    });
                    console.log(listData);
                } else {
                    wx.showToast({
                        title: "服务异常",
                        icon: "error",
                        duration: 2000,
                    });
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: "网络异常",
                    icon: "error",
                    duration: 2000,
                });
            },
            complete() {},
        });
    },

    onSwiperChange(e) {
        this.setData({
            "current.page": e.detail.current,
        });
        console.log(this.data.current);
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        const { itemID } = options;
        let height = app.globalData.pgHeight+60;
        this.init(itemID);
        const timer = setInterval(() => {
            this.init(itemID);
            console.log("interval");
        }, 5000);
        this.setData({
            timer,
            height
        });
        console.log(timer, this.data.timer);
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        console.log("clear");
        clearInterval(this.data.timer);
    },

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
