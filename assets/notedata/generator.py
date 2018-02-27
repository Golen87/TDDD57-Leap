import random

def r():
	return random.randint(0,5)

off = 12

for i in range(16):
	print r(), off+16*i + 0
	print r(), off+16*i + 3.5
	print r(), off+16*i + 8
	print r(), off+16*i + 11
	print r(), off+16*i + 12
	print r(), off+16*i + 12.5
	print r(), off+16*i + 13
