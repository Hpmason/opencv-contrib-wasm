import { cv, cvTranslateError } from '../../mod.ts';

import { assertStrictEquals, assertEquals } from "https://deno.land/std@0.83.0/testing/asserts.ts";
// Jimp doesn't support the Deno runtime atm https://github.com/oliver-moran/jimp/issues/942
// so we use Deno's JPEG
import JPEG from "https://deno.land/x/jpeg/mod.ts";

(async () => {
    const raw = await Deno.readFile('../input/image-sample-1.jpg');
    const result = JPEG.decode(raw);
    console.log(result);
    let image_data = {
        width: result.width,
        height: result.height,
        data: result.data
    };
    var src = await cv.matFromImageData(image_data);

    let dst = new cv.Mat();
    let M = cv.Mat.ones(5, 5, cv.CV_8U);
    let anchor = new cv.Point(-1, -1);
    cv.dilate(src, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

    let image = {
        width: dst.cols,
        height: dst.rows,
        data: dst.data
    };
    let jpegData = JPEG.encode(image, 100);
    await Deno.writeFile('../test-output/dilation.jpg', jpegData.data);
})();
