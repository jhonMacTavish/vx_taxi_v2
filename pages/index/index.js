// index.js
const app = getApp();
import WxValidate from "../../utils/WxValidate";

Page({
    data: {
        content: "获取验证码",
        sendColor: "#363636",
        snsMsgWait: 60,
        smsFlag: false,
        binding: false,
        loading: false,
        checkbox: false,
        form: {
            name: null,
            phone: null,
            carid: "川A",
            captcha: null,
        },
        flag: true,
        lock: false,
        lastVal: "",
        gongsi_select: 0,
        gongsi_list: ["加载中请稍等..."],
        companiesFilter: ["加载中请稍等..."],
        pic_xsz: null,
        pic_fwz: null,
        searchValue: "",
        selectIndex: 0,
        setValues: "",
        sourceType: ["camera", "album"],
    },

    onLoad(e) {
        this.setData({
            gongsi_select: wx.getStorageSync("gongsi_select") || 0,
        });
        this.initValidate();
        this.loadCompanies();
    },

    // 载入公司列表
    loadCompanies() {
        wx.request({
            url: "https://tsms1.sctfia.com/b_gongsi",
            method: "GET",
            success: (res) => {
                this.setData({
                    gongsi_list: res.data,
                    companiesFilter: res.data,
                });
            },
        });
    },

    // 显示选择框
    showSelector() {
        let companiesFilter = this.data.gongsi_list;
        if (companiesFilter[0].includes("加载中")) {
            this.loadCompanies();
        }
        this.setData({
            flag: false,
            lock: false,
            searchValue: this.data.lastVal,
            selectIndex: this.data.gongsi_list.indexOf(this.data.lastVal),
        });
    },

    // 取消选择
    cancel() {
        this.setData({
            flag: true,
            searchValue: this.data.lastVal,
            companiesFilter: this.data.gongsi_list,
        });
    },

    // 确认选择
    confirm() {
        let companiesFilter = this.data.companiesFilter;
        if (companiesFilter.length) {
            this.setData({
                searchValue: companiesFilter[this.data.selectIndex],
            });
        }
        this.setData({
            flag: true,
            lock: true,
            companiesFilter: this.data.gongsi_list,
            lastVal: this.data.searchValue,
        });
    },

    // 选择框变化
    bindChange(e) {
        if (!this.data.lock && e.detail.value.length) {
            this.setData({
                selectIndex: e.detail.value[0],
                searchValue: this.data.companiesFilter[e.detail.value[0]],
            });
        }
    },

    // 搜索公司
    searchList(e) {
        const searchValue = e.detail.value.trim();
        const companiesFilter = this.data.gongsi_list.filter((item) =>
            item.includes(searchValue)
        );
        this.setData({
            companiesFilter,
            searchValue,
        });
    },

    // 获取手机号
    getphone(e) {
        this.setData({
            ["form.phone"]: e.detail.value,
        });
    },

    // 获取验证码
    getCaptcha(e) {
        this.setData({
            ["form.captcha"]: e.detail.value,
        });
    },

    // 公司选择
    gongsi_picker(e) {
        wx.setStorageSync("gongsi_select", e.detail.value);
        this.setData({
            gongsi_select: e.detail.value,
        });
    },

    // 发送验证码
    sendCaptcha() {
        const phone = this.data.form.phone;
        const reg = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
        if (!reg.test(phone)) {
            wx.showModal({
                content: "请输入正确手机号",
                showCancel: false,
                confirmText: "确定",
            });
            return;
        }

        wx.request({
            url: "https://tsms1.sctfia.com/captcha_send",
            method: "GET",
            data: { phone },
            success: () => this.startCaptchaTimer(),
        });
    },

    // 启动验证码倒计时
    startCaptchaTimer() {
        this.setData({
            smsFlag: true,
            sendColor: "#838383",
            content: `${this.data.snsMsgWait}s后重发`,
            snsMsgWait: this.data.snsMsgWait - 1,
        });

        const interval = setInterval(() => {
            this.setData({
                content: `${this.data.snsMsgWait}s后重发`,
                snsMsgWait: this.data.snsMsgWait - 1,
            });
            if (this.data.snsMsgWait < 0) {
                clearInterval(interval);
                this.setData({
                    sendColor: "#363636",
                    content: "获取验证码",
                    snsMsgWait: 60,
                    smsFlag: false,
                });
            }
        }, 1000);
    },

    // 显示提示
    showModal(error) {
        wx.showModal({
            content: error.msg,
            showCancel: false,
        });
    },

    // 初始化验证规则
    initValidate() {
        const rules = {
            name: { required: true, name: true },
            carid: { required: true, carid: true },
            phone: { required: true, phone: true },
            captcha: { required: true, captcha: true },
        };
        const messages = {
            name: { required: "请填写姓名", name: "请输入正确的姓名" },
            carid: { required: "请填写车牌号", carid: "请输入正确的车牌号" },
            phone: { required: "请输入手机号", phone: "请输入正确的手机号" },
            captcha: { required: "请填写验证码", captcha: "请输入4位数验证码" },
        };
        this.WxValidate = new WxValidate(rules, messages);
        this.addCustomMethods();
    },

    // 添加自定义验证规则
    addCustomMethods() {
        this.WxValidate.addMethod(
            "name",
            (value) =>
                /^[\u4E00-\u9FA5]{2,10}(·[\u4E00-\u9FA5]{2,10}){0,2}$/.test(
                    value
                ),
            "请输入正确的姓名"
        );
        this.WxValidate.addMethod(
            "carid",
            (value) =>
                /^([川A-Z]{1}[a-zA-Z](([DF]((?![IO])[a-zA-Z0-9](?![IO]))[0-9]{4})|([0-9]{5}[DF]))|[川A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1})$/.test(
                    value
                ),
            "请输入正确的车牌号"
        );
        this.WxValidate.addMethod(
            "phone",
            (value) =>
                /^(1[3-9])\d{9}$/.test(value),
            "请输入正确的手机号"
        );
        this.WxValidate.addMethod(
            "captcha",
            (value) => /^\d{4}$/.test(value),
            "请输入4位数验证码"
        );
    },

    // 表单提交
    formSubmit(e) {
        const params = e.detail.value;
        params.carid = params.carid.toUpperCase().replace(/\s+/g, "");
        params.name = params.name.replace(/\s+/g, "");

        if (!this.validateForm(params)) return;

        params.xsz = this.data.pic_xsz;
        params.fwz = this.data.pic_fwz;
        this.register(params);
    },

    // 校验表单
    validateForm(params) {
        if (
            !this.data.pic_xsz ||
            !this.data.pic_fwz ||
            !this.data.searchValue
        ) {
            this.showModal({ msg: "请上传相关证件或填写必要信息" });
            return false;
        }

        if (!this.WxValidate.checkForm(params)) {
            const error = this.WxValidate.errorList[0];
            this.showModal(error);
            return false;
        }

        if (!this.data.checkbox) {
            this.showModal({ msg: "请阅读并同意《用户协议》及《隐私协议》" });
            return false;
        }

        return true;
    },

    // 用户注册
    register(params) {
        wx.showLoading({ title: "注册中..." });
        this.setData({ loading: true });

        wx.request({
            url: "https://tsms1.sctfia.com/user_exist",
            method: "GET",
            data: { phone: params.phone },
            success: (res) => this.handleRegistration(res, params),
        });
    },

    // 处理注册结果
    handleRegistration(res, params) {
        const openid = wx.getStorageSync("openid") || null;
        params.openid = openid;

        wx.request({
            url: "https://tsms1.sctfia.com/register",
            method: "POST",
            data: params,
            success: (res) => {
                this.setData({ loading: false });
                wx.hideLoading();

                let content = "";
                if (res.data === "success") {
                    content = "注册成功";
                    wx.showModal({
                        content,
                        showCancel: false,
                        confirmText: "确定",
                        success: () =>
                            wx.navigateTo({ url: "../announce/announce" }),
                    });
                } else {
                    content =
                        res.data === "captcha_error"
                            ? "验证码错误"
                            : "注册失败";
                    wx.showModal({
                        content,
                        showCancel: false,
                        confirmText: "确定",
                    });
                }
            },
        });
    },

    // 处理车牌号输入
    handleCarIdInput(e) {
        this.setData({
            "form.carid": e.detail.value.toUpperCase(),
        });
    },

    // 图片选择
    buttonclick(e) {
        const tag = e.currentTarget.dataset.tag;
        wx.showActionSheet({
            itemList: ["拍照", "相册"],
            success: (res) => this.chooseImage(res.tapIndex, tag),
        });
    },

    // 选择图片
    chooseImage(tapIndex, tag) {
        wx.chooseImage({
            count: 1,
            sizeType: ["original", "compressed"],
            sourceType: [this.data.sourceType[tapIndex]],
            success: (res) => this.handleImageSelection(res, tag),
        });
    },

    // 处理图片选择
    handleImageSelection(res, tag) {
        const tempFilePaths = res.tempFilePaths;
        wx.setStorageSync("tempFilePaths", tempFilePaths);

        wx.getFileSystemManager().readFile({
            filePath: tempFilePaths[0],
            encoding: "base64",
            success: (res) => {
                const base64Img = `data:image/png;base64,${res.data}`;
                this.setData({ [`pic_${tag}`]: base64Img });
                this.getToLocal(base64Img);
            },
        });
    },

    // 保存图片到本地
    getToLocal(base64Img) {
        const fsm = wx.getFileSystemManager();
        const FILE_BASE_NAME = "tmp_base64src";
        const [, format, bodyData] =
            /data:image\/(\w+);base64,(.*)/.exec(base64Img) || [];
        if (!format) return;

        const filePath = `${wx.env.USER_DATA_PATH}/${FILE_BASE_NAME}.${format}`;
        const buffer = wx.base64ToArrayBuffer(bodyData);
        fsm.writeFile({
            filePath,
            data: buffer,
            encoding: "binary",
            success: () => this.setData({ base64ImgPath: filePath }),
            fail: () => new Error("ERROR_BASE64SRC_WRITE"),
        });
    },
});
