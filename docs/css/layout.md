# CSS 布局

## 1. flex 布局如何使用？

flex 是 Flexible Box 的缩写，意为"弹性布局"。指定容器display: flex即可。

容器有以下属性：flex-direction，flex-wrap，flex-flow，justify-content，align-items，align-content。

- flex-direction属性决定主轴的方向；
- flex-wrap属性定义，如果一条轴线排不下，如何换行；
- flex-flow属性是flex-direction属性和flex-wrap属性的简写形式，默认值为row nowrap；
- justify-content属性定义了项目在主轴上的对齐方式。
- align-items属性定义项目在交叉轴上如何对齐。
- align-content属性定义了多根轴线的对齐方式。如果项目只有一根轴线，该属性不起作用。

项目（子元素）也有一些属性：order，flex-grow，flex-shrink，flex-basis，flex，align-self。

- order属性定义项目的排列顺序。数值越小，排列越靠前，默认为0。
- flex-grow属性定义项目的放大比例，默认为0，即如果存在剩余空间，也不放大。
- flex-shrink属性定义了项目的缩小比例，默认为1，即如果空间不足，该项目将缩小。
- flex-basis属性定义了在分配多余空间之前，项目占据的主轴空间（main size）。
- flex属性是flex-grow, flex-shrink 和 flex-basis的简写，默认值为0 1 auto。后两个属性可选。
- align-self 属性允许单个项目有与其他项目不一样的对齐方式，可覆盖 align-items 属性。默认值为 auto，表示继承父元素的align-items属性，如果没有父元素，则等同于stretch。

## 2. 怎么让一个 div 水平垂直居中

水平垂直居中有好多种实现方式，主要就分为两类不定宽高和定宽高 以在 body 下插入一个 div 为例

**定宽高**

使用定位 + margin

```js
element.style {
 position: absolute;
 left: 50%;
 top: 50%;
 margin-left: -250px;
 margin-top: -250px;
 width: 500px;
 height: 500px;
 background: yellow;
 z-index: 1;
}
```

使用定位 + transfrom

```js
element.style {
 position: absolute;
 left: 50%;
 top: 50%;
 width: 500px;
 height: 500px;
 background: yellow;
 z-index: 1;
 transform: translate3d(-50%,-50%,0);
}
```

**不定宽高**

不定宽高的方法基本都适用于定宽高的情况 这里把 div 的宽高按照内容展开，使用定位 + transform 同样是适用的

```js
element.style {
 position: absolute;
 left: 50%;
 top: 50%;
 background: yellow;
 z-index: 1;
 transform: translate3d(-50%,-50%,0);
}
```

## 3. 如何实现一个自适应的正方形

**方法1：利用 CSS3 的 vw 单位**

`vw` 会把视口的宽度平均分为 100 份

```
.square {
 width: 10vw;
 height: 10vw;
 background: red;
}
```

**方法2：利用 margin 或者 padding 的百分比计算是参照父元素的 width 属性**

```
.square {
 width: 10%;
 padding-bottom: 10%;
 height: 0; // 防止内容撑开多余的高度
 background: red;
}
```

## 4. 如何实现三栏布局

三栏布局是很常见的一种页面布局方式。左右固定，中间自适应。实现方式有很多种方法。

**第一种：flex**

```
<div class="container">
 <div class="left">left</div>
 <div class="main">main</div>
 <div class="right">right</div>
</div>
.container{
 display: flex;
}
.left{
 flex-basis:200px;
 background: green;
}
.main{
 flex: 1;
 background: red;
}
.right{
 flex-basis:200px;
 background: green;
}
```

**第二种：position + margin**

```
<div class="container">
 <div class="left">left</div>
 <div class="right">right</div>
 <div class="main">main</div>
</div>
body,html{
 padding: 0;
 margin: 0;
}
.left,.right{
 position: absolute;
 top: 0;
 background: red;
}
.left{
 left: 0;
 width: 200px;
}
.right{
 right: 0;
 width: 200px;
}
.main{
 margin: 0 200px ;
 background: green;
}
```

