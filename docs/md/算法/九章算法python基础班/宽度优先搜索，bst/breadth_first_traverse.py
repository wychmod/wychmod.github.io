# coding=utf-8
from queue import Queue


class TreeNode:

    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None


def build_tree():
    node_1 = TreeNode(8)
    node_2 = TreeNode(3)
    node_3 = TreeNode(10)
    node_4 = TreeNode(1)
    node_5 = TreeNode(6)
    node_6 = TreeNode(14)
    node_7 = TreeNode(4)
    node_8 = TreeNode(7)
    node_9 = TreeNode(13)

    node_1.left = node_2
    node_1.right = node_3

    node_2.left = node_4
    node_2.right = node_5

    node_3.right = node_6

    node_5.left = node_7
    node_5.right = node_8

    node_6.left = node_9

    return node_1


def breadth_first_traverse(root):
    if not root:
        return

    que = Queue(maxsize=0)
    que.put(root)

    while not que.empty():
        cur = que.get()
        print(cur.val, end=' ')
        if cur.left:
            que.put(cur.left)
        if cur.right:
            que.put(cur.right)


def breadth_first_traverse_by_level(root):
    if not root:
        return

    que = Queue(maxsize=0)
    que.put(root)

    while not que.empty():
        n = que.qsize()
        for i in range(n):
            cur = que.get()
            print(cur.val, end=' ')
            if cur.left:
                que.put(cur.left)
            if cur.right:
                que.put(cur.right)
        print()


if __name__ == '__main__':
    root = build_tree()
    breadth_first_traverse_by_level(root)
