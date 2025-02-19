// pages/record/record.js
const app = getApp();

// 定义车牌号正则表达式
const CAR_ID_REG = /^([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[a-zA-Z](([DF]((?![IO])[a-zA-Z0-9](?![IO]))[0-9]{4})|([0-9]{5}[DF]))|[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1})$/;

Page({
    data: {
        height: null,
        carid: "",
        userlist: null,
        eligibility: "",
        userNo: null,
        preCarList: [],
        carList: [],
        recordlist: [
            { time: "没有时间记录", con: "蓄车场驶入时间" },
            { time: "没有时间记录", con: "蓄车场驶出时间" },
            { time: "没有时间记录", con: "航站楼驶入时间" },
            { time: "没有时间记录", con: "航站楼驶出时间" },
        ],
        itinerary: [
            { time: "没有时间记录", con: "行程开始时间" },
            { time: "没有时间记录", con: "行程结束时间" },
        ],
    },

    onLoad(options) {
        wx.setKeepScreenOn({ keepScreenOn: true });

        if (!app.globalData.client.connectFlag) {
            app.globalData.client.connectFlag = true;
        }

        this.setData({ height: app.globalData.pgHeight });
    },

    onShow() {
        const carid = wx.getStorageSync("carid") || null;
        if (!carid) return;

        this.search(carid);
        wx.removeStorageSync("carid");
    },

    onCarIdInput(e) {
        this.setData({ carid: e.detail.value.toUpperCase() });
    },

    // 公共处理时间记录的函数
    updateRecordList(data) {
        const recordlist = this.data.recordlist.map((record, index) => {
            switch (index) {
                case 0:
                    record.time = data.poolInTime || "没有时间记录";
                    break;
                case 1:
                    record.time = data.poolOutTime || "没有时间记录";
                    break;
                case 2:
                    record.time = data.terminalInTime || "没有时间记录";
                    break;
                case 3:
                    record.time = data.terminalOutTime || "没有时间记录";
                    break;
                default:
                    break;
            }
            return record;
        });

        this.setData({ recordlist });
    },

    // 公共的请求函数
    makeRequest(url, data, callback) {
        wx.showLoading({ title: "加载中" });

        wx.request({
            url,
            data,
            method: "GET",
            success(res) {
                console.log(res.data);
                callback(res.data);
                wx.hideLoading();
            },
            fail() {
                wx.hideLoading();
            },
        });
    },

    // 车牌号校验
    validateCarId(carid) {
        if (!CAR_ID_REG.test(carid)) {
            wx.showModal({
                content: "请输入正确车牌号",
                showCancel: false,
                confirmText: "确定",
            });
            return false;
        }
        return true;
    },

    search(carID) {
        const carid = carID || this.data.carid;
        if (!this.validateCarId(carid)) return;

        // 请求用户列表
        this.makeRequest(
            "https://tsms1.sctfia.com/user_list",
            { carid },
            (data) => {
                this.setData({ userlist: data });
            }
        );

        // 请求车辆信息和处理记录
        this.makeRequest(
            "https://tsms1.sctfia.com/car_process2",
            { carid },
            (data) => {
                const { poolInOrder, carListTop, process } = data;
                const [firstProcess] = process;
                const eligibility = firstProcess.type;

                this.updateRecordList(firstProcess);

                this.setData({
                    eligibility,
                    userNo: poolInOrder,
                    preCarList: carListTop,
                });
            }
        );
    },

    searchBtn() {
        this.search();
    },

    scanCode() {
        wx.scanCode({
            onlyFromCamera: true,
            success: (res) => {
                const carid = res.result;
                this.setData({ carid });
                this.search(carid);
            },
        });
    },
});
