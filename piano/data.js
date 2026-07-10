// 钢琴练习视频清单
// 数据来源：piano/list.txt 的「文件夹代码:曲名」映射 + 各文件夹下的视频文件
// 命名约定：视频放在 piano/<代码>/YYYYMMDD.mp4
// 新增视频时：把 mp4 放进对应文件夹，并更新本文件对应曲目的 videos 数组
// （静态站无法在浏览器里扫描文件夹，故用此清单；list.txt 仍作为人类可读的权威映射）
window.PIANO_PIECES = [
  {
    code: "cyskdsn",
    title: "穿越时空的思念",
    composer: "和田薰（动画《犬夜叉》插曲）",
    color: "#4fd1ff",
    videos: ["20260410", "20260413", "20260705", "20260709"],
  },
  {
    code: "qyqx",
    title: "千与千寻",
    composer: "久石让（宫崎骏动画《千与千寻》主题）",
    color: "#f4c95d",
    videos: ["20260410"],
  },
];
