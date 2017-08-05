# FEND03_Neighborhood-Map
The neighborhood map application is complex enough and incorporates a variety of data points that it can easily become unwieldy to manage. There are a number of frameworks, libraries and APIs available to make this process more manageable.

## 应用概述
1. 该应用是单页的街区地图网页。
2. 网页上的地图显示的是厦门市的高等教育机构分布及其信息简介。
3. 网页左侧的列表对应地图上的标记点。

## 技术概述
1. 采用面向对象语言 JavaScript 构建单个网页的街区地图应用。
2. 使用 Knockout 框架进行数据绑定，处理列表、过滤器以及页面的其他信息。
3. 调用 Google Map API 请求地图数据。
4. 调用 Wiki API 请求地点的百科数据。

## 使用方法
1. 加载页面，显示厦门市地图。地图上标注所有高等教育机构的地点。若网络出错/防火墙屏蔽，则显示无法加载地图的提示。
2. 页面左侧是可隐藏的列表，列表上的名称对应地图上的标记。点击左上角的汉堡包图标可以隐藏/显示列表。
3. 点击地图上的标记，标记将出现弹跳的动画，并在相应位置弹出 Wiki 百科关于该地点的简介框。
4. 点击简介框右上角的关闭按钮，框消失，相应标记的弹跳动画也消失。
5. 点击列表上的条目，与在地图上点击相应标记的效果相同。
6. 在列表上方的输入框输入相应的关键词，列表中的元素将自动过滤不符合条件的条目，仅显示与关键词匹配的条目。
7. 过滤结果不光在列表上发生，也相应在地图上隐藏不符合条件的标记点，仅保留符合条件的标记点。
8. 鼠标拖拽地图可以显示厦门市范围外的地图内容；鼠标滚轮亦可放大、缩小地图。

## 注意事项
1. 可能由于网络因素，加载网页需要花费一定的时间。
2. 点击图标/列表元素后加载 infoWindow 需要花费一定的时间。
