# leetcode刷题
[toc]
## 1. [两数之和](https://leetcode-cn.com/problems/two-sum/)
```python
class Solution(object):
    def twoSum(self, nums, target):
        dic = {}
        for i, num in enumerate(nums):
            if target-num in dic:
                return [dic[target-nums[i]], i]
            else:
                dic[num] = i
```

## 2. [两数相加](https://leetcode-cn.com/problems/add-two-numbers/)
```python
class Solution:
    def addTwoNumbers(self, l1: ListNode, l2: ListNode) -> ListNode:
        head, tail = None, None
        one = False # one 为True表示进位
        while l1 or l2:
            val = 0
            if l1:
                val += l1.val
                l1 = l1.next
            if l2:
                val += l2.val
                l2 = l2.next
            if one:
                val += 1
            if val >= 10: # 判断是否进位
                val -= 10
                one = True
            else:
                one = False
            if not head:
                head = tail = ListNode(val)
            else:
                tail.next = ListNode(val)
                tail = tail.next
        if one:
            tail.next = ListNode(1)
        return head


```

## 7. [整数反转](https://leetcode-cn.com/problems/reverse-integer/)
```python
class Solution(object):
    def reverse(self, x):
        if x < 0:
            return -self.reverse(-x)
        res = 0
        while x!=0:
            res = res*10 + x%10
            x //= 10
        return res if res < 0x7fffffff else 0

```

## 9. [回文数](https://leetcode-cn.com/problems/palindrome-number/)
```python
class Solution(object):
    def isPalindrome(self, x):
        if x < 0 or (x%10==0 and x!=0):
            return False
        res, y = 0, x
        while x!=0:
            res = res*10 + x%10
            x //= 10
        return True if y==res else False 

```

## 12. [整数转罗马数字](https://leetcode-cn.com/problems/integer-to-roman/)
```python
class Solution(object):
    def intToRoman(self, num):
        lookup = {
            'M': 1000, 
            'CM': 900, 
            'D': 500, 
            'CD': 400, 
            'C': 100, 
            'XC': 90, 
            'L': 50, 
            'XL': 40, 
            'X': 10, 
            'IX': 9, 
            'V': 5, 
            'IV': 4, 
            'I': 1
        }
        res = ''
        for key, value in sorted(lookup.items(), key=lambda t: t[1], reverse=True):
                while num >= value:
                    res += key
                    num -= value
        return res
```

## 14. [最长公共前缀](https://leetcode-cn.com/problems/longest-common-prefix/)
```python
class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        if not strs:
            return ''
        dp = strs[0]
        for i in range(1, len(strs)):
            while not strs[i].startswith(dp):
                dp = dp[:-1]
        return dp
```

## 19. [删除链表的倒数第 N 个结点](https://leetcode-cn.com/problems/remove-nth-node-from-end-of-list/)
```python
class Solution:
    def removeNthFromEnd(self, head: ListNode, n: int) -> ListNode:
        if not head or n==0:
            return head
        dummy = fast = slow = ListNode(-1, head)
        for _ in range(n):
            fast = fast.next
        while fast.next:
            fast = fast.next
            slow = slow.next
        slow.next = slow.next.next
        return dummy.next
```

## 20. [有效的括号](https://leetcode-cn.com/problems/valid-parentheses/)
```python
class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        for i in s:
            if i == '(':
                stack.append(')')
            elif i == '[':
                stack.append(']')
            elif i == '{':
                stack.append('}')
            else:
                if not stack:
                    return False
                tmp = stack.pop()
                if tmp != i:
                    return False
        if not stack:
            return True
        else:
            return False
```

## 21. [合并两个有序链表](https://leetcode-cn.com/problems/merge-two-sorted-lists/description/)
```python
class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        if not list1:
            return list2
        if not list2:
            return list1

        dummy = cur = ListNode(-1)
        while list1 and list2:
            if list1.val > list2.val:
                cur.next = list2
                list2 = list2.next
            else:
                cur.next = list1
                list1 = list1.next
            cur = cur.next
        
        cur.next = list1 if list1 else list2
        return dummy.next
```

## 26. [删除有序数组中的重复项](https://leetcode-cn.com/problems/remove-duplicates-from-sorted-array/)
```python
class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        index = 1
        for i in range(len(nums)):
            if i > 0 and nums[i] != nums[i-1]:
                nums[index] = nums[i]
                index += 1
        return index
```

## 27. [移除元素](https://leetcode-cn.com/problems/remove-element/)
```python
class Solution:
    def removeElement(self, nums: List[int], val: int) -> int:
        index = 0
        for i in nums:
            if i != val:
                nums[index] = i
                index += 1
        return index
```

## 80. [删除有序数组中的重复项 II](https://leetcode-cn.com/problems/remove-duplicates-from-sorted-array-ii/)
```python
class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        index = 2
        for i in range(len(nums)):
            if i > 1 and nums[i] != nums[index-2]:
                nums[index] = nums[i]
                index += 1
        return index
```

