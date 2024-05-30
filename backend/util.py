import io
import base64
from PIL import Image, ImageDraw
from svgpathtools import Path, parse_path, svgstr2paths

def img_to_base64(img, name):
    buf = io.BytesIO()
    img.save(buf, 'JPEG')
    b = buf.getvalue()
    return (name, b, "image/jpeg")

def base64_to_img(b64_str):
    out = base64.b64decode(b64_str)
    buf = io.BytesIO(out)
    return Image.open(buf)

def sample_path(path):
    points = []
    for segment in path:
        for t in [i / 1000 for i in range(1000 + 1)]:
            point = segment.point(t)
            points.append((point.real, point.imag))
    return points

def svg_to_mask(svg_str, shape, name="mask"):
    svg = svgstr2paths(svg_str)
    path = svg[0][0]
    image = Image.new("1", shape, 0)
    draw = ImageDraw.Draw(image)
    points = sample_path(path)
    draw.polygon(points, outline=1, fill=1)
    return image

# Takes in PIL.Image type
# Assumes are of bool type
def union_mask(a, b):
    a_ = np.array(a)
    b_ = np.array(b)
    out = np.logical_or(a_, b_)
    return Image.fromarray(out)

def is_neighbor(mask, i, j):
    a, b, c, d = False, False, False, False

    if (i > 0):
        a = mask[i - 1][j]
    if (i < mask.shape[0] - 1):
        b = mask[i + 1][j]
    if (j > 0):
        c = mask[i][j - 1]
    if (j < mask.shape[1] - 1):
        d = mask[i][j + 1]
    return a or b or c or d

def widen_mask(mask):
    invert = np.invert(mask)
    new_mask = np.copy(mask)
    for i in range(mask.shape[0]):
        for j in range(mask.shape[1]):
            if (not mask[i][j] and is_neighbor(mask, i, j)):
                new_mask[i][j] = True
    return new_mask