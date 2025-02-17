// custom-tab-bar/index.js
import WxAuthUtils from "./../../utils/WxAuthUtils";

Component({
    data: {
        currentPage: "",
        color: "#B9B9B9",
        selectedColor: "#07C160",
        borderStyle: "black",
        backgroundColor: "#ffffff",
        allList: {
            user: [
                {
                    pagePath: "/pages/airportInfo/airportInfo",
                    iconPath: "/imgs/airportInfo_logout.png",
                    selectedIconPath: "/imgs/airportInfo_active.png",
                    text: "车场",
                },
                {
                    pagePath: "/pages/eligibility/eligibility",
                    iconPath: "/imgs/eligibility_logout.png",
                    selectedIconPath: "/imgs/eligibility_active.png",
                    text: "资格",
                },
                {
                    pagePath: "/pages/eligibtDetial/eligibtDetial",
                    iconPath: "/imgs/list_logout.png",
                    selectedIconPath: "/imgs/list_active.png",
                    text: "近程公示",
                },
                {
                    pagePath: "/pages/mine/mine",
                    iconPath: "/imgs/mine_logout.png",
                    selectedIconPath: "/imgs/mine_active.png",
                    text: "我的",
                },
            ],
            manager: [
                {
                    pagePath: "/pages/airportInfo/airportInfo",
                    iconPath: "/imgs/airportInfo_logout.png",
                    selectedIconPath: "/imgs/airportInfo_active.png",
                    text: "车场",
                },
                {
                    pagePath: "/pages/record/record",
                    iconPath: "/imgs/record_logout.png",
                    selectedIconPath: "/imgs/record_active.png",
                    text: "详情",
                },
                {
                    pagePath: "/pages/carOrder/carOrder",
                    iconPath: "/imgs/list_logout.png",
                    selectedIconPath: "/imgs/list_active.png",
                    text: "车池排序",
                },
                {
                    pagePath: "/pages/manager/manager",
                    iconPath: "/imgs/manage_logout.png",
                    selectedIconPath: "/imgs/manage_active.png",
                    text: "车队",
                },
            ],
        },
        list: [],
    },

    attached() {
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1]?.route || "";
        const userInfo = wx.getStorageSync("userInfo") || { manage: "" };

        this.setData({
            currentPage,
            list:
                userInfo.manage === "管理员"
                    ? this.data.allList.manager
                    : this.data.allList.user,
        });
    },

    methods: {
        async switchTab(e) {
            const url = e.currentTarget.dataset.path;
            const restrictedPages = new Set([
                "/pages/airportInfo/airportInfo",
                "/pages/eligibtDetial/eligibtDetial",
            ]);

            if (!restrictedPages.has(url)) {
                const userInfo = wx.getStorageSync("userInfo");

                if (!userInfo) {
                    wx.showLoading({ title: "验证用户信息" });
                    return WxAuthUtils.login(url, this);
                }

                switch (userInfo.manage) {
                    case null:
                    case "":
                        return WxAuthUtils.showModal("请等待工作人员审核", () =>
                            wx.removeStorageSync("userInfo")
                        );
                    case "未通过":
                        return WxAuthUtils.showModal("审核未通过，请重新注册", () => {
                            wx.navigateTo({ url: "../index/index" });
                            wx.removeStorageSync("userInfo");
                        });
                    default:
                        break;
                }
            }

            wx.switchTab({ url });
        },
    },
});
