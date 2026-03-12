# CSS 响应式设计

## 1. 如何实现响应式布局

响应式布局是指页面能够根据设备的屏幕尺寸自动调整布局，以提供更好的用户体验。实现响应式布局的方法主要有以下几种：

- 媒体查询（Media Queries）：根据设备的屏幕尺寸、方向等特性应用不同的样式
- 弹性布局（Flexbox）：使用 flex 布局实现灵活的响应式布局
- 网格布局（Grid）：使用 grid 布局实现复杂的响应式布局
- 流式布局（Fluid Layout）：使用百分比单位实现布局的自适应
- 响应式图片：根据设备的屏幕尺寸加载不同大小的图片

## 2. 媒体查询的使用方法

媒体查询的语法为：

```css
@media media-type and (media-feature) {
  /* 样式规则 */
}
```

- media-type：媒体类型，如 screen、print、all 等
- media-feature：媒体特性，如 width、height、orientation 等

**示例**

```css
/* 当屏幕宽度小于 768px 时应用的样式 */
@media screen and (max-width: 768px) {
  .container {
    width: 100%;
  }
  .sidebar {
    display: none;
  }
}

/* 当屏幕宽度在 768px 到 1024px 之间时应用的样式 */
@media screen and (min-width: 768px) and (max-width: 1024px) {
  .container {
    width: 90%;
  }
  .sidebar {
    width: 25%;
  }
}

/* 当屏幕宽度大于 1024px 时应用的样式 */
@media screen and (min-width: 1024px) {
  .container {
    width: 80%;
  }
  .sidebar {
    width: 20%;
  }
}
```

## 3. 栅格系统的实现

栅格系统是一种响应式布局的实现方式，将页面划分为若干列，通过列的组合来实现不同的布局。常见的栅格系统有 Bootstrap 的栅格系统。

**实现原理**

1. 将容器的宽度划分为 12 列
2. 每个列的宽度为容器宽度的 1/12
3. 通过设置不同的类名来指定元素在不同屏幕尺寸下占据的列数

**示例**

```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 15px;
  box-sizing: border-box;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -15px;
}

.col {
  padding: 0 15px;
  box-sizing: border-box;
}

/* 屏幕宽度大于 768px 时 */
@media screen and (min-width: 768px) {
  .col-md-1 {
    width: 8.333333%;
  }
  .col-md-2 {
    width: 16.666667%;
  }
  .col-md-3 {
    width: 25%;
  }
  .col-md-4 {
    width: 33.333333%;
  }
  .col-md-5 {
    width: 41.666667%;
  }
  .col-md-6 {
    width: 50%;
  }
  .col-md-7 {
    width: 58.333333%;
  }
  .col-md-8 {
    width: 66.666667%;
  }
  .col-md-9 {
    width: 75%;
  }
  .col-md-10 {
    width: 83.333333%;
  }
  .col-md-11 {
    width: 91.666667%;
  }
  .col-md-12 {
    width: 100%;
  }
}

/* 屏幕宽度大于 992px 时 */
@media screen and (min-width: 992px) {
  .col-lg-1 {
    width: 8.333333%;
  }
  .col-lg-2 {
    width: 16.666667%;
  }
  .col-lg-3 {
    width: 25%;
  }
  .col-lg-4 {
    width: 33.333333%;
  }
  .col-lg-5 {
    width: 41.666667%;
  }
  .col-lg-6 {
    width: 50%;
  }
  .col-lg-7 {
    width: 58.333333%;
  }
  .col-lg-8 {
    width: 66.666667%;
  }
  .col-lg-9 {
    width: 75%;
  }
  .col-lg-10 {
    width: 83.333333%;
  }
  .col-lg-11 {
    width: 91.666667%;
  }
  .col-lg-12 {
    width: 100%;
  }
}
```

## 4. 响应式图片的实现

响应式图片是指根据设备的屏幕尺寸加载不同大小的图片，以提高页面加载速度和用户体验。实现响应式图片的方法主要有以下几种：

- 使用 srcset 属性：根据设备的屏幕尺寸和像素密度加载不同的图片
- 使用 picture 元素：根据不同的媒体查询条件加载不同的图片
- 使用 CSS 媒体查询：根据设备的屏幕尺寸显示不同的图片

**示例**

```html
<!-- 使用 srcset 属性 -->
<img
  src="small.jpg"
  srcset="medium.jpg 768w, large.jpg 1024w"
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="响应式图片"
/>

<!-- 使用 picture 元素 -->
<picture>
  <source
    media="(max-width: 768px)"
    srcset="small.jpg"
  />
  <source
    media="(max-width: 1024px)"
    srcset="medium.jpg"
  />
  <img
    src="large.jpg"
    alt="响应式图片"
  />
</picture>
```

## 5. 移动优先的设计原则

移动优先的设计原则是指在设计响应式布局时，首先考虑移动设备的屏幕尺寸，然后再逐步扩展到更大的屏幕尺寸。这种设计原则可以确保页面在移动设备上有良好的用户体验，同时也可以减少代码的复杂度。

**实现方法**