## 82. [删除排序链表中的重复元素 II](https://leetcode-cn.com/problems/remove-duplicates-from-sorted-list-ii/)
```python
class Solution:
    def deleteDuplicates(self, head: ListNode) -> ListNode:
        dummy = pre = ListNode(-1, head)
        while pre.next and pre.next.next:
            if pre.next.val == pre.next.next.val:
                tmp = pre.next.val
                while pre.next and tmp == pre.next.val:
                    pre.next = pre.next.next
            else:
                pre = pre.next
        return dummy.next
```

## 83. [删除排序链表中的重复元素](https://leetcode-cn.com/problems/remove-duplicates-from-sorted-list/)
```python
class Solution:
    def deleteDuplicates(self, head: ListNode) -> ListNode:
        dummy = head
        while head:
            if head.next and head.val == head.next.val:
                head.next = head.next.next
            else:
                head = head.next
        return dummy
```

## 86. [分隔链表](https://leetcode-cn.com/problems/partition-list/)
### 数组解决
```python
# 不稳定 不符合题意
class Solution:
    def partition(self, head: ListNode, x: int) -> ListNode:
        if not head:
            return head
        arr = []
        while head:
            arr.append(head)
            head = head.next

        less = -1
        index = 0
        more = len(arr) - 1
        while index < more:
            if arr[index].val < x:
                less += 1
                arr[less], arr[index] = arr[index], arr[less]
                index += 1
            elif arr[index].val == x:
                index += 1
            else:
                arr[more], arr[index] = arr[index], arr[more]
                more -= 1

        index = 0
        while index < len(arr) - 1:
            arr[index].next = arr[index + 1]
            index += 1
        arr[-1].next = None

        return arr[0]
```

### 多指针解决
```python
class Solution:
    def partition(self, head: ListNode, x: int) -> ListNode:
        if not head:
            return head
        shead = stail = ListNode(-1)
        bhead = btail = ListNode(-1)
        while head:
            if head.val < x:
                stail.next = head
                stail = stail.next
            else:
                btail.next = head
                btail = btail.next
            head = head.next
        # 注意截断
        btail.next = None
        stail.next = bhead.next
        return shead.next
```

## 92. [反转链表 II](https://leetcode-cn.com/problems/reverse-linked-list-ii/)
```python
class Solution:
    def reverseBetween(self, head: ListNode, left: int, right: int) -> ListNode:
        if left == right:
            return head
        if left == 1:
            return self.reverseN(head, right-left+1)
        else:
            first = head
            i= 1
            while i < left-1:
                head = head.next
                i += 1
            head.next = self.reverseN(head.next, right-left+1)
            return first

    # 反转链表n个节点
    def reverseN(self, head , n):
        pre = None
        next = None
        first = head
        i = 0
        while i<n:
            next = head.next
            head.next = pre
            pre = head
            head = next
            i+=1
        first.next = head
        return pre
```

## 94. [二叉树的中序遍历](https://leetcode-cn.com/problems/binary-tree-inorder-traversal/)
### 递归
```python
class Solution:
    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        arr = []
        def process(root):
            if not root:
                return
            process(root.left)
            arr.append(root.val)
            process(root.right)
        process(root)
        return arr
```
### 非递归
```python
class Solution:
    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        arr = []
        stk = []
        while root or stk:
            while root:
                stk.append(root)
                root = root.left
            root = stk.pop()
            arr.append(root.val)
            root = root.right
        return arr
```

## 98. [验证二叉搜索树](https://leetcode-cn.com/problems/validate-binary-search-tree/)
### 递归暴力版
```python
class Solution:
    def isValidBST(self, root: TreeNode) -> bool:
        if not root:
            return False
        def process(root):
            if not root:
                return None,None,True
            left_min, left_max, left_bst = process(root.left)
            right_min, right_max, right_bst = process(root.right)

            is_bst = True
            max = right_max if right_max else root.val
            min = left_min if left_min else root.val
            if right_min and right_min <= root.val:
                is_bst = False
            if left_max and left_max >= root.val:
                is_bst = False
            if not left_bst or not right_bst:
                is_bst = False 
            
            return min, max, is_bst
        n, x, b = process(root)
        return b
```
### 递归改良版
```python
class Solution:
    def isValidBST(self, root):
        
        def BFS(root, left, right):
            if root is None:
                return True
            
            if left < root.val < right:
                return BFS(root.left, left, root.val) and BFS(root.right, root.val, right)
            else:
                return False

        return BFS(root, -float('inf'), float('inf'))
```

### 中序遍历版
```python
class Solution:
    def isValidBST(self, root: TreeNode) -> bool:
        stack, inorder = [], float('-inf')
        
        while stack or root:
            while root:
                stack.append(root)
                root = root.left
            root = stack.pop()
            # 如果中序遍历得到的节点的值小于等于前一个 inorder，说明不是二叉搜索树
            if root.val <= inorder:
                return False
            inorder = root.val
            root = root.right

        return True

```

