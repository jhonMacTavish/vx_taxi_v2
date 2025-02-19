class WxAuthUtils {
    static requestURL = {
        getOpenid: "https://tsms1.sctfia.com/openid",
        login: "https://tsms1.sctfia.com/login",
    };

    constructor() {}

    static request(url, data) {
        return new Promise((resolve, reject) => {
            wx.request({
                url: url,
                method: "GET",
                data: data,
                success: resolve,
                fail: (error) => reject(error),
            });
        });
    }

    static async auth(openid, url, that) {
        const requestURL = this.requestURL;
        try {
            const res = await this.request("https://tsms1.sctfia.com/login", {
                openid,
            });
            wx.hideLoading();

            let userInfo = res?.data?.[0] || null;
            wx.setStorageSync(
                "userInfo",
                typeof userInfo === "string" ? null : userInfo
            );
            userInfo = wx.getStorageSync("userInfo");

            if (!userInfo && that) {
                return this.showModal("请先注册账号", this.goToRegister);
            }

            switch (userInfo.manage) {
                case null:
                case "":
                    return this.showModal("请等待工作人员审核", () =>
                        wx.removeStorageSync("userInfo")
                    );
                case "未通过":
                    return this.showModal("审核未通过，请重新注册", () => {
                        wx.navigateTo({ url: "../index/index" });
                        wx.removeStorageSync("userInfo");
                    });
                case "管理员":
                    if (!that) {
                        return wx.switchTab({
                            url: "/pages/airportInfo/airportInfo",
                        });
                    }
                    that.setData({ list: that.data.allList.manager });

                    url =
                        url === "/pages/eligibility/eligibility"
                            ? "/pages/record/record"
                            : url === "/pages/mine/mine"
                            ? "/pages/manager/manager"
                            : url;
            }
            if (url) wx.switchTab({ url });
        } catch (error) {
            console.log(error);
            return this.showToast("网络异常");
        }
    }

    static async login(url, that) {
        const requestURL = this.requestURL;
        const openid = wx.getStorageSync("openid");

        if (!openid) {
            try {
                const { code } = await wx.login();
                const res = await this.request(
                    "https://tsms1.sctfia.com/openid",
                    { code }
                );

                if (res?.statusCode === 200) {
                    const newOpenid = res.data.openid;
                    wx.setStorageSync("openid", newOpenid);
                    return this.auth(newOpenid, url, that);
                } else {
                    return this.showToast("服务异常");
                }
            } catch (error) {
                console.log(error);
                return this.showToast("网络异常");
            }
        }

        return this.auth(openid, url, that);
    }

    // 下面是工具类中的一些提示方法，假设你已经有实现
    static showToast(message) {
        wx.showToast({
            title: message,
            icon: "none",
        });
    }

    static showModal(content, confirmCallback) {
        wx.showModal({
            title: "提示",
            content: content,
            success(res) {
                if (res.confirm && confirmCallback) {
                    confirmCallback();
                }
            },
        });
    }

    static goToRegister() {
        wx.navigateTo({
            url: "/pages/index/index",
        });
    }
}

export default WxAuthUtils;
