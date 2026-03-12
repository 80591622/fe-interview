# CSS 视觉效果

## 1. 如何实现三角形

利用边框实现三角形

```js
.div {
 width: 0;
 height: 0;
 border: 100px solid;
 border-color: transparent red transparent transparent;
}
```

## 2. 如何实现一个渐变背景

使用 linear-gradient 来实现渐变背景

```css
.box {
  width: 300px;
  height: 300px;
  background-image: linear-gradient(red, blue);
}
```

## 3. CSS3 中 box-shadow 有什么作用？

box-shadow 用于给元素添加阴影效果，语法为：

```css
box-shadow: h-shadow v-shadow blur spread color inset;
```

- h-shadow: 水平阴影的位置，允许负值
- v-shadow: 垂直阴影的位置，允许负值
- blur: 模糊距离
- spread: 阴影的大小
- color: 阴影的颜色
- inset: 可选，将外部阴影改为内部阴影

## 4. CSS3 中 transition 有什么作用？

transition 用于定义元素从一种状态到另一种状态的过渡效果，语法为：

```css
transition: property duration timing-function delay;
```

- property: 应用过渡效果的 CSS 属性名
- duration: 过渡效果的持续时间
- timing-function: 过渡效果的时间曲线
- delay: 过渡效果的延迟时间

## 5. CSS3 中 animation 有什么作用？

animation 用于定义元素的动画效果，需要配合 @keyframes 规则使用，语法为：

```css
animation: name duration timing-function delay iteration-count direction fill-mode play-state;
```

- name: 动画名称，对应 @keyframes 规则中的名称
- duration: 动画持续时间
- timing-function: 动画的时间曲线
- delay: 动画的延迟时间
- iteration-count: 动画的重复次数
- direction: 动画的播放方向
- fill-mode: 动画结束后的状态
- play-state: 动画的播放状态

## 6. CSS3 中 transform 有什么作用？

transform 用于对元素进行旋转、缩放、平移等变换，语法为：

```css
transform: none|transform-functions;
```

常用的 transform-functions 包括：

- rotate(angle): 旋转元素
- scale(x, y): 缩放元素
- translate(x, y): 平移元素
- skew(x-angle, y-angle): 倾斜元素
- matrix(n, n, n, n, n, n): 定义 2D 变换矩阵
- perspective(n): 定义 3D 变换的透视效果

## 7. CSS3 中 opacity 有什么作用？

opacity 用于设置元素的透明度，值范围为 0 到 1，0 表示完全透明，1 表示完全不透明。

```css
.box {
  opacity: 0.5;
}
```

## 8. CSS3 中 filter 有什么作用？

filter 用于对元素应用滤镜效果，语法为：

```css
filter: none|blur() |brightness() |contrast() |drop-shadow() |grayscale() |hue-rotate() |invert() |opacity() |saturate() |sepia();
```

- blur(): 模糊效果
- brightness(): 亮度调整
- contrast(): 对比度调整
- drop-shadow(): 阴影效果
- grayscale(): 灰度效果
- hue-rotate(): 色相旋转
- invert(): 反色效果
- opacity(): 透明度调整
- saturate(): 饱和度调整
- sepia(): sepia 效果

## 9. CSS3 中 border-radius 有什么作用？

border-radius 用于设置元素的圆角，语法为：

```css
border-radius: 1-4 length|% / 1-4 length|%;
```

可以设置 1 到 4 个值，分别对应左上角、右上角、右下角、左下角的圆角半径。

## 10. CSS3 中 text-shadow 有什么作用？

text-shadow 用于给文本添加阴影效果，语法为：

```css
text-shadow: h-shadow v-shadow blur color;
```

- h-shadow: 水平阴影的位置，允许负值
- v-shadow: 垂直阴影的位置，允许负值
- blur: 模糊距离
- color: 阴影的颜色

## 11. CSS3 中 transition 和 animation 的属性分别有哪些

_transition_ 过渡动画：

- _transition-property_：指定过渡的 _CSS_ 属性
- _transition-duration_：指定过渡所需的完成时间
- _transition-timing-function_：指定过渡函数
- _transition-delay_：指定过渡的延迟时间

_animation_ 关键帧动画：

- _animation-name_：指定要绑定到选择器的关键帧的名称
- _animation-duration_：动画指定需要多少秒或毫秒完成
- _animation-timing-function_：设置动画将如何完成一个周期
- _animation-delay_：设置动画在启动前的延迟间隔
- _animation-iteration-count_：定义动画的播放次数
- _animation-direction_：指定是否应该轮流反向播放动画
- _animation-fill-mode_：规定当动画不播放时（当动画完成时，或当动画有一个延迟未开始播放时），要应用到元素的样式
- _animation-play-state_：指定动画是否正在运行或已暂停

## 12. 如何用 css 或 js 实现多行文本溢出省略效果，考虑兼容性

CSS 实现方式

单行：

```css
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
```

多行：

```css
display: -webkit-box;
-webkit-box-orient: vertical;
-webkit-line-clamp: 3; //行数
overflow: hidden;
```

兼容：

```css
p {
  position: relative;
  line-height: 20px;
  max-height: 40px;
  overflow: hidden;
}
p::after {
  content: '...';
  position: absolute;
  bottom: 0;
  right: 0;
  padding-left: 40px;
  background: -webkit-linear-gradient(left, transparent, #fff 55%);
  background: -o-linear-gradient(right, transparent, #fff 55%);
  background: -moz-linear-gradient(right, transparent, #fff 55%);
  background: linear-gradient(to right, transparent, #fff 55%);
}
```

JS 实现方式：

- 使用split + 正则表达式将单词与单个文字切割出来存入words
- 加上 '...'
- 判断scrollHeight与clientHeight，超出的话就从words中pop一个出来

## 13. 说出 space-between 和 space-around 的区别

这个是 _flex_ 布局的内容，其实就是一个边距的区别，按水平布局来说，`space-between`是两端对齐，在左右两侧没有边距，而`space-around`是每个 子项目左右方向的 margin 相等，所以两个item中间的间距会比较大。

## 14. 如何在页面上实现一个圆形的可点击区域？

首先使用 _CSS3_ 新增的 _border-radius_ 属性来将一个区域变成圆形，然后再使用 _JS_ 来绑定事件。

## 15. 我想实现一根只有 1px 的长线怎么实现?

实现的方式很多，下面是一种参考方案：

```css
.line {
  width: 100%;
  height: 1px;
  overflow: hidden;
  font-size: 0px;
  border-bottom: dashed 1px #ccc;
}
```

```html
<div class="line"></div>
```

## 16. CSS3 新增了那些东西？

_CSS3_ 新增东西众多，这里列举出一些关键的新增内容：

- 选择器
- 盒子模型属性：_border-radius、box-shadow、border-image_
- 背景：_background-size、background-origin、background-clip_
- 文本效果：_text-shadow、word-wrap_
- 颜色：新增 _RGBA，HSLA_ 模式
- 渐变：线性渐变、径向渐变
- 字体：_@font-face_
- 2D/3D转换：_transform、transform-origin_
- 过渡与动画：_transition、@keyframes、animation_
- 多列布局
- 媒体查询