**第三种：float + margin**

```
<div class="container">
 <div class="left">left</div>
 <div class="right">right</div>
 <div class="main">main</div>
</div>
body,html{
 padding:0;
 margin: 0;
}
.left{
 float:left;
 width:200px;
 background:red;
}
.main{
 margin:0 200px;
 background: green;
}
.right{
 float:right;
 width:200px;
 background:red;
}
```

## 5. 如何在页面上实现一个圆形的可点击区域？

首先使用 CSS3 新增的 border-radius 属性来将一个区域变成圆形，然后再使用 JS 来绑定事件。

## 6. 我有5个div在一行，我要让div与div直接间距10px且最左最右两边的div据边框10px，同时在我改变窗口大小时，这个10px不能变，div根据窗口改变大小

```css
* {
  margin: 0;
}
.container {
  display: flex;
}
.container > div {
  outline: 1px solid;
  margin: 0 5px;
  flex-grow: 1;
}

.container > div:first-child {
  margin-left: 10px;
}
.container > div:last-child {
  margin-right: 10px;
}
```

```html
<div class="container">
  <div>1</div>
  <div>2</div>
  <div>3</div>
  <div>4</div>
  <div>5</div>
</div>
```

## 7. 块级元素转行内元素除了 display:inline 还有什么？

display:inline-block

## 8. div 之间的间隙是怎么产生的，应该怎么消除？

原因：浏览器解析的时候，会把回车换行符解析成一定的间隙，间隙的大小跟默认的字体大小设置有关。

解决：其父元素加上 font-size:0 的属性，但是字体需要额外处理。

## 9. div 怎么垂直居中

div 垂直居中的方式比较多，常见的有下面 3 种：

- 利用绝对定位实现的居中
- 利用flex垂直居中
- transform+relative实现的居中

**利用绝对定位实现的居中**

```js
<!DOCTYPE html>
<html>
 <head>
     <meta charset="UTF-8">
     <title>居中</title>
     <style type="text/css">
         *{
             padding: 0px;
             margin: 0px;
         }
         body {
             height: 100%;
             overflow: hidden;
         }
         .father{
             position: absolute;
             height: 500px;
             width: 100%;
             background-color:#2AABD2;
         }
         .children{
             position: absolute;
             top: 50%;
             left: 50%;
             background-color: red;
             width: 100px;
             height: 100px;
             margin: -50px 0 0 -50px;
         }
     </style>
 </head>
 <body>
     <div class="father">
         <div class="children">
         </div>
     </div>
 </body>
</html>
```

**利用flex垂直居中**

```js
<!DOCTYPE html>
<html>
 <head>
     <meta charset="UTF-8">
     <title>居中</title>
     <style type="text/css">
         *{
             padding: 0px;
             margin: 0px;
         }
         body {
             height: 100%;
             overflow: hidden;
         }
         .father{
             height: 500px;
             width: 100%;
             background-color:#2AABD2;
             display: flex;
             justify-content: center;/*实现水平居中*/
             align-items:center; /*实现垂直居中*/
         }
         .children{
             background-color: red;
             width: 100px;
             height: 100px;
         }
     </style>
 </head>
 <body>
     <div class="father">
         <div class="children">
         </div>
     </div>
 </body>
</html>
```

**transform+relative实现的居中**

```js
<!DOCTYPE html>
<html>
 <head>
     <meta charset="UTF-8">
     <title>居中</title>
     <style type="text/css">
         *{
             padding: 0px;
             margin: 0px;
         }
         body {
             height: 100%;
             overflow: hidden;
         }
         .father{
             position: absolute;
             height: 500px;
             width: 100%;
             background-color:#2AABD2;
         }
         .children{
             position: relative;
             top: 50%;
             left: 50%;
             background-color: red;
             width: 100px;
             height: 100px;
             transform: translate(-50%, -50%);
         }
     </style>
 </head>
 <body>
     <div class="father">
         <div class="children">
         </div>
     </div>
 </body>
</html>
```