## 100. [相同的树](https://leetcode-cn.com/problems/same-tree/)
```python
class Solution:
    def isSameTree(self, p: TreeNode, q: TreeNode) -> bool:
        def process(one, two):
            if not one and not two:
                return True
            if not one or not two:
                return False
            if one.val == two.val:
                left_same = process(one.left, two.left)
                right_same = process(one.right, two.right)
                return left_same and right_same
            else:
                return False

        return process(p, q)

```

## 101. 对称二叉树
```python
class Solution:
    def isSymmetric(self, root: TreeNode) -> bool:
        if not root:
            return
        def process(left, right):
            if not left and not right:
                return True
            if not left or not right:
                return False
            if left.val != right.val:
                return False
            
            return process(left.left, right.right) and process(left.right, right.left)
        return process(root.left, root.right)
            
```

## 102. [二叉树的层序遍历](https://leetcode-cn.com/problems/binary-tree-level-order-traversal/)
```python
class Solution:
    def levelOrder(self, root: TreeNode) -> List[List[int]]:
        res = []
        if not root:
            return res
        
        from collections import deque
        deq = deque([root])
        while deq:
            size = len(deq)
            arr = []
            for _ in range(size):
                node = deq.popleft()
                arr.append(node.val)
                if node.left:
                    deq.append(node.left)  
                if node.right:
                    deq.append(node.right) 
            res.append(arr)
        return res
```

## 104. [二叉树的最大深度](https://leetcode-cn.com/problems/maximum-depth-of-binary-tree/)
```python
class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if root is None: 
            return 0 
        else: 
            left_height = self.maxDepth(root.left) 
            right_height = self.maxDepth(root.right) 
            return max(left_height, right_height) + 1 
```

## 107. 二叉树的层序遍历 II
```python
class Solution:
    def levelOrderBottom(self, root: TreeNode) -> List[List[int]]:
        res = []
        if not root:
            return res
        
        from collections import deque
        deq = deque([root])
        while deq:
            size = len(deq)
            arr = []
            for _ in range(size):
                node = deq.popleft()
                arr.append(node.val)
                if node.left:
                    deq.append(node.left)  
                if node.right:
                    deq.append(node.right) 
            res.append(arr)
        return res[::-1]
```

## 110. [平衡二叉树](https://leetcode-cn.com/problems/balanced-binary-tree/)
```python
class Solution:
    def isBalanced(self, root: TreeNode) -> bool:
        def process(root):
            if not root:
                return 0, True
            
            left_deep, left_isb = process(root.left)
            right_deep, right_isb = process(root.right)

            deep = max(left_deep, right_deep)+1
            isb = True
            if not left_isb or not right_isb or abs(left_deep-right_deep) > 1:
                isb = False
            return deep, isb

        dp, b = process(root)
        return b
```

## 138. [复制带随机指针的链表](https://leetcode-cn.com/problems/copy-list-with-random-pointer/)
### dic/map
```python
class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':
        dic = {}
        dummy = pre = head
        while head:
            dic.update({head: Node(head.val)})
            head = head.next
        while dummy:
            dic.get(dummy).next = dic.get(dummy.next)
            dic.get(dummy).random = dic.get(dummy.random)
            dummy = dummy.next
        return dic.get(pre)
```

### 赛元素 1 后面连一个1`节点
```python
class Solution:
    def copyRandomList(self, head: 'Node') -> 'Node':
        if not head:
            return None

        first = pre = head
        while pre:
            new = Node(pre.val, pre.next)
            pre.next = new
            pre = new.next

        while head:
            head.next.random = head.random.next if head.random else None
            head = head.next.next

        dummy = first.next

        while first:
            next = first.next
            first.next = next.next
            next.next = first.next.next  if first.next else None
            first = first.next
        
        return dummy
```

## 141. [环形链表](https://leetcode-cn.com/problems/linked-list-cycle/)
### 快慢指针实现
```python
class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        if not head or not head.next or not head.next.next:
            return False
        fast = head.next.next
        slow = head.next
        while slow != fast:
            if not fast.next or not fast.next.next:
                return False
            slow = slow.next
            fast = fast.next.next
        return True
```

### set实现
```python
class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        if not head or not head.next or not head.next.next:
            return False
        st = []
        while head:
            if head in st:
                return True
            else:
                st.append(head)
            head = head.next
        return False
```

## 142. [环形链表 II](https://leetcode-cn.com/problems/linked-list-cycle-ii/)
### 快慢指针实现
```python
class Solution:
    def detectCycle(self, head: ListNode) -> ListNode:
        if not head or not head.next or not head.next.next:
            return None
        fast = head.next.next
        slow = head.next
        while slow != fast:
            if not fast.next or not fast.next.next:
                return None
            slow = slow.next
            fast = fast.next.next
        
        slow = head
        while slow != fast:
            slow = slow.next
            fast = fast.next
        return slow
```