1. 使用媒体查询的 min-width 条件，从移动设备开始，逐步扩展到更大的屏幕尺寸
2. 使用相对单位（如 em、rem、%）而不是绝对单位（如 px）
3. 使用弹性布局和网格布局来实现灵活的响应式布局
4. 优化图片和其他资源，确保在移动设备上的加载速度

**示例**

```css
/* 移动设备的基础样式 */
.container {
  width: 100%;
  padding: 0 15px;
  box-sizing: border-box;
}

.sidebar {
  display: none;
}

/* 平板设备的样式 */
@media screen and (min-width: 768px) {
  .container {
    width: 90%;
    margin: 0 auto;
  }
  .sidebar {
    display: block;
    width: 25%;
  }
}

/* 桌面设备的样式 */
@media screen and (min-width: 1024px) {
  .container {
    width: 80%;
  }
  .sidebar {
    width: 20%;
  }
}
```

## 6. bootstrap 响应式的原理是什么

_bootstrap_ 使用的是栅格布局。栅格布局的实现原理，是通过定义容器大小，平分 _12_ 份，再调整内外边距，最后结合媒体查询，就制作出了强大的响应式网格系统。

## 7. 如何做响应式？

可以使用 _CSS3_ 新增的媒体查询。

媒体查询的语法如下：

```css
@media mediatype and|not|only (media feature) { CSS-Code;}
```

## 8. 什么是响应式设计

响应式设计简而言之，就是一个网站能够兼容多个终端——而不是为每个终端做一个特定的版本。

优点：

- 面对不同分辨率设备灵活性强
- 能够快捷解决多设备显示适应问题

缺点：

兼容各种设备工作量大，效率低下

代码累赘，会出现隐藏无用的元素，加载时间加长

其实这是一种折中性质的设计解决方案，多方面因素影响而达不到最佳效果

一定程度上改变了网站原有的布局结构，会出现用户混淆的情况

具体步骤：

- 第一步：meta 标签

为了适应屏幕，多数的移动浏览器会把HTML网页缩放到设备屏幕的宽度。你可以使用meta标签的viewport属性来设置。下面的代码告诉浏览器使用设备屏幕宽度作为内容的宽度，并且忽视初始的宽度设置。这段代码写在 `<head>`里面

```
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

IE8及以下的浏览器不支持media query。你可以使用 media-queries.js 或 respond.js 。这样IE就能支持media query了。

```
<!--[if lt IE 9]> <script src="http://css3-mediaqueries-js.googlecode.com/svn/trunk/css3-mediaqueries.js"></script> <![endif]-->
```

- 第二步：HTML 结构

这个例子里面，有header、content、sidebar和footer等基本的网页布局。

header 有固定的高180px，content 容器的宽是600px，sidebar的宽是300px。

- 第三步：Media Queries

CSS3 media query 响应式网页设计的关键。它像一个 if 语句，告诉浏览器如何根据特定的屏幕宽口来加载网页。

下面是一个媒体查询示例代码：

```js
@media screen and (max-width: 300px) {
    body {
        background-color:lightblue;
    }
}
```

如果文档宽度小于 300 像素则修改背景演示(background-color)

## 9. 说说渐进增强和优雅降级

这并不是一个新的概念，其实就是以前提到的"向上兼容"和"向下兼容"。渐进增强相当于向上兼容，优雅降级相当于向下兼容。向下兼容指的是高版本支持低版本，或者说后期开发的版本能兼容早期开发的版本。

在确定用户群体的前提下，渐进增强：针对低版本浏览器进行页面构建，保证基本功能，再针对高级浏览器进行效果、交互等改进和追加功能，达到更好的用户体验。优雅降级：一开始就构建完整的功能，再针对低版本浏览器进行兼容。区别：优雅降级是从复杂的现状开始并试图减少用户体验的供给，而渐进增强则是从一个基础的、能够起到作用的版本开始再不断扩充，以适应未来环境的需要。

绝大多少的大公司都是采用渐进增强的方式，因为业务优先，提升用户体验永远不会排在最前面。

- 例如新浪微博网站这样亿级用户的网站，前端的更新绝不可能追求某个特效而不考虑低版本用户是否可用。一定是确保低版本到高版本的可访问性再渐进增强。
- 如果开发的是一面面向青少面的软件或网站，你明确这个群体的人总是喜欢尝试新鲜事物，喜欢炫酷的特效，喜欢把软件更新至最新版本，这种情况再考虑优雅降级。

## 10. 你能描述一下渐进增强和优雅降级之间的不同吗?

渐进增强 progressive enhancement：针对低版本浏览器进行构建页面，保证最基本的功能，然后再针对高级浏览器进行效果、交互等改进和追加功能达到更好的用户体验。

优雅降级 graceful degradation：一开始就构建完整的功能，然后再针对低版本浏览器进行兼容。

区别：优雅降级是从复杂的现状开始，并试图减少用户体验的供给，而渐进增强则是从一个非常基础的，能够起作用的版本开始，并不断扩充，以适应未来环境的需要。降级（功能衰减）意味着往回看；而渐进增强则意味着朝前看，同时保证其根基处于安全地带。
