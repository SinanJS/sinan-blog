## 要优雅，也要浪漫的Promise
> 在ECMAScript 6标准中，Promise被正式列为规范，Promise，字面意思就是“许诺，承诺”，嘿，听着是不是很浪漫的说？我们来探究一下这个浪漫的Promise对象到底是如何许下承诺，又是如何兑现TA的诺言的。

### 1.许下一个Promise（承诺）
下面我们将通过一些简单的例子，来一步一步的探究Promise的含义，更重要的是，用心体会Ta的优雅和浪漫（PS：让程序猿体会浪漫，是不是难为大家了）

在ES6标准中被定义为一个`构造函数`，那好我们就先`new`一个对象出来看看。
```js
var promise = new Promise(function(resolve,reject){
   //一个异步操作
    setTimeout(function(){
        let foo = 1;
        console.log('执行完成');
        resolve(foo);
    }, 2000);
});
```
上面的代码就可以看作是Promise给我们许下了一个承诺，不过，这特么到底是个啥意思呢？
构造函数`Promise`接收一个`回调函数`做参数，同时这个回调函数又接受2个function做参数，本例中分别起名叫`resolve`和`reject`，分别代表`异步操作执行成功后的操作`，和`异步操作执行失败后的操作`。
ES6标准中规定一个 Promise的当前状态必须为以下三种状态中的一种：
* 进行中（`Pending`）
* 已完成（`Resolved` 或 `Fulfilled`）
* 已失败（`Rejected`）

下表简单总结了三种状态所代表的含义：


|名称      |    含义 | 满足条件  |
| :-------- |:--------| :---- |
| Pending   | 进行中 |操作正在执行，可以切换为Resolve或Rejected状态|
| Resolved  | 已完成 |必须拥有一个不可变的终值，且不可以切换到其他状态|
| Rejected  | 已失败 |必须拥有一个不可变的终值，且不可以切换到其他状态|

当Promise的状态由`pending`状态，通过resolve函数改变为`resolved`，或者通过reject函数改变为`rejected`后，状态就凝固了，不会再变了，会一直保持这个结果。就算改变已经发生了，即使再对Promise对象添加回调函数，也会立即得到这个结果。

### 2.兑现承诺

既然许下了承诺，就必须要兑现承诺。下面就要介绍`Promise.prototype.then()`方法，来访问其当前值、终值和据因。它的作用是为Promise实例添加`状态改变时的回调函数`。`then`方法接收2个参数，第一个参数是Resolved状态的回调函数，第二个参数（可选）是Rejected状态的回调函数。
废话不多说直接上示例代码：
```js
function foo (a){
  var promise = new Promise(function(resolve,reject){
      setTimeout(function(){
          if(a > 0){
            resolve(a);
          }else {
            reject(a);
          }
      }, 2000);
  });
  return promise;
}

foo(1).then(function(a){
  console.log("success",a+1);
},function(a){
  console.log("error",a);
});
```
上面的代码中，简单设定一个定时任务模拟异步操作，当`a>0`时，认为操作成功，则在`then`方法中执行第一个回调函数，输出`success`;当传入的值 `a<0`时，就被认为操失败，则`then`方法执行第二个回调函数，输出`error`。看到这里，我们可能会感觉到Promise 和我们之前用的回调函数有点相似，但是貌似Promise是用同步的写法来处理异步的操作。简单来讲，Promise就是能把原来的回调写法分离出来，在异步操作执行完后，用链式调用的方式执行回调函数。
我们了解了以上的基本原理，以后碰到需要传递多个callback的情况的时候，就可以使用Promise实现链式调用，从而避免陷入`回调地狱`中。
示例代码：
```js
function foo(a) {
  ++a;
  console.log(a);
  var promise = new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (a > 0) {
        resolve(a);
      } else {
        reject(a);
      }
    }, 2000);
  });
  return promise;
}
function foo2(a) {
  ++a;
  console.log(a);
  var promise = new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (a > 1) {
        resolve(a);
      } else {
        reject(a);
      }
    }, 2000);
  });
  return promise;
}
function foo3(a) {
  ++a;
  console.log(a);
  var promise = new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (a > 2) {
        resolve(a);
      } else {
        reject(a);
      }
    }, 2000);
  });
  return promise;
}
function foo4(a) {
  ++a;
  console.log(a);
  var promise = new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (a > 3) {
        resolve(a);
      } else {
        reject(a);
      }
    }, 2000);
  });
  return promise;
}

//链式调用各个处理函数
foo(1).then(function (a) {
  return foo2(a);
})
.then(function (a) {
  return foo3(a);
})
.then(function (a) {
  return foo4(a);
})

```
### 3.承诺兑现不了咋办