### set实现
```python
class Solution:
    def detectCycle(self, head: ListNode) -> ListNode:
        if not head or not head.next or not head.next.next:
            return None
        st = []
        while head:
            if head in st:
                return head
            else:
                st.append(head)
            head = head.next
        return None
```

## 143. [重排链表](https://leetcode-cn.com/problems/reorder-list/)
### 找中点+逆序+合并
```python
class Solution:
    def reorderList(self, head: ListNode) -> None:
        """
        Do not return anything, modify head in-place instead.
        """
        if not head:
            return
        
        mid = self.middleNode(head)
        l1 = head
        l2 = mid.next
        mid.next = None
        l2 = self.reverseList(l2)
        self.mergeList(l1, l2)
    
    def middleNode(self, head: ListNode) -> ListNode:
        slow = fast = head
        while fast.next and fast.next.next:
            slow = slow.next
            fast = fast.next.next
        return slow
    
    def reverseList(self, head: ListNode) -> ListNode:
        prev = None
        curr = head
        while curr:
            nextTemp = curr.next
            curr.next = prev
            prev = curr
            curr = nextTemp
        return prev

    def mergeList(self, l1: ListNode, l2: ListNode):
        while l1 and l2:
            l1_tmp = l1.next
            l2_tmp = l2.next

            l1.next = l2
            l1 = l1_tmp

            l2.next = l1
            l2 = l2_tmp
```

### 数组方法
```python
class Solution:
    def reorderList(self, head: ListNode) -> None:
        """
        Do not return anything, modify head in-place instead.
        """
        arr = []
        while head:
            arr.append(head)
            head = head.next
        i = 0
        m = len(arr)-1
        while i<m:
            arr[i].next = arr[m]
            i += 1
            if m == i:
                break
            arr[m].next = arr[i]
            m -= 1
        arr[m].next = None
```

## 144. [二叉树的前序遍历](https://leetcode-cn.com/problems/binary-tree-preorder-traversal/)
### 递归
```python
class Solution:
    def preorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        arr = []
        def process(root):
            if not root:
                return
            arr.append(root.val)
            process(root.left)
            process(root.right)
        process(root)
        return arr
```
### 非递归
```python
class Solution:
    def preorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        arr = []
        if not root:
            return []
        stk = []
        stk.append(root)
        while stk:
            node = stk.pop()
            arr.append(node.val)
            if node.right:
                stk.append(node.right)
            if node.left:
                stk.append(node.left)
        return arr
```

## 145. [二叉树的后序遍历](https://leetcode-cn.com/problems/binary-tree-postorder-traversal/)
### 递归
```python
class Solution:
    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        arr = []
        def process(root):
            if not root:
                return
            process(root.left)
            arr.append(root.val)
            process(root.right)
        process(root)
        return arr
```

### 非递归
```python
class Solution:
    def postorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        arr = []
        if not root:
            return []
        stk = []
        stk.append(root)
        while stk:
            node = stk.pop()
            arr.append(node.val)
            if node.left:
                stk.append(node.left)
            if node.right:
                stk.append(node.right)
        return arr[::-1]
        
class Solution:
    def postorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        arr = []
        if not root:
            return []
        stk = []
        node = None
        stk.append(root)
        while stk:
            node = stk[-1]
            if node.left and root != node.left and root != node.right:
                stk.append(node.left)
            elif node.right and root != node.right:
                stk.append(node.right)
            else:
                arr.append(stk.pop().val)
                root = node
        return arr
```



## 155. [最小栈](https://leetcode-cn.com/problems/min-stack/)
```python
class MinStack:

    def __init__(self):
        """
        initialize your data structure here.
        """
        self.stack = []
        self.min_stack = [math.inf]


    def push(self, val: int) -> None:
        self.stack.append(val)
        self.min_stack.append(min(val, self.min_stack[-1]))

    def pop(self) -> None:
        self.stack.pop()
        self.min_stack.pop()


    def top(self) -> int:
        return self.stack[-1]

    def getMin(self) -> int:
        return self.min_stack[-1]
```

## 160. [相交链表](https://note.youdao.com/)
### 复杂实现
```python
class Solution:
    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> ListNode:
        if not headA or not headB:
            return None
        a = prea = ListNode(-1, headA)
        b = preb = ListNode(-1, headB)
        aindex, bindex = 0, 0
        while a.next:
            a = a.next
            aindex += 1
        while b.next:
            b = b.next
            bindex += 1
        if a != b:
            return None
        lead = prea if (aindex - bindex) > 0 else preb
        second = prea if preb == lead else preb
        for _ in range(abs(aindex-bindex)):
            lead = lead.next
        while lead != second:
            lead = lead.next
            second = second.next
        return lead
```

### 简洁实现
```python
class Solution:
    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> ListNode:
        if not headA or not headB:
            return None
        a, b = headA, headB
        while a!=b:
            a = headB if a==None else a.next
            b = headA if b== None else b.next
        return a

```

