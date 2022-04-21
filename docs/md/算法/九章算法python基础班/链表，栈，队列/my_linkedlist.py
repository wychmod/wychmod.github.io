# coding=utf-8


class ListNode:

    def __init__(self, val):
        self.val = val
        self.next = None


class MyLinkedList:

    def __init__(self):
        self.head = None

    def get(self, location):
        cur = self.head
        for i in range(location):
            cur = cur.next
        return cur.val

    def add(self, location, val):
        if location > 0:
            pre = self.head
            for i in range(location - 1):
                pre = pre.next
            new_node = ListNode(val)
            new_node.next = pre.next
            pre.next = new_node
        elif location == 0:
            new_node = ListNode(val)
            new_node.next = self.head
            self.head = new_node

    def set(self, location, val):
        cur = self.head
        for i in range(location):
            cur = cur.next
        cur.val = val

    def remove(self, location):
        if location > 0:
            pre = self.head
            for i in range(location - 1):
                pre = pre.next

            pre.next = pre.next.next

        elif location == 0:
            self.head = self.head.next

    def traverse(self):
        cur = self.head
        while cur is not None:
            print(cur.val, end=' ')
            cur = cur.next
        print()

    def is_empty(self):
        return self.head is None


if __name__ == '__main__':
    ll = MyLinkedList()
    ll.add(0, 1)
    ll.add(1, 3)
    ll.add(2, 5)
    ll.add(3, 7)

    ll.add(0, 9)
    ll.add(1, 100)
    ll.traverse()

    print(ll.get(1))
    print(ll.get(3))

    ll.set(0, -100)
    ll.set(2, 32)
    ll.traverse()

    ll.remove(2)
    ll.traverse()
