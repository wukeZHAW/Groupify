# Fisher-Yates-Shuffle
import random

def shuffle(array):
    last_index = len(array)-1

    while last_index > 0:
        rand_index = random.randint(0, last_index)
        temp = array[last_index]
        array[last_index] = array[rand_index]
        array[rand_index] = temp

        last_index -= 1
    
array = [1,2,3,4,5,6,7]

shuffle(array)

print(array)