并不是所有的承诺都会被兑现，就好像小时候父母都说帮我们存压岁钱以后还给我们一样。Promise中也是如此，总会有我们意想不到的差错发生导致无法按照预期的函数进行执行，
所以Promise提供了一个名为`catch`的方法帮我们解决这个问题。
`Promise.prototype.catch()`方法有2个作用，第一个作用，就是和`then`方法中的第二个参数作用相同，就是当状态切换成`rejected`时执行相应的操作，例如第一个例子中换个写法：
```js
foo(1)
.then(function(a){
  console.log("success",a+1);
})
.catch(function(a){
  console.log("error",a);
});
```
作用和原来完全一致。
第二个作用就是在执行resolve的回调（也就是上面then中的第一个参数）时，如果抛出异常了（代码出错了），那么并不会报错卡死js，而是会进到这个catch方法中。

### 4.让开，我要玩儿命兑现承诺了
要是你在生活中真遇到一个肯为你玩儿命的人。。。。。
关我毛事，劳资单身狗，秀恩爱的请移步他处。。。。。
Promise中提供了`Promise.all`方法，注意`all`方法是直接定义在Promise上的而不是原型链中。主要作用就是提供了并行执行异步操作的能力，让程序玩了命的跑起来。
```js
var promise = Promise.all([p1, p2, p3]).then(function (p) {
  console.log(p);
});
```
Promise.all会将多个Promise的实例，包装成一个新的Promise实例，然后传递给后面的`then`方法。
> Promise.all方法的参数可以不是数组，但必须具有Iterator接口，且返回的每个成员都是Promise实例

### 兼容性
说了这么多，哇塞这么优雅的特性一定要用起来啊，但是在激动之余，毕竟Promise是ES6标准中的新增对象，所以还是得冷静下来检查一下Promise对象的兼容性如何，
![Promise兼容性](https://github.com/SinanJS/sinan-blog/blob/master/img/promise.png?raw=true)
通过在[can I use...](http://caniuse.com/#search=Promise)网站上获取到的统计数据看来，Promise对象的兼容性不是很好，目前只有在比较新的主流浏览器中才得到全面支持，而且我们注意到微软的所有IE浏览器均不支持该对象，只有在win10中的Edge浏览器中才获得支持。看来我们在准备使用Promise的时候，还是要视自己的实际开发环境而定。
> 关于ES6的其他特性的最新支持情况，请点击[这里](http://kangax.github.io/compat-table/es6/#test-Promise)

### 总结
Promise作为ES6标准中一个比较新鲜的特性，还有其他方法这里没有讲到，比如`resolve`,`reject`,`race`等，受限于水平与时间精力，今天暂时先写这么多，以后有时间再继续补充，对于文中的错误和不足，欢迎大家指出讨论，共同学习进步（虽然我不一定看。。。。逃。。）
> 附：[在GitHub上阅读请点击](https://github.com/SinanJS/sinan-blog/blob/master/ES6%E4%B8%AD%E7%9A%84Promise%E5%AF%B9%E8%B1%A1%E8%AF%A6%E8%A7%A3.md)
