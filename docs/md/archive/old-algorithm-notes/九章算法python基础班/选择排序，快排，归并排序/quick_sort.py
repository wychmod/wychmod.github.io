# coding=utf-8
from random import randint


def quick_sort(array):
    quick_sort_helper(array, 0, len(array) - 1)


def quick_sort_helper(array, left, right):   # [left, right]
    if left >= right:
        return

    pivot = array[randint(left, right)]

    i, j = left, right

    while i <= j:
        while i <= j and array[i] < pivot:
            i += 1

        while i <= j and array[j] > pivot:
            j -= 1

        if i <= j:
            array[i], array[j] = array[j], array[i]
            i += 1
            j -= 1

    quick_sort_helper(array, left, j)
    quick_sort_helper(array, i, right)


def test_quick_sort():

    freq = {}
    array = []
    for i in range(100):
        num = randint(0, 10000)
        array.append(num)
        if num in freq:
            freq[num] += 1
        else:
            freq[num] = 1

    quick_sort(array)

    if len(array) != 100:
        return False

    new_freq = {}
    for num in array:
        if num in new_freq:
            new_freq[num] += 1
        else:
            new_freq[num] = 1

    if freq != new_freq:
        return False

    for i in range(1, 100):
        if array[i] < array[i - 1]:
            return False

    return True


if __name__ == '__main__':
    array = [6, 4, 5, 7, 2, 4, 3, 4, 7, 8]

    quick_sort(array)
    for num in array:
        print(num, end=' ')
    print()

    cnt = 0
    for i in range(1000):
        if test_quick_sort():
            cnt += 1
    print(cnt == 1000)
