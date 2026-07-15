# coding=utf-8
from my_linkedlist import ListNode
from queue import Queue


class MyQueue:
    """使用Linked list模拟队列"""
    def __init__(self):
        self.count = 0
        self.head = None
        self.tail = None

    def enqueue(self, value):
        node = ListNode(value)
        if self.head is None:
            self.head = node
            self.tail = node
        else:
            self.tail.next = node
            self.tail = node
        self.count += 1

    def dequeue(self):
        if self.head is None:
            raise Exception('This is a empty queue')
        cur = self.head
        self.head = cur.next
        self.count -= 1
        return cur.val

    def is_empty(self):
        return self.head is None  # self.count == 0

    def size(self):
        return self.count


if __name__ == '__main__':
    # my_que = MyQueue()
    # for i in range(50):
    #     my_que.enqueue(i)
    #
    # while not my_que.is_empty():
    #     print(my_que.dequeue(), end=' ')
    # print()

    # queue module
    que = Queue()
    for i in range(50):
        que.put(i)

    while not que.empty():
        print(que.get(), end=' ')
    print()
    print(que.qsize())
