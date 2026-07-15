# coding=utf-8


def selection_sort(array):
    n = len(array)
    for i in range(n):
        min_index = i
        for j in range(i + 1, n):
            if array[j] < array[min_index]:
                min_index = j
        array[i], array[min_index] = array[min_index], array[i]


if __name__ == '__main__':
    array = [6, 4, 5, 7, 2, 4, 3, 4, 7, 8]
    selection_sort(array)

    for num in array:
        print(num, end=' ')
    print()
