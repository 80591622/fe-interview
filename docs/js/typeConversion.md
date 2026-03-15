# JavaScript 数据类型转换详解

## 引出问题（面试场景）

面试官："同学，能解释一下 JavaScript 中的数据类型转换吗？"

我："嗯，数据类型转换就是把一种数据类型转换成另一种数据类型，比如字符串转数字，数字转布尔值之类的。"

面试官："那你知道隐式转换和显式转换的区别吗？"

我："隐式转换就是自动发生的，显式转换就是手动调用方法转换的。"

面试官："那 `1 + '1'` 等于多少？为什么？"

我："等于 '11'，因为数字和字符串相加会发生隐式转换，数字会被转换成字符串。"

面试官："那 `{} + []` 等于多少？"

我："...这个，我不太确定。"

面试官："那 `[] + {}` 呢？"

我："..."

如果你也被问过类似的问题，并且像我一样支支吾吾，那么这篇文章就是为你准备的。今天我们就来深入聊聊 JavaScript 中的数据类型转换，让你下次面试时能够胸有成竹。

## 基础概念

在 JavaScript 中，数据类型转换主要分为两种：

### 1. 显式转换

显式转换，也叫强制转换，是指我们通过调用 JavaScript 提供的方法来主动进行类型转换。常见的方法有：

- `Number()`：将其他类型转换为数字
- `String()`：将其他类型转换为字符串
- `Boolean()`：将其他类型转换为布尔值
- `parseInt()`：将字符串转换为整数
- `parseFloat()`：将字符串转换为浮点数

### 2. 隐式转换

隐式转换，也叫自动转换，是指 JavaScript 在特定场景下自动进行的类型转换。这种转换通常发生在以下情况：

- 算术运算（`+`, `-`, `*`, `/`, `%`）
- 比较运算（`==`, `!=`, `>`, `<`, `>=`, `<=`）
- 逻辑运算（`&&`, `||`, `!`）
- 条件判断（`if`, `while`）

## 示例代码

### 显式转换示例

```javascript
// 数字转字符串
const num = 123;
const str = String(num);
console.log(str); // "123"
console.log(typeof str); // "string"

// 字符串转数字
const str2 = "456";
const num2 = Number(str2);
console.log(num2); // 456
console.log(typeof num2); // "number"

// 布尔值转数字
const bool = true;
const num3 = Number(bool);
console.log(num3); // 1

// 数字转布尔值
const num4 = 0;
const bool2 = Boolean(num4);
console.log(bool2); // false
```

### 隐式转换示例

```javascript
// 算术运算中的隐式转换
console.log(1 + "1"); // "11"（数字转字符串）
console.log(1 - "1"); // 0（字符串转数字）
console.log(1 * "1"); // 1（字符串转数字）
console.log(1 / "1"); // 1（字符串转数字）

// 比较运算中的隐式转换
console.log(1 == "1"); // true（字符串转数字）
console.log(1 === "1"); // false（严格比较，不发生隐式转换）
console.log(null == undefined); // true
console.log(null === undefined); // false

// 逻辑运算中的隐式转换
console.log(!!"hello"); // true（字符串转布尔值）
console.log(!!0); // false（数字转布尔值）
console.log(!!null); // false（null转布尔值）

// 条件判断中的隐式转换
if ("hello") {
  console.log("字符串为真"); // 执行
}

if (0) {
  console.log("数字0为真"); // 不执行
}
```

## 原理解析

### 1. 隐式转换的规则

JavaScript 中的隐式转换遵循一定的规则，主要涉及三种转换：

#### 1.1 ToPrimitive

当需要将一个对象转换为原始类型时，JavaScript 会调用对象的 `ToPrimitive` 方法。这个方法的执行过程如下：

1. 首先调用对象的 `valueOf()` 方法，如果返回原始类型，则使用该值
2. 如果 `valueOf()` 返回的不是原始类型，则调用 `toString()` 方法，如果返回原始类型，则使用该值
3. 如果 `toString()` 返回的也不是原始类型，则抛出 TypeError 异常

