build = open('wa-resources/js-resources/_order.txt')
writeTo = open('wa-resources/wa_resources.js', 'w')

def writeText(fileName):
	for line in fileName:
		writeTo.write(line)
	writeTo.write('\n\n\n')

jsFiles = [];

for line in build:
	jsFiles.append(line)

for f in jsFiles:
	text = open('wa-resources/js-resources/' + f.rstrip())
	writeText(text)


