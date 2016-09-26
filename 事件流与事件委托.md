# 事件流与事件委托
> 事件，即文档或浏览器中发生的一些特定交互的瞬间，我们可以利用事件监听来预定事件，当事件发生的时候执行相应的处理程序。当事件发生在某个DOM节点上时，事件在DOM结构中进行一级一级的传递，这便形成了“流”，事件流便描述了从页面中接收事件的顺序。本文主要讨论事件流的三个阶段，及利用事件委托机制进行性能优化。

## DOM事件流
关于事件流的理解，《JS高程三》中有个形象的比喻：
>可以想象画在一张纸上的一组同心圆，如果你把手指放在圆心上，那么你的手指指向的其实不是一个圆，而是纸上所有的圆。...>换句话说，在单击按钮的同时，你也单击了按钮的容器元素，甚至也单击了整个页面。
>
> ————《JavaScript高级程序设计（第三版）》page 345

DOM2级事件中规定事件流包含3个阶段：
- 捕获阶段
- 处于目标阶段
- 冒泡阶段

首先发生的是事件捕获阶段，此时事件还没有传递到目标节点对象上，所以我们就有机会在这个阶段进行事件的截。然后是目标节点接收到事件，最后是事件冒泡阶段，可以在这个阶段对事件做出处理和响应。
我们先定义一段简单的html结构：
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
  </head>
  <body>
      <div class="box">
          <button type="button" name="button">click me</button>
      </div>
  </body>
</html>
```

## 事件捕获阶段
在事件捕获阶段中，先由不具体的节点（即上层节点）接收到事件，然后一级一级往下传递，直到最具体的`目标节点`接收到事件。
在DOM2级事件规范中，要求事件从`document`对象开始传递，但是诸如Chrome，Firefox等主流浏览器却是从`window`开始传递的。
>`addEventListener`方法的第三个参数是一个布尔值（可选），指定事件处理程序是否在捕获或冒泡阶段执行。 当为`true`时，则事件处理程序将在捕获阶段执行。

>误区：无论`addEventListener`的第三个参数是否为`true`，三个阶段都会走一遍，这里的第三个参数，指的是处理程序将会在捕获或者冒泡阶段执行，好比是你想买菜，你可以在上班路上，或者下班路上完成买菜，但无论什么时候买菜，你都要把这两段路程走完。

```js
document.querySelector('#btn').addEventListener('click', function () {
    console.log("btn was clicked");
},true);

document.querySelector('body').addEventListener('click', function () {
    console.log("body was clicked");
},true);

document.querySelector('.box').addEventListener('click', function () {
    console.log("box was clicked");
},true);

document.addEventListener('click', function () {
    console.log("document was clicked");
},true);

window.addEventListener('click', function () {
    console.log("window was clicked");
},true);
```
点击`click me`按钮后,控制台依次打印出执行结果：
```js
window was clicked
document was clicked
body was clicked
box was clikced
btn was clicked
```

很明显可以看出，在捕获阶段，事件由`window`对象开始，一级一级地向下传递，直到传递到最具体的`button`对象上。

## 事件冒泡阶段

事件冒泡阶段与捕获阶段恰好相反，冒泡阶段是从最具体的目标对象开始，一层一层地向上传递，直到`window`对象。
`addEventListener`方法默认就是从`冒泡阶段`执行事件处理程序。
```js
document.querySelector('#btn').addEventListener('click', function () {
    console.log("btn was clicked");
});

document.querySelector('body').addEventListener('click', function () {
    console.log("body was clicked");
});

document.querySelector('.box').addEventListener('click', function () {
    console.log("box was clicked");
});

document.addEventListener('click', function () {
    console.log("document was clicked");
});

window.addEventListener('click', function () {
    console.log("window was clicked");
});
```
点击`click me`按钮后,控制台依次打印出执行结果：
```js
btn was clicked
box was clikced
body was clicked
document was clicked
window was clicked
```
上述过程示意图：
![DOM事件流](http://dl.iteye.com/upload/attachment/561137/2c5d9035-edfe-3b21-85d1-ab5fff3f489b.jpg)
## 阻止事件冒泡
我们可以使用`event.stopPropagation()`方法阻止事件冒泡过程，以防止事件冒泡而带来不必要的错误和困扰。
示例：
```js
document.querySelector('#btn').addEventListener('click', function (event) {
    console.log("btn was clicked");
    event.stopPropagation();
});

document.querySelector('body').addEventListener('click', function () {
    console.log("body was clicked");
});

document.querySelector('.box').addEventListener('click', function () {
    console.log("box was clicked");
});

document.addEventListener('click', function () {
    console.log("document was clicked");
});

window.addEventListener('click', function () {
    console.log("window was clicked");
});
```
点击`click me`按钮后,控制台打印出执行结果显示，事件没有再向上冒泡传递给其他节点对象：
```js
btn was clicked
```

## 事件委托
每个函数都是对象，都会占用内存，所以当我们的页面中所包含的事件数量较多时,如果给每个节点绑定一个事件，加上事件处理程序，就会造成性能很差。还有一个问题是，某个元素节点是后来通过JavaScript动态添加进页面中的，这时候我们如果提前对它进行绑定，但此时该元素并不存在，所以会绑定事件会失败。解决上述两个问题的一个常用方案，就是使用`事件委托`。
举例来说：
```js
document.querySelector('.box').addEventListener(function (event) {
    switch (event.target.id) {
      case "btn":
        console.log("btn was clicked");
        break;
      case "btn-2":
        console.log("btn-2 was clicked");
        break;
      default:
        console.log("box was clicked");
        break;
    }
});
$(".box").append("<button id='btn-2'>btn-2</button>");
```
简单说，事件委托就是把本来该自己接收的事件委托给自己的上级（父级，祖父级等等）的某个节点，让自己的“长辈们”帮忙盯着，一旦有事件触发，再由“长辈们”告诉自己：“喂，孙子，有人找你~~”。
恩，差不多就是这么个意思，可怜天下父母心。

水平有限，欢迎大家不吝指正。
