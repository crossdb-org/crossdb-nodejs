{
  "targets": [
    {
      "target_name": "crossdb",
      "sources": [ "src/crossdb_binding.cc" ],
      "libraries": [
            "-L/usr/local/lib",
            "-lcrossdb"
          ],
      "cflags": ["-std=c++17"],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "include_dirs": ["<!@(node -p \"require('node-addon-api').include\")"],
      "dependencies": ["<!(node -p \"require('node-addon-api').gyp\")"],
      "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"]
    }
  ]
}