#### 1.2 ToNumber

当需要将一个值转换为数字时，JavaScript 会调用 `ToNumber` 方法。转换规则如下：

| 类型      | 结果                                                          |
| --------- | ------------------------------------------------------------- |
| undefined | NaN                                                           |
| null      | 0                                                             |
| 布尔值    | true 转换为 1，false 转换为 0                                 |
| 数字      | 保持不变                                                      |
| 字符串    | 尝试解析为数字，解析失败则返回 NaN                            |
| 对象      | 先调用 ToPrimitive 转换为原始类型，再调用 ToNumber 转换为数字 |

#### 1.3 ToString

当需要将一个值转换为字符串时，JavaScript 会调用 `ToString` 方法。转换规则如下：

| 类型      | 结果                                                            |
| --------- | --------------------------------------------------------------- |
| undefined | "undefined"                                                     |
| null      | "null"                                                          |
| 布尔值    | "true" 或 "false"                                               |
| 数字      | 数字的字符串表示                                                |
| 字符串    | 保持不变                                                        |
| 对象      | 先调用 ToPrimitive 转换为原始类型，再调用 ToString 转换为字符串 |

### 2. 特殊情况

#### 2.1 加法运算的特殊规则

加法运算（`+`）是 JavaScript 中最特殊的运算符之一，因为它既可以进行数字相加，也可以进行字符串拼接。具体规则如下：

1. 如果其中一个操作数是字符串，那么另一个操作数也会被转换为字符串，然后进行字符串拼接
2. 如果两个操作数都是数字，则进行数字相加
3. 如果其中一个操作数是对象，则先调用 ToPrimitive 转换为原始类型，然后再根据上述规则进行运算

#### 2.2 比较运算的特殊规则

比较运算（`==`, `!=`, `>`, `<`, `>=`, `<=`）也有特殊的转换规则：

1. 对于 `==` 和 `!=`：
   - 如果两个操作数类型相同，则直接比较
   - 如果一个是数字，一个是字符串，则将字符串转换为数字后比较
   - 如果一个是布尔值，则将其转换为数字后比较
   - 如果一个是对象，一个是原始类型，则将对象转换为原始类型后比较
   - null 和 undefined 相等
   - null 和 undefined 与其他类型比较时，不进行转换

2. 对于 `>`, `<`, `>=`, `<=`：
   - 如果两个操作数都是字符串，则按字典顺序比较
   - 否则，将两个操作数都转换为数字后比较

## 手写实现

### 1. 实现 Number() 函数

```javascript
function myNumber(value) {
  // 处理 undefined
  if (value === undefined) {
    return NaN;
  }
  
  // 处理 null
  if (value === null) {
    return 0;
  }
  
  // 处理布尔值
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  
  // 处理数字
  if (typeof value === 'number') {
    return value;
  }
  
  // 处理字符串
  if (typeof value === 'string') {
    // 尝试解析为数字
    const num = parseFloat(value);
    return isNaN(num) ? NaN : num;
  }
  
  // 处理对象
  if (typeof value === 'object') {
    // 先调用 valueOf()
    const valueOfResult = value.valueOf();
    if (typeof valueOfResult !== 'object') {
      return myNumber(valueOfResult);
    }
    
    // 再调用 toString()
    const toStringResult = value.toString();
    if (typeof toStringResult !== 'object') {
      return myNumber(toStringResult);
    }
    
    // 都失败则抛出异常
    throw new TypeError('Cannot convert object to primitive value');
  }
  
  // 其他情况返回 NaN
  return NaN;
}

// 测试
console.log(myNumber(undefined)); // NaN
console.log(myNumber(null)); // 0
console.log(myNumber(true)); // 1
console.log(myNumber(false)); // 0
console.log(myNumber(123)); // 123
console.log(myNumber("123")); // 123
console.log(myNumber("123abc")); // 123
console.log(myNumber("abc")); // NaN
console.log(myNumber([])); // 0
console.log(myNumber({})); // NaN
```

