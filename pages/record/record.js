// pages/manager/manager.js
const app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        height: null,
        carid: "",
        userlist: null,
        eligibility: "",
        carList: [],
        recordlist: [
            {
                time: "没有时间记录",
                con: "蓄车场驶入时间",
            },
            {
                time: "没有时间记录",
                con: "蓄车场驶出时间",
            },
            {
                time: "没有时间记录",
                con: "航站楼驶入时间",
            },
            {
                time: "没有时间记录",
                con: "航站楼驶出时间",
            },
        ],
        itinerary: [
            {
                time: "没有时间记录",
                con: "行程开始时间",
            },
            {
                time: "没有时间记录",
                con: "行程结束时间",
            },
        ],
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        wx.setKeepScreenOn({
            keepScreenOn: true,
        });
        if (!app.globalData.client.connectFlag) {
            //console.log(app.globalData.client.connectFlag);
            app.globalData.client.connectFlag = true;
            // app.watch('onWayData', this.watchBack);
        }

        let height = app.globalData.pgHeight;
        this.setData({
            height,
        });
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        const carid = wx.getStorageSync("carid") || null;
        if (!carid) {
            return;
        }
        console.log(carid);
        this.search(carid);
        wx.removeStorageSync("carid");
    },

    onCarIdInput(e) {
        console.log(e);
        this.setData({
            carid: e.detail.value.toUpperCase(),
        });
    },

    watchBack: function (name, value) {
        let data = {};
        data[name] = value;
        //console.log(value);
        if (name == "onWayData")
            this.setData({
                carlist: value,
            });
    },
    search(carID) {
        let that = this;
        let carid = carID ? carID : this.data.carid;
        console.log(carid);
        let reg = /^([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[a-zA-Z](([DF]((?![IO])[a-zA-Z0-9](?![IO]))[0-9]{4})|([0-9]{5}[DF]))|[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1})$/;
        if (!reg.test(carid)) {
            wx.showModal({
                content: "请输入正确车牌号",
                showCancel: false,
                confirmText: "确定",
            });
            return;
        }
        wx.showLoading({
            title: "加载中",
        });
        wx.request({
            url: "https://tsms1.sctfia.com/user_list",
            data: {
                carid,
            },
            method: "GET",
            success(res) {
                console.log(res.data);
                that.setData({
                    userlist: res.data,
                });
                wx.hideLoading();
            },
        });
        wx.request({
            url: "https://tsms1.sctfia.com/car_process",
            data: {
                carid,
            },
            method: "GET",
            success(res) {
                console.log(res.data);
                let data = res.data.process[0];
                let arr = that.data.recordlist;
                let eligibility = data.type;
                console.log(data);

                for (let i = 0; i < 4; i++) {
                    switch (i) {
                        case 0:
                            console.log(data.poolInTime);
                            arr[i].time = data.poolInTime
                                ? data.poolInTime
                                : "没有时间记录";
                            break;
                        case 1:
                            console.log(data.poolOutTime);
                            arr[i].time = data.poolOutTime
                                ? data.poolOutTime
                                : "没有时间记录";
                            break;
                        case 2:
                            console.log(data.terminalInTime);
                            arr[i].time = data.terminalInTime
                                ? data.terminalInTime
                                : "没有时间记录";
                            break;
                        case 3:
                            console.log(data.terminalOutTime);
                            arr[i].time = data.terminalOutTime
                                ? data.terminalOutTime
                                : "没有时间记录";
                            break;
                        default:
                            break;
                    }
                }
                that.setData({
                    recordlist: arr,
                    eligibility,
                });
            },
        });
    },

    searchBtn(){
        let that = this;
        let carid = this.data.carid;
        console.log(carid);
        let reg = /^([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[a-zA-Z](([DF]((?![IO])[a-zA-Z0-9](?![IO]))[0-9]{4})|([0-9]{5}[DF]))|[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1})$/;
        if (!reg.test(carid)) {
            wx.showModal({
                content: "请输入正确车牌号",
                showCancel: false,
                confirmText: "确定",
            });
            return;
        }
        wx.showLoading({
            title: "加载中",
        });
        wx.request({
            url: "https://tsms1.sctfia.com/user_list",
            data: {
                carid,
            },
            method: "GET",
            success(res) {
                console.log(res.data);
                that.setData({
                    userlist: res.data,
                });
                wx.hideLoading();
            },
        });
        wx.request({
            url: "https://tsms1.sctfia.com/car_process",
            data: {
                carid,
            },
            method: "GET",
            success(res) {
                console.log(res.data);
                let data = res.data.process[0];
                let arr = that.data.recordlist;
                let eligibility = data.type;
                console.log(data);

                for (let i = 0; i < 4; i++) {
                    switch (i) {
                        case 0:
                            console.log(data.poolInTime);
                            arr[i].time = data.poolInTime
                                ? data.poolInTime
                                : "没有时间记录";
                            break;
                        case 1:
                            console.log(data.poolOutTime);
                            arr[i].time = data.poolOutTime
                                ? data.poolOutTime
                                : "没有时间记录";
                            break;
                        case 2:
                            console.log(data.terminalInTime);
                            arr[i].time = data.terminalInTime
                                ? data.terminalInTime
                                : "没有时间记录";
                            break;
                        case 3:
                            console.log(data.terminalOutTime);
                            arr[i].time = data.terminalOutTime
                                ? data.terminalOutTime
                                : "没有时间记录";
                            break;
                        default:
                            break;
                    }
                }
                that.setData({
                    recordlist: arr,
                    eligibility,
                });
            },
        });
    },
    
    scanCode() {
        let that = this;
        wx.scanCode({
            onlyFromCamera: true,
            success(res) {
                let carid = res.result;
                that.setData({
                    carid: res.result,
                });
                that.search();
            },
        });
    },
});
