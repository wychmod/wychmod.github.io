# coding=utf-8


class ListNode:

    def __init__(self, val):
        self.val = val
        self.next = None


def build_linkedlist():
    print('Build linked list')
    node_1 = ListNode(1)
    node_2 = ListNode(3)
    node_3 = ListNode(5)
    node_4 = ListNode(7)

    node_1.next = node_2
    node_2.next = node_3
    node_3.next = node_4

    return node_1


def run_linkedlist_example():
    print('LinkedList example')
    node_1 = ListNode(1)
    node_2 = ListNode(3)
    node_3 = ListNode(5)
    node_4 = ListNode(7)

    node_1.next = node_2
    node_2.next = node_3
    node_3.next = node_4

    cur = node_1
    while cur is not None:
        print(cur.val, end=' ')
        cur = cur.next
    print('\n')


def run_linkedlist_quiz_1():
    print('LinkedList quiz 1')
    node_1 = ListNode(1)
    node_2 = ListNode(3)
    node_3 = ListNode(5)
    node_4 = ListNode(7)

    node_1.next = node_2
    node_2.next = node_3
    node_3.next = node_4

    node_2 = node_3

    cur = node_1
    while cur is not None:
        print(cur.val, end=' ')
        cur = cur.next
    print('\n')


def run_linkedlist_quiz_2():
    print('LinkedList quiz 2')
    node_1 = ListNode(1)
    node_2 = ListNode(3)
    node_3 = ListNode(5)
    node_4 = ListNode(7)

    node_1.next = node_2
    node_2.next = node_3
    node_3.next = node_4

    node_1 = node_2

    cur = node_1
    while cur is not None:
        print(cur.val, end=' ')
        cur = cur.next
    print('\n')


def run_linkedlist_quiz_3():
    print('LinkedList quiz 3')
    node_1 = ListNode(1)
    node_2 = ListNode(3)
    node_3 = ListNode(5)
    node_4 = ListNode(7)

    node_1.next = node_2
    node_2.next = node_3
    node_3.next = node_4

    node_1.next = node_3

    cur = node_1
    while cur is not None:
        print(cur.val, end=' ')
        cur = cur.next
    print('\n')


if __name__ == '__main__':
    run_linkedlist_quiz_3()