### 2. 实现 String() 函数

```javascript
function myString(value) {
  // 处理 undefined
  if (value === undefined) {
    return "undefined";
  }
  
  // 处理 null
  if (value === null) {
    return "null";
  }
  
  // 处理布尔值
  if (typeof value === 'boolean') {
    return value ? "true" : "false";
  }
  
  // 处理数字
  if (typeof value === 'number') {
    return value.toString();
  }
  
  // 处理字符串
  if (typeof value === 'string') {
    return value;
  }
  
  // 处理对象
  if (typeof value === 'object') {
    // 先调用 toString()
    const toStringResult = value.toString();
    if (typeof toStringResult !== 'object') {
      return toStringResult;
    }
    
    // 再调用 valueOf()
    const valueOfResult = value.valueOf();
    if (typeof valueOfResult !== 'object') {
      return myString(valueOfResult);
    }
    
    // 都失败则抛出异常
    throw new TypeError('Cannot convert object to primitive value');
  }
  
  // 其他情况返回空字符串
  return "";
}

// 测试
console.log(myString(undefined)); // "undefined"
console.log(myString(null)); // "null"
console.log(myString(true)); // "true"
console.log(myString(false)); // "false"
console.log(myString(123)); // "123"
console.log(myString("hello")); // "hello"
console.log(myString([])); // ""
console.log(myString({})); // "[object Object]"
```

## 常见坑

### 1. 隐式转换导致的意外结果

```javascript
// 坑 1：加法运算的隐式转换
console.log(1 + "1"); // "11"（数字转字符串）
console.log(1 + true); // 2（布尔值转数字）
console.log(1 + null); // 1（null转数字0）
console.log(1 + undefined); // NaN（undefined转NaN）

// 坑 2：对象的隐式转换
console.log({} + []); // "[object Object]"（先调用 valueOf()，再调用 toString()）
console.log([] + {}); // "[object Object]"（同上）
console.log([] + []); // ""（两个数组都转换为空字符串）
console.log({} + {}); // "[object Object][object Object]"（两个对象都转换为字符串后拼接）

// 坑 3：比较运算的隐式转换
console.log(0 == ""); // true（空字符串转数字0）
console.log(0 == false); // true（布尔值转数字0）
console.log("" == false); // true（两者都转数字0）
console.log(null == 0); // false（null不转数字）
console.log(undefined == 0); // false（undefined不转数字）
```

### 2. 与 `===` 的区别

```javascript
// 使用 == 时的隐式转换
console.log(1 == "1"); // true
console.log(1 === "1"); // false

// 使用 == 时的特殊情况
console.log(null == undefined); // true
console.log(null === undefined); // false

// 使用 == 时的对象比较
const obj1 = { value: 1 };
const obj2 = { value: 1 };
console.log(obj1 == obj2); // false（引用比较）
console.log(obj1 === obj2); // false（引用比较）
```

### 3. parseInt() 的陷阱

```javascript
// 陷阱 1：自动识别进制
console.log(parseInt("0x10")); // 16（十六进制）
console.log(parseInt("10")); // 10（十进制）
console.log(parseInt("010")); // 10（ES5 后不再识别八进制）

// 陷阱 2：遇到非数字字符就停止解析
console.log(parseInt("123abc")); // 123
console.log(parseInt("abc123")); // NaN

// 陷阱 3：空字符串和 undefined
console.log(parseInt("")); // NaN
console.log(parseInt(undefined)); // NaN
```

## 总结

1. **显式转换**：通过调用 `Number()`, `String()`, `Boolean()` 等方法主动进行类型转换
2. **隐式转换**：JavaScript 在特定场景下自动进行的类型转换，遵循 `ToPrimitive`, `ToNumber`, `ToString` 等规则
3. **加法运算**：特殊规则，一个操作数为字符串则进行字符串拼接
4. **比较运算**：`==` 会进行隐式转换，`===` 不会进行隐式转换
5. **对象转换**：先调用 `valueOf()`，再调用 `toString()`

