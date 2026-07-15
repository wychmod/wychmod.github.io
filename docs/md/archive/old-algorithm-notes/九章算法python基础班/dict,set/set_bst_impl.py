# coding=utf-8


class TreeNode:

    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None


class SetBSTImpl:

    def __init__(self):
        self.__root = None

    def add(self, val):
        if not self.contains(val):
            self.__root = self.__add_helper(self.__root, val)

    def __add_helper(self, root, val):
        if not root:
            return TreeNode(val)
        if val < root.val:
            root.left = self.__add_helper(root.left, val)
        else:
            root.right = self.__add_helper(root.right, val)

        return root

    def contains(self, val):
        return self.__contains_helper(self.__root, val)

    def __contains_helper(self, root, val):
        if not root:
            return False

        if root.val == val:
            return True
        elif val < root.val:
            return self.__contains_helper(root.left, val)
        else:
            return self.__contains_helper(root.right, val)


if __name__ == '__main__':

    my_set = SetBSTImpl()

    for i in range(100):
        my_set.add(i)

    success = True
    for i in range(100):
        if not my_set.contains(i):
            success = False

    print(success)
