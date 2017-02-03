build = open('js/_order.txt')
writeTo = open('build/dawblocks.js', 'w')

def writeText(fileName):
	for line in fileName:
		writeTo.write(line)
	writeTo.write('\n\n\n')

jsFiles = [];

for line in build:
	jsFiles.append(line)

for f in jsFiles:
	text = open('js/' + f.rstrip())
	writeText(text)