## 203. [移除链表元素](https://leetcode-cn.com/problems/remove-linked-list-elements/)
```python
class Solution:
    def removeElements(self, head: ListNode, val: int) -> ListNode:
        if not head:
            return head
        dummy = pre = ListNode(-1, head)
        while head:
            if head.val == val:
                pre.next = head.next
                head = head.next
            else:
                pre = pre.next
                head = head.next
        return dummy.next
```

## 206. [反转链表](https://leetcode-cn.com/problems/reverse-linked-list/)
```python
class Solution:
    def reverseList(self, head: ListNode) -> ListNode:
        if not head:
            return None
        pre = None
        while head:
            last = head.next
            head.next = pre
            pre = head
            head = last
        return pre
```

## 215. [数组中的第K个最大元素](https://leetcode-cn.com/problems/kth-largest-element-in-an-array/)
**快排**
```python
class Solution(object):
    def findKthLargest(self, nums, k):
        """
        :type nums: List[int]
        :type k: int
        :rtype: int
        """
        return self.process(nums, 0, len(nums)-1, len(nums)-k)

    def process(self, arr, L, R, k):
        if L >= R:
            return arr[k]
        rand = random.randint(L, R)
        arr[R], arr[rand] = arr[rand], arr[R]
        equal_area = self.color_sort(arr, L, R)
        if k > equal_area[0] and k < equal_area[1]:
            return arr[k]
        elif k > equal_area[1]:
            return self.process(arr, equal_area[1]+1, R, k)
        else:
            return self.process(arr, L, equal_area[0]-1, k)


    def color_sort(self, arr, L, R):
        if L > R:
            return [-1, -1]
        if L == R:
            return [L, R]
        less = L - 1
        more = R
        index = L
        while index < more:
            if arr[index] < arr[R]:
                arr[less + 1], arr[index] = arr[index], arr[less + 1]
                index += 1
                less += 1
            elif arr[index] == arr[R]:
                index += 1
            else:
                arr[more - 1], arr[index] = arr[index], arr[more - 1]
                more -= 1
        arr[R], arr[more] = arr[more], arr[R]
        return [less + 1, more]
```

## 226. [翻转二叉树](https://leetcode-cn.com/problems/invert-binary-tree/)
```python
class Solution:
    def invertTree(self, root: TreeNode) -> TreeNode:

        def process(root):
            if not root:
                return None
            root.right, root.left = root.left, root.right
            process(root.right)
            process(root.left)

        process(root)
        return root
```

## 234. [回文链表](https://leetcode-cn.com/problems/palindrome-linked-list/)
**笔试用栈，面试改链表**
```python
class Solution:
    def isPalindrome(self, head: ListNode) -> bool:
        stack = []
        dummy = head
        while head:
            stack.append(head)
            head = head.next
        while dummy:
            if stack.pop().val != dummy.val:
                return False
            dummy = dummy.next
        return True
```

## 235. [二叉搜索树的最近公共祖先](https://leetcode-cn.com/problems/lowest-common-ancestor-of-a-binary-search-tree/)
```python
class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        if not root:
            return root
        if q.val < p.val:
            return self.lowestCommonAncestor(root, q, p)
        if p.val <= root.val <= q.val:
            return root
        if p.val > root.val:
            return self.lowestCommonAncestor(root.right, q, p)
        else:
            return self.lowestCommonAncestor(root.left, q, p)
```

## 236. [二叉树的最近公共祖先](https://leetcode-cn.com/problems/lowest-common-ancestor-of-a-binary-tree/)
### 暴力写法
```python
class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        if not root:
            return root
        def process(x, proot, qroot):
            if not x:
                return None, False, False
            l_parent, l_is_p, l_is_q = process(x.left, proot, qroot)
            r_parent, r_is_p, r_is_q = process(x.right, proot, qroot)
            is_p, is_q = False, False
            if x.val == proot.val:
                is_p = True
            if x.val == qroot.val:
                is_q = True
            is_p = l_is_p or r_is_p or is_p
            is_q = l_is_q or r_is_q or is_q
            parent = l_parent or r_parent
            if is_p and is_q:
                parent = x
                is_p = False
                is_q = False
            return parent, is_p, is_q
        return process(root, p, q)[0]
```
### 更简洁的递归
```python
class Solution:
    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:
        if not root or root == p or root == q: return root
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)
        if not left: return right
        if not right: return left
        return root

```

## 237. [删除链表中的节点](https://leetcode-cn.com/problems/delete-node-in-a-linked-list/)
```python
class Solution:
    def deleteNode(self, node):
        """
        :type node: ListNode
        :rtype: void Do not return anything, modify node in-place instead.
        """
        node.val = node.next.val
        node.next = node.next.next
```

