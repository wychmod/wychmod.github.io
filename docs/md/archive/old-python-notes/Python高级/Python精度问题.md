# Python精度问题
在Python3.x以后就不存在单精度了，浮点型默认是64位，在numpy中的float64 = double， longdouble = float128，如果想要使用32位的浮点数，可以使用np.float32