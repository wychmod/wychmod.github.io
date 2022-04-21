# coding=utf-8


class SetListImpl:

    def __init__(self):
        self.data = []

    def add(self, val):
        if not self.contains(val):
            self.data.append(val)

    def contains(self, val):
        for num in self.data:
            if num == val:
                return True
        return False


if __name__ == '__main__':

    my_set = SetListImpl()

    for i in range(100):
        my_set.add(i)

    success = True
    for i in range(100):
        if not my_set.contains(i):
            success = False

    print(success)