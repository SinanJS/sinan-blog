var arr = [
  1,
  2,
  4,
  5,
  6
];
arr.sort(function (a, b) {
  var c= "";
  
  if (a % 2 > 0) {
    c="→右（后）面";
  } else {
    c="←左（前）面";
  }
  var obj = `a:${a}  b:${b}  return:${a%2}  ${a}到${b}${c}`;
  console.log(obj);
  return a % 2;
});
console.log("最后结果",arr);
