# 【JavaScript】`call`与`apply`兄弟列传
> 在JavaScript中，有这么俩货，一个叫call,一个叫apply，它们俩工作几乎一毛一样，但是也有所区别，曾经对这个知识点非常困惑，看过几篇博客也没搞清楚这哥俩到底打算要干个啥，直到某天仔细研究过`this`关键词的相关知识点后，才恍然大悟，
>![恍然大悟](https://github.com/SinanJS/sinan-blog/blob/master/img/kenan.jpg?raw=true)
>这篇文章主要就是为`call`和`apply`兄弟俩写“人物传记”，希望能帮助到其他对这个问题有困惑的童鞋。

## 家族世系
在正式介绍这哥俩之前，首先我们得知道兄弟二人到底是谁家的熊孩子，所以有必要熟悉一下哥俩的“家族世系”，刨根问底，以便日后开心地与兄弟二人愉快地玩耍交朋友。
`call`和`apply`是被定义到`Function.prototype`上的两个方法，也就是`Function`类型中的原生方法，早在ECMAScript标准的第一个版本中就已经被初步定义，历史悠久，所以现代浏览器几乎都支持，完全不必担心兼容性。

## 基本用法
`call`方法与`apply`方法要实现的功能几乎一致，**就是使用一个指定的this值和若干个指定的参数值的前提下调用某个函数或方法。** 两者只有一个区别，`call`方法接受的是**若干个参数的列表，参数之间以逗号分隔** 而`apply`方法接受的是**一个包含多个参数的数组或者伪数组（比如arguments）**。
思考以下代码：
```js
var objA = {
  x:"value is A",
  getX:function () {
    console.log(this.x);
  }
};

var objB={
  x:"value is B",
  getX:function () {
    console.log(this.x);
  }
};

objA.getX(); //"value is A"
objA.getX.call(objB);//"value is B",this被重新绑定到了objB上
```
上面的代码很简单，当`objA.getX()`被直接调用执行的时候，`this`理所应当地指向了`objA`对象，但是当`objA.getX.call(objB)`被调用执行时，`objA.getX`中的`this`被改变，指向了`objB`。此时因为没有其他参数要传入，所以本例中使用`call`和`apply`的输出结果是没有区别的。
他们区别在于传递参数的方式：
```js
var objA = {
  x: 'A',
  getX: function (val1, val2) {
    console.log(val1 + val2 + this.x);
  }
};
var objB = {
  x: 'B',
  getX: function (val1, val2) {
    console.log(val1 + val2 + this.x);
  }
};
objA.getX.call(objB, 'value', 'is'); //"value is B"
objA.getX.apply(objB, ['value','is']); //"value is B"
```
PS：若想了解更多关于`this`关键词的知识，请阅读[这篇文章](https://segmentfault.com/a/1190000006813835)
## 用作类的继承
`call`与`apply`方法使用的一个最常见的场景就是在js类的继承中使用，废话不多说，直接上代码：
```js
var Person = function (name, age) {
  this.name = name;
  this.age = age;
  this.sayAge = function () {
    console.log('Age:' + this.age);
  };
}
var Worker = function (name, age, workerId) {
  this.workerId = workerId;
  Person.apply(this, arguments); //apply的第二个参数也可以是伪数组
  this.showId = function () {
    console.log(this.workerId);
  }
}
var worker = new Worker('张三', 22, '521608');
worker.sayAge();
```
需要注意的一点是，使用`call`和`apply`方法不能继承原型链，如果要实现原型链继承，则需要混合**使用子类原型对象指向父类的实例**的方式实现继承。具体可参考下面代码
```js
var Person = function (name,age) {
  this.name = name;
  this.age = age;
  this.sayAge = function () {
      console.log("Age:"+this.age);
  };
}
//定义到原型链上的方法
Person.prototype.sayName = function () {
    console.log("Name:"+this.name);
};
var Worker = function (name,age,workerId) {
  this.workerId= workerId;
  Person.apply(this,arguments);//这里没有继承父类prototype中的方法
}
Worker.prototype = new Person(this.name,this.age);

Worker.prototype.showId = function () {
    console.log("ID:",this.workerId);
};

var worker = new Worker("张三",22,"521608");
worker.sayAge(); //"Age:22"
worker.sayName();//"Name:张三"
worker.showId();//"ID: 521608"
```
