import random

p = None
def r(seq=[0,1,2,3,4,5]):
	global p
	d = random.choice(seq)
	while d == p:
		d = random.choice(seq)
	p = d
	return d

pos = 4
s = None

for j in range(2):
	pos += 8

	for i in range(4):
		print r(), pos + 0
		print r(), pos + 3.5
		print r(), pos + 8
		print r(), pos + 11
		s = r()
		print s, pos + 12
		print s, pos + 12.5
		print s, pos + 13
		pos += 16

	for i in range(2):
		print r([0,3,4,5]), pos + 0
		print r([0,3,4,5]), pos + 4
		print r([0,3,4,5]), pos + 8
		print r([0,3,4,5]), pos + 11
		for s in [1,2]:
			print s, pos + 12
			print s, pos + 12.5
			print s, pos + 13

		if i == 1:
			pos += 2
			print r([0,3]), pos + 13
			print r([0,3]), pos + 13.5
			for s in [4,5]:
				print s, pos + 14
				print s, pos + 15
				print s, pos + 16
		pos += 16

	for i in range(4):
		print r(), pos + 6.5
		print r(), pos + 7.5
		print r(), pos + 8
		if i < 3:
			print r([0,3]), pos + 13
			print r([0,3]), pos + 13.5
			for s in [4,5]:
				print s, pos + 14
				print s, pos + 15
				print s, pos + 16
		else:
			print r(), pos + 9.5
			print r(), pos + 10.5
			print r(), pos + 11
		pos += 16
	pos += 14
