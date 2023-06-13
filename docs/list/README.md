# 树遍历方法

广度优先的思路是，维护一个队列，队列的初始值为树结构根节点组成的列表，重复执行以下步骤直到队列为空：

取出队列中的第一个元素，进行访问相关操作，然后将其后代元素（如果有）全部追加到队列最后。
下面是代码实现，类似于数组的forEach遍历，我们将数组的访问操作交给调用者自定义，即一个回调函数：
```js
// 广度优先
function treeForeach (tree, func) {
  let node, list = [...tree]
  while (node = list.shift()) {
    func(node)
    node.children && list.push(...node.children)
  }
}
// 深度优先遍历的递归实现-先序遍历
function treeForeach (tree, func) {
  tree.forEach(data => {
    func(data)
    data.children && treeForeach(data.children, func) // 遍历子树
  })
}
// 后序遍历
function treeForeach (tree, func) {
  tree.forEach(data => {
    data.children && treeForeach(data.children, func) // 遍历子树
    func(data)
  })
}
// 深度优先循环实现
// 先序遍历与广度优先循环实现类似，要维护一个队列，不同的是子节点不追加到队列最后，而是加到队列最前面：
function treeForeach (tree, func) {
  let node, list = [...tree]
  while (node = list.shift()) {
    func(node)
    node.children && list.unshift(...node.children)
  }
}
/**
 * 后序遍历就略微复杂一点，我们需要不断将子树扩展到根节点前面去，（艰难地）执行列表遍历，遍历到某个节点如果它没有子节点或者它的子节点已经扩展到它前面了，则执行访问操作，否则扩展子节点到当前节点前面：
 * 
**/
function treeForeach (tree, func) {
  let node, list = [...tree], i =  0
  while (node = list[i]) {
    let childCount = node.children ? node.children.length : 0
    if (!childCount || node.children[childCount - 1] === list[i - 1]) {
      func(node)
      i++
    } else {
      list.splice(i, 0, ...node.children)
    }
  }
}
```
### 列表转为树
列表结构转为树结构，就是把所有非根节点放到对应父节点的chilren数组中，然后把根节点提取出来：
这里首先通过info建立了id=>node的映射，因为对象取值的时间复杂度是O(1)，这样在接下来的找寻父元素就不需要再去遍历一次list了，因为遍历寻找父元素时间复杂度是O(n)，并且是在循环中遍历，则总体时间复杂度会变成O(n^2)，而上述实现的总体复杂度是O(n)。

```js
function listToTree (list) {
  let info = list.reduce((map, node) => (map[node.id] = node, node.children = [], map), {})
  return list.filter(node => {
    info[node.parentId] && info[node.parentId].children.push(node)
    return !node.parentId
  })
}

```
### 树结构转列表结构
有了遍历树结构的经验，树结构转为列表结构就很简单了。不过有时候，我们希望转出来的列表按照目录展示一样的顺序放到一个列表里的，并且包含层级信息。使用先序遍历将树结构转为列表结构是合适的，直接上代码:
```js
//递归实现
function treeToList (tree, result = [], level = 0) {
  tree.forEach(node => {
    result.push(node)
    node.level = level + 1
    node.children && treeToList(node.children, result, level + 1)
  })
  return result
}

// 循环实现
function treeToList (tree) {
  let node, result = tree.map(node => (node.level = 1, node))
  for (let i = 0; i < result.length; i++) {
    if (!result[i].children) continue
    let list = result[i].children.map(node => (node.level = result[i].level + 1, node))
    result.splice(i+1, 0, ...list)
  }
  return result
}
```
### 树结构筛选
树结构过滤即保留某些符合条件的节点，剪裁掉其它节点。一个节点是否保留在过滤后的树结构中，取决于它以及后代节点中是否有符合条件的节点。可以传入一个函数描述符合条件的节点:
```js
function treeFilter (tree, func) {
  // 使用map复制一下节点，避免修改到原树
  return tree.map(node => ({ ...node })).filter(node => {
    node.children = node.children && treeFilter(node.children, func)
    return func(node) || (node.children && node.children.length)
  })
}
```
### 树结构查找
1. 查找节点
查找节点其实就是一个遍历的过程，遍历到满足条件的节点则返回，遍历完成未找到则返回null。类似数组的find方法，传入一个函数用于判断节点是否符合条件，代码如下：
```js
function treeFind (tree, func) {
  for (const data of tree) {
    if (func(data)) return data
    if (data.children) {
      const res = treeFind(data.children, func)
      if (res) return res
    }
  }
  return null
}
```
2.查找节点路径
略微复杂一点，因为不知道符合条件的节点在哪个子树，要用到回溯法的思想。查找路径要使用先序遍历，维护一个队列存储路径上每个节点的id，假设节点就在当前分支，如果当前分支查不到，则回溯。
```js
function treeFindPath (tree, func, path = []) {
  if (!tree) return []
  for (const data of tree) {
    path.push(data.id)
    if (func(data)) return path
    if (data.children) {
      const findChildren = treeFindPath(data.children, func, path)
      if (findChildren.length) return findChildren
    }
    path.pop()
  }
  return []
}
```
3.查找多条节点路径
思路与查找节点路径相似，不过代码却更加简单：
```js
function treeFindPath (tree, func, path = [], result = []) {
  for (const data of tree) {
    path.push(data.id)
    func(data) && result.push([...path])
    data.children && treeFindPath(data.children, func, path, result)
    path.pop()
  }
  return result
}
```