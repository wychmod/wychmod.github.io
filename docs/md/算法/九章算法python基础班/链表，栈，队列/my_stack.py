# coding=utf-8


class MyStack:
    """使用List模拟栈"""
    def __init__(self):
        self.items = []

    def is_empty(self):
        return not self.items

    def push(self, item):
        self.items.append(item)

    def pop(self):
        return self.items.pop()

    def peek(self):
        if not self.is_empty():
            return self.items[-1]

    def size(self):
        return len(self.items)


if __name__ == '__main__':
    my_stack = MyStack()
    for i in range(50):
        my_stack.push(i)

    while not my_stack.is_empty():
        print(my_stack.pop(), end=' ')
    print()