## 面试考点

1. **隐式转换规则**：特别是加法运算和比较运算的规则
2. **`==` vs `===`**：两者的区别和使用场景
3. **对象的转换**：`valueOf()` 和 `toString()` 的调用顺序
4. **特殊值的转换**：`null`, `undefined`, `NaN` 等特殊值的转换规则
5. **常见陷阱**：如 `[] + {}` 和 `{} + []` 的结果

## 面试题

### 1. 下面代码的输出是什么？

```javascript
console.log(1 + "1");
console.log(1 - "1");
console.log(1 * "1");
console.log(1 / "1");
```

**答案**：
- `1 + "1"` 输出 "11"（数字转字符串，字符串拼接）
- `1 - "1"` 输出 0（字符串转数字，数字相减）
- `1 * "1"` 输出 1（字符串转数字，数字相乘）
- `1 / "1"` 输出 1（字符串转数字，数字相除）

### 2. 下面代码的输出是什么？

```javascript
console.log([] + {});
console.log({} + []);
console.log([] + []);
console.log({} + {});
```

**答案**：
- `[] + {}` 输出 "[object Object]"（数组转空字符串，对象转 "[object Object]"，然后拼接）
- `{} + []` 输出 "[object Object]"（同上）
- `[] + []` 输出 ""（两个数组都转空字符串，然后拼接）
- `{} + {}` 输出 "[object Object][object Object]"（两个对象都转 "[object Object]"，然后拼接）

### 3. 下面代码的输出是什么？

```javascript
console.log(0 == "");
console.log(0 == false);
console.log("" == false);
console.log(null == undefined);
console.log(null == 0);
console.log(undefined == 0);
```

**答案**：
- `0 == ""` 输出 true（空字符串转数字 0）
- `0 == false` 输出 true（布尔值转数字 0）
- `"" == false` 输出 true（两者都转数字 0）
- `null == undefined` 输出 true（特殊规则）
- `null == 0` 输出 false（null 不转数字）
- `undefined == 0` 输出 false（undefined 不转数字）

### 4. 如何避免隐式转换带来的问题？

**答案**：
- 使用 `===` 进行严格比较，避免隐式转换
- 对于需要进行类型转换的场景，使用显式转换方法（如 `Number()`, `String()` 等）
- 了解常见的隐式转换规则，避免写出容易产生歧义的代码
- 使用 TypeScript 等静态类型语言，可以在编译时发现类型错误

### 5. 实现一个函数，判断两个值是否相等，要求处理各种类型的情况

**答案**：

```javascript
function isEqual(a, b) {
  // 处理引用相等的情况
  if (a === b) {
    return true;
  }
  
  // 处理 null 和 undefined
  if (a == null && b == null) {
    return true;
  }
  
  // 处理 NaN
  if (typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b)) {
    return true;
  }
  
  // 处理对象
  if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
    // 处理数组
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (!isEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }
    
    // 处理对象
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
      return false;
    }
    for (const key of keysA) {
      if (!keysB.includes(key) || !isEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }
  
  // 其他情况
  return false;
}

// 测试
console.log(isEqual(1, 1)); // true
console.log(isEqual(1, "1")); // false
console.log(isEqual(null, undefined)); // true
console.log(isEqual(NaN, NaN)); // true
console.log(isEqual([1, 2], [1, 2])); // true
console.log(isEqual({ a: 1 }, { a: 1 })); // true
console.log(isEqual({ a: 1 }, { a: 2 })); // false
```

希望这篇文章能够帮助你理解 JavaScript 中的数据类型转换，让你在面试中能够从容应对各种相关问题。记住，理解原理是关键，多练习、多总结才能真正掌握。祝你面试顺利！