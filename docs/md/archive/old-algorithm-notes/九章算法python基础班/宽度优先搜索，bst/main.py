# coding=utf-8
from binary_search_tree import BST

bst = BST()

bst.add(10)
bst.add(11)

print(bst.contains(10))
print(bst.contains(11))
print(bst.contains(9))