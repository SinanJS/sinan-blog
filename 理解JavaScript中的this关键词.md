# 理解JavaScript中的`this`关键词
> this关键词是JavaScript语言中一个很重要，同时也是一个非常复杂的机制，它同时也是一个很特殊的关键词，它一般会被自动定义在函数的作用域中。不少很有经验的开发者也经常会被`this`的指向搞晕，当开发者搞不清楚它的指向的时候，内心的感受实际上差不多是这个样子：![二营长，你他娘的意大利炮呢](https://github.com/SinanJS/sinan-blog/blob/master/img/italy-gun.jpg?raw=true)
>接下来我们将会具体讨论`this`关键词到底指向什么。

## `this`的绑定规则
首先明确一点，`this`的绑定和函数的声明位置是没有任何关系的，它只取决于函数的调用位置和调用方式。
### 1. 默认绑定
首先我们先看一下最常见的也是最简单的函数调用，全局中的独立的函数调用：
```js
var a = 'hello';
function foo() {
  console.log(this.a);
}
foo();// "hello"
```
众所周知，声明在全局作用域中的变量，就是全局对象(`window`或者`global`)的一个同名的属性，在本例中，`this.a`被解析成了全局变量`a`，而函数`foo`就是在直接在全局对象下、不带有任何修饰地进行调用的，所以，`this`的默认绑定规则就是指向`全局对象`。但是，当我们使用严格模式(strict)进行开发的时候，情况发生了变化

```js
"use strict";
var a = 'hello';
function foo() {
  console.log(this.a);
}
foo();// undefined
```
在严格模式下，`this`被禁止绑定到全局对象中，所以在本例中，`this`指向了`undefined`。
### 2.作为对象方法的调用
看下面的代码：
```js
var a ="world";
var foo = function () {
  console.log(this.a);
};
var obj = {
  a:"hello",
  b:foo
};
obj.b(); //"hello"
```
本例中，分别在全局对象中定义变量`a`，和在全局对象中定义属性`obj.a`，运行结果是`this`被绑定到了被调用函数所在的对象中，而并非是全局对象中的`a`,或者你可以说，`this`指向了该函数的上级对象中。但是严格来说，无论是直接在`obj`对象中直接定义，还是先在全局对象中定义再添加到`obj`中，`foo`函数都并不属于`obj`对象，然而调用位置会使用obj的上下文来引用函数。简单说，当函数引用有上下文对象时，`隐式绑定`规则会将函数调用中的`this`绑定到这个上下文对象中。
### 3.在构造函数及prototype里的调用
```js
var Foo = function () {
  this.a = 'hello';
}
Foo.prototype.bar = function () {
   console.log(this.a);
};
Foo.prototype.bar2 = function () {
   this.bar();
};
var foo = new Foo();
foo.bar2();//"hello"
```
本例与上例类似，this在“Foo类”（严格说Foo是应该是构造函数，但一般在开发过程中认为Foo是类，这样有助于在面向对象编程中减少误解）中绑定的是“类”里的共有变量和共有方法。
## `this`隐式绑定丢失
上述的几种应用场景还是非常容易理解的，也是比较符合我们对`this`字面意义的理解的，相信对JavaScript有过接触和研究的童鞋很快就会掌握。下面将继续介绍几种让人感觉匪夷所思的`this`绑定丢失。
思考以下代码：
```js
var a = "world";
function foo (){
   console.log(this.a);
}
var obj = {
  a:"hello",
  foo:foo
};
var bar = obj.foo; //函数别名
bar(); //"world"
```
代码执行完成后，我们看到`this`被绑定到了（或者说指向了）全局对象上，而并不是和前几种情况下绑定到`obj`对象中，这是为啥呢？
虽然`bar`是`obj.foo`的一个引用，但是实际上它引用的是`foo`函数本身，因此此时`bar`其实是一个不带任何修饰的函数调用，因此适用于默认绑定情况。
下面再来看看回调函数中`this`的绑定情况
```js
function foo() {
  console.log(this.a);
}
function do(fnc) {
  fnc();
};
var obj = {
  a:2,
  foo:foo
};
var a = "world";
do(obj.foo);//"world"
```
参数传递其实就是一种隐式赋值，因此传入函数时也会被隐式赋值，所以结果和上一个例子没有区别，即便是将函数传入语言内置的的函数（比如`setTimeout()`）中，结果也是没有区别的，`this`要么被绑定到全局对象中，要么绑定到`undefined`。
除此之外，还有一种情况也会修改`this`，在一些JavaScript库中传入回调函数，可能会强制改变`this`的绑定，例如在jquery中
```js
$("#some-id").on('click',function () {
  console.log(this.id);//"some-id"
});
```
本例中的`this`就是被强制改变绑定到了触发事件的DOM元素上。
