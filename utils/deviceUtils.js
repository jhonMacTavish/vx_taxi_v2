// utils/deviceUtils.js
export const getDeviceInfo = () => {
  const systemInfo = wx.getSystemInfoSync();
  return {
    width: systemInfo.windowWidth,
    height: systemInfo.windowHeight,
    safeArea: systemInfo.safeArea
  };
};

export const getRpx = (windowWidth) => windowWidth / 750;