## 297. [二叉树的序列化与反序列化](https://leetcode-cn.com/problems/serialize-and-deserialize-binary-tree/)
```python

class Codec:

    def serialize(self, root):
        """Encodes a tree to a single string.
        
        :type root: TreeNode
        :rtype: str
        """
        arr = []
        def ser(root):
            if root:
                arr.append(root.val)
                ser(root.left)
                ser(root.right)
            else:
                arr.append(None)
        ser(root)
        return str(arr)

        

    def deserialize(self, data):
        """Decodes your encoded data to tree.
        
        :type data: str
        :rtype: TreeNode
        """
        data_list = eval(data)
        def des(data_l):
            val = data_list.pop(0)
            if val == None:
                return None
            root = TreeNode(int(val))
            root.left = des(data_l)
            root.right = des(data_list)
            return root
        return des(data_list)
```
## 316. [去除重复字母](https://leetcode-cn.com/problems/remove-duplicate-letters/)
```python
class Solution:
    def removeDuplicateLetters(self, s: str) -> str:
        # 以字典的方式统计每个字母的次数
        dic = collections.Counter(s)

        stack = []
        for i in s:
            if i not in stack:
                # 查看当前字母是否比前一个小，同时前一个是否还有，前一个不能为0
                while stack and stack[-1] > i and dic.get(stack[-1]) > 0:
                    stack.pop()
                stack.append(i)
            dic[i] -= 1


        return ''.join(stack)
```
## 322. 凑零钱
### 暴力递归
```python
dp = [float('inf') for _ in range(amount+1)]
    dp[0] = 0
    for coin in coins:
        for rest in range(coin, amount+1):
            if rest - coin >= 0:
                dp[rest] = min(dp[rest - coin] + 1, dp[rest])

    return dp[amount] if dp[amount] != float('inf') else -1
```
### 记忆化搜索
```python
# rest为多少最少需要几张
        dp = [-1 for _ in range(amount+1)]
        dp[0] = 0
        def process(coins, rest, dp):
            if dp[rest] != -1:
                return dp[rest]
            zhang = float('inf')
            for coin in coins:
                if rest - coin >= 0:
                    zhang = min(process(coins, rest - coin, dp) + 1, zhang)
            dp[rest] = zhang
            return dp[rest]

        zhang = process(coins, amount, dp)
        return zhang if zhang != float('inf') else -1

```
### 动态规划
```python
dp = [float('inf') for _ in range(amount+1)]
        dp[0] = 0
        for coin in coins:
            for rest in range(coin, amount+1):
                if rest - coin >= 0:
                    dp[rest] = min(dp[rest - coin] + 1, dp[rest])

        return dp[amount] if dp[amount] != float('inf') else -1

```
## 331. [验证二叉树的前序序列化](https://leetcode-cn.com/problems/verify-preorder-serialization-of-a-binary-tree/)
### 有效节点替代
**把有效的叶子节点使用 "#" 代替。 比如把 4## 替换成 # 。此时，叶子节点会变成空节点！**
```python
class Solution:
    def isValidSerialization(self, preorder: str) -> bool:
        stack = []
        for i in preorder.split(','):
            stack.append(i)
            while len(stack) >= 3 and stack[-1] == stack[-2] == '#' and stack[-3] != '#':
                stack.pop(), stack.pop(), stack.pop()
                stack.append('#')
        return len(stack) == 1 and stack.pop() == '#'
```

### 出度入度解决法
**二叉树出度入度一定一样**
```python
class Solution:
    def isValidSerialization(self, preorder: str) -> bool:
        data_list = preorder.split(',')
        # 入度 首节点没有入度 #节点只有入度没有出度 普通节点1入度2出度
        du = -1
        for i in data_list:
            du += 1
            if du > 0:
                return False
            if i != '#':
                du -= 2
        return du == 0
```

## 394. [字符串解码](https://leetcode-cn.com/problems/decode-string/)
```python
class Solution:
    def decodeString(self, s: str) -> str:
        stack = []
        res = ''
        for i in s:
            if i == ']':
                tmp = stack.pop()
                sem = ''
                while tmp != '[':
                    sem = tmp + sem
                    tmp = stack.pop()
                
                num = ''
                while stack and stack[-1].isdigit():
                     tmp = stack.pop()
                     num = tmp + num

                res = int(num) * sem
                stack.append(res)
                
            else:
                stack.append(i)

        return ''.join(stack)

            
```

## 402. [移掉 K 位数字](https://leetcode-cn.com/problems/remove-k-digits/)
```python
class Solution:
    def removeKdigits(self, num: str, k: int) -> str:
        if len(num) == k:
            return "0"
        stack = []
        l = len(num)-k
        for i in num:
            while k and stack and stack[-1] > i:
                stack.pop()
                k -= 1
            stack.append(i)
        return ''.join(stack[:l]).lstrip('0') or '0'
```

## 414. [第三大的数](https://leetcode-cn.com/problems/third-maximum-number/)
```python
class Solution:
    def thirdMax(self, nums: List[int]) -> int:
        if not nums:
            return None
        a, b, c =  float('-inf'), float('-inf'), float('-inf')
        for i in nums:
            if i > a:
                a, b, c = i, a, b
            elif i > b and i!=a:
                b, c = i, b
            elif i > c and i!=b and i!=a:
                c = i
        return a if c== float('-inf') else c

```

## 502. [IPO](https://leetcode-cn.com/problems/ipo/)
**大根堆实现贪心**
```python
class Solution:
    def findMaximizedCapital(self, k: int, w: int, profits: List[int], capital: List[int]) -> int:
        heapb = []
        heaps = sorted(zip(capital, profits), key=lambda x:x[0])
        idx = 0
        for i in range(k):
            while idx<len(profits) and heaps[idx][0] <= w:
                heapq.heappush(heapb, -heaps[idx][1])
                idx += 1
            if heapb:
                w -= heapq.heappop(heapb)
            else:
                break
        return w

```


## 543. [二叉树的直径](https://leetcode-cn.com/problems/diameter-of-binary-tree/)
```python
class Solution:
    def diameterOfBinaryTree(self, root: TreeNode) -> int:
        if not root:
            return 0
        def process(root):
            if not root:
                return 0, 0
            left_deep, left_width = process(root.left)
            right_deep, right_width = process(root.right)

            width = max(max(left_width, right_width), left_deep+right_deep)
            deep = max(left_deep, right_deep)+1
            return deep, width
        
        d, w = process(root)
        return w
```

## 617. [合并二叉树](https://leetcode-cn.com/problems/merge-two-binary-trees/)
```python
class Solution:
    def mergeTrees(self, root1: TreeNode, root2: TreeNode) -> TreeNode:
        if not root1 and not root2:
            return None
        def process(r1, r2):
            if not r1 and not r2:
                return None
            elif not r1 and r2:
                return r2
            elif not r2 and r1:
                return r1
            else:
                r1.val = r1.val + r2.val
                r1.right = process(r1.right, r2.right)
                r1.left = process(r1.left, r2.left)
                return r1
        root1 = process(root1, root2)
        return root1

class Solution:
    def mergeTrees(self, root1: TreeNode, root2: TreeNode) -> TreeNode:
        if not root1:
            return root2
        if not root2:
            return root1
           
        root1.val = root1.val + root2.val
        root1.right = self.mergeTrees(root1.right, root2.right)
        root1.left = self.mergeTrees(root1.left, root2.left)
        return root1
```

## 662. [二叉树最大宽度](https://leetcode-cn.com/problems/maximum-width-of-binary-tree/)
**层序遍历，使用位置节点来判断 左孩子2*i+1 右孩子2*i+2**
```python
class Solution:
    def widthOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        from collections import deque
        deq = deque([root])
        res = 0
        root.val = 0
        while deq:
            size = len(deq)
            res = max(res, deq[-1].val-deq[0].val+1)
            for i in range(size):
                node = deq.popleft()
                if node.left:
                    node.left.val = node.val*2+1
                    deq.append(node.left)
                if node.right:
                    node.right.val = node.val*2+2
                    deq.append(node.right)
        return res
```

## 700. [二叉搜索树中的搜索](https://note.youdao.com/)
```python
class Solution:
    def searchBST(self, root: TreeNode, val: int) -> TreeNode:
        if not root:
            return None
        if val == root.val:
            return root
        elif root.val > val:
            return self.searchBST(root.left, val)
        elif root.val < val:
            return self.searchBST(root.right, val)
```
## 739. [每日温度](https://leetcode-cn.com/problems/daily-temperatures/)
```python
class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        stack = []
        ans = [0]*len(temperatures)
        for i, temper in enumerate(temperatures):
            while stack and temperatures[stack[-1]] < temper:
                tmp = stack.pop()
                ans[tmp] = i - tmp
            
            stack.append(i)
        return ans

```

## 768. [最多能完成排序的块 II](https://leetcode-cn.com/problems/max-chunks-to-make-sorted-ii/)
```python
class Solution:
    def maxChunksToSorted(self, arr: List[int]) -> int:
        stack = []
        for i in arr:
            if stack and stack[-1] > i:
                m = stack[-1]
                while stack and stack[-1] > i:
                    stack.pop()
                stack.append(m)
            else:
                stack.append(i)
        return len(stack)    
```

## 821. [字符的最短距离](https://leetcode-cn.com/problems/shortest-distance-to-a-character/)
**贪心：左右两边各过一遍**
```python
class Solution:
    def shortestToChar(self, s: str, c: str) -> List[int]:
        res = [0 if s[n]==c else None for n in range(len(s))]

        for i in range(1, len(s)):
            if res[i] != 0 and res[i-1] is not None:
                res[i] = res[i-1]+1

        for i in range(len(s)-2, -1, -1):
            if res[i] is None or res[i+1]+1 < res[i]:
                res[i] = res[i+1]+1

        return res
```

## 876. [链表的中间结点](https://leetcode-cn.com/problems/middle-of-the-linked-list/)
```python
class Solution:
    def middleNode(self, head: ListNode) -> ListNode:
        if not head or not head.next or not head.next.next:
            return head
        fast = head.next.next
        slow = head
        while fast.next and fast.next.next:
            fast = fast.next.next
            slow = slow.next
        return slow
```

