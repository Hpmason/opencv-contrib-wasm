# Grab git source
(
    git clone --branch 4.5.3 --depth 1 https://github.com/opencv/opencv.git
    cd opencv
    git clone --branch 4.5.3 --depth 1 https://github.com/opencv/opencv_contrib.git
)
# Build
(
    cd ./opencv/opencv_contrib &&
    git checkout 4.5.3 &&
    cd ../ &&
    git checkout 4.5.3 &&
    ls &&
    # Add non async flag before compiling in the python build_js.py script
    docker run --rm --workdir /code -v "$PWD":/code "trzeci/emscripten:sdk-tag-1.39.4-64bit" python ./platforms/js/build_js.py build_wasm --build_wasm --build_test --cmake_option="-DOPENCV_EXTRA_MODULES_PATH=/code/opencv_contrib/modules" --build_flags "-s WASM=1 -s WASM_ASYNC_COMPILATION=0 -s SINGLE_FILE=0 "
)

# Copy compilation result
cp -a ./opencv/build_wasm/ ./build_wasm

# Transpile opencv.js files
node opencvJsMod.js

# Beautify JS
(
    cd ./build_wasm/bin &&
    npx js-beautify opencv.js -r &&
    npx js-beautify opencv-deno.js -r
)

# Copy bins to root
(
    cp ./build_wasm/bin/opencv.wasm ../opencv.wasm &&
    cp ./build_wasm/bin/opencv-bin.js ../opencv-bin.js &&
    cp ./build_wasm/bin/opencv.js ../opencv.js &&
    cp ./build_wasm/bin/opencv-deno.js ../opencv-deno.js &&
    cp -r ./build_wasm/ ../build_wasm_test
)
