from imageSize import imageSize
import shutil
import os

PATH_05x  = "../assets/graphics/0.5x/"
PATH_075x = "../assets/graphics/0.75x/"
PATH_1x   = "../assets/graphics/1x/"
PATH_125x = "../assets/graphics/1.25x/"
PATH_15x  = "../assets/graphics/1.5x/"
PATH_175x = "../assets/graphics/1.75x/"
PATH_2x   = "../assets/graphics/2x/"

def main() :
    
    shutil.rmtree(PATH_05x);  shutil.copytree(PATH_2x, PATH_05x)
    shutil.rmtree(PATH_075x); shutil.copytree(PATH_2x, PATH_075x)
    shutil.rmtree(PATH_1x);   shutil.copytree(PATH_2x, PATH_1x)
    shutil.rmtree(PATH_125x); shutil.copytree(PATH_2x, PATH_125x)
    shutil.rmtree(PATH_15x);  shutil.copytree(PATH_2x, PATH_15x)
    shutil.rmtree(PATH_175x); shutil.copytree(PATH_2x, PATH_175x)
    
    def getSize(width, height, factor):
        return str(round(height / 2 * factor)) + " " + str(round(width / 2 * factor))
    
    def processFile(dir):
        for file in os.listdir(dir):
            file = os.path.join(dir, file)
            if os.path.isfile(file):
                if file.count(".png") or file.count(".jpg")\
                                      or file.count(".jpeg"):
                    width, height = imageSize(file)
                    os.system("sips -z " + getSize(width, height, 0.5)  + " '" + file.replace(PATH_2x, PATH_05x)  + "'")
                    os.system("sips -z " + getSize(width, height, 0.75) + " '" + file.replace(PATH_2x, PATH_075x) + "'")
                    os.system("sips -z " + getSize(width, height, 1)    + " '" + file.replace(PATH_2x, PATH_1x)   + "'")
                    os.system("sips -z " + getSize(width, height, 1.25) + " '" + file.replace(PATH_2x, PATH_125x) + "'")
                    os.system("sips -z " + getSize(width, height, 1.5)  + " '" + file.replace(PATH_2x, PATH_15x)  + "'")
                    os.system("sips -z " + getSize(width, height, 1.75) + " '" + file.replace(PATH_2x, PATH_175x) + "'")
            else:
                processFile(file)
    
    processFile(PATH_2x)
    
if __name__ == "__main__":
    main()