## 946. [验证栈序列](https://leetcode-cn.com/problems/validate-stack-sequences/)
```python
class Solution:
    def validateStackSequences(self, pushed: List[int], popped: List[int]) -> bool:
        stack = []
        index = 0
        for i in pushed:
            stack.append(i)
            while popped and stack and popped[index] == stack[-1]:
                index += 1
                stack.pop()
        return len(stack) == 0
```


## 989. [数组形式的整数加法](https://leetcode-cn.com/problems/add-to-array-form-of-integer/)
```python
class Solution:
    def addToArrayForm(self, A: List[int], K: int) -> List[int]:
        carry = 0
        for i in range(len(A) - 1, -1, -1):
            A[i], carry = (carry + A[i] + K % 10) % 10, (carry + A[i] + K % 10) // 10
            K //= 10
        B = []
        # 如果全部加完还有进位，需要特殊处理。 比如 A = [2], K = 998
        carry = carry + K
        while carry:
            B = [(carry) % 10] + B
            carry //= 10
        return B + A
```

## 2095. [删除链表的中间节点](https://leetcode-cn.com/problems/delete-the-middle-node-of-a-linked-list/)
```python
class Solution:
    def deleteMiddle(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if not head or not head.next:
            return None
        fast = head.next
        slow = head
        while fast.next and fast.next.next:
            fast = fast.next.next
            slow = slow.next
        slow.next = slow.next.next
        return head
```

## 2104. [子数组范围和](https://leetcode-cn.com/problems/sum-of-subarray-ranges/)
```python
class Solution:
    def subArrayRanges(self, nums: List[int]) -> int:
        res = 0
        for i in range(len(nums)):
            big, less = float("-inf"), float("inf")
            for j in range(i, len(nums)):
                big = max(big, nums[j])
                less = min(less, nums[j])
                res += big-less
        
        return res

```

## 剑指 Offer 18. [删除链表的节点](https://leetcode-cn.com/problems/shan-chu-lian-biao-de-jie-dian-lcof/)
```python
class Solution:
    def deleteNode(self, head: ListNode, val: int) -> ListNode:
        if not head:
            return head
        dummy = pre = ListNode(-1, head)
        while pre and pre.next:
            if pre.next.val == val:
                pre.next = pre.next.next
            pre = pre.next
        return dummy.next

```

## 剑指 Offer 22. [链表中倒数第k个节点](https://leetcode-cn.com/problems/lian-biao-zhong-dao-shu-di-kge-jie-dian-lcof/)
```python
class Solution:
    def getKthFromEnd(self, head: ListNode, k: int) -> ListNode:
        if not head or k==0:
            return head
        fast = slow = ListNode(-1, head)
        for _ in range(k):
            fast = fast.next
        while fast.next:
            fast = fast.next
            slow = slow.next
        return slow.next
```

## 剑指 Offer 51. [数组中的逆序对](https://leetcode-cn.com/problems/shu-zu-zhong-de-ni-xu-dui-lcof/)
**思路：与求小和一致，逻辑相反 归并排序**
```python
class Solution(object):
    def reversePairs(self, nums):
        """
        :type nums: List[int]
        :rtype: int
        """
        if nums is None or len(nums) < 2:
            return 0
        return self.merge_sort(nums, 0, len(nums)-1)
    
    def merge_sort(self, arr, L, R):
        if L == R:
            return 0
        mid = L + (R-L)//2
        return self.merge_sort(arr, L, mid) + self.merge_sort(arr, mid+1, R) + self.merge(arr, L, mid, R)
    
    
    def merge(self, arr, L, mid, R):
        tmp = []
        res, p1, p2 = 0, L, mid+1
        while p1 <= mid and p2 <= R:
            if arr[p1] > arr[p2]:
                res += (mid - p1 + 1)
                tmp.append(arr[p2])
                p2 += 1
            else:
                tmp.append(arr[p1])
                p1 += 1
                res += 0
        while p1 <= mid:
            tmp.append(arr[p1])
            p1 += 1
        while p2 <= R:
            tmp.append(arr[p2])
            p2 += 1
        arr[L:R+1] = tmp
        return res
```

## 剑指 Offer 53 - II. 0～n-1中缺失的数字
```python
class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        for i in range(len(nums)):
            if nums[i] != i:
                print(i)
                return i
        return len(nums)
```
面试题 08.06. [汉诺塔问题](https://leetcode-cn.com/problems/hanota-lcci/)
```python
class Solution:
    def hanota(self, A: List[int], B: List[int], C: List[int]) -> None:
        def process(n, fo, to, other):
            if n == 1:
                to.append(fo.pop())
            else:
                process(n+1, fo, other, to)
                to.append(fo.pop())
                process(n+1, other, to, fo)
        n = len(A)
        process(n, A, C, B)
```