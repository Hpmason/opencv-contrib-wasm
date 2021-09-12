import { cv, cvTranslateError } from '../../mod.ts';

import { assertStrictEquals, assertEquals } from "https://deno.land/std@0.83.0/testing/asserts.ts";
// Jimp doesn't support the Deno runtime atm https://github.com/oliver-moran/jimp/issues/942
// so we use Deno's PNGS
import { encode, decode } from "https://deno.land/x/pngs/mod.ts";


(async () => {
    try {
        const imageSource = decode(await Deno.readFile('../input/image-sample-2.png'));
        const imageTemplate = decode(await Deno.readFile('../input/image-sample-2-template.png'));
        
        let src = cv.matFromImageData({
            width: imageSource.width,
            height: imageSource.height,
            data: imageSource.image
        });
        let templ = cv.matFromImageData({
            width: imageTemplate.width,
            height: imageTemplate.height,
            data: imageTemplate.image
        });
        let processedImage = new cv.Mat();
        let mask = new cv.Mat();
    
        cv.matchTemplate(src, templ, processedImage, cv.TM_CCOEFF_NORMED, mask);
        cv.threshold(processedImage, processedImage, 0.999, 1, cv.THRESH_BINARY);
        processedImage.convertTo(processedImage, cv.CV_8UC1);

        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
    
        cv.findContours(processedImage, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        for (let i = 0; i < contours.size(); ++i) {
            let countour = contours.get(i).data32S; // Contains the points
            let x = countour[0];
            let y = countour[1];
            
            let color = new cv.Scalar(0, 255, 0, 255);
            let pointA = new cv.Point(x, y);
            let pointB = new cv.Point(x + templ.cols, y + templ.rows);
            cv.rectangle(src, pointA, pointB, color, 2, cv.LINE_8, 0);
        }

        let pngData = encode(src.data, src.cols, src.rows);
        await Deno.writeFile('../test-output/template-matching-ts.png', pngData);
    
    } catch (err) {
        console.log(cvTranslateError(cv, err));
    }
})();
