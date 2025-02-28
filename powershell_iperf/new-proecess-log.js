


jsonBody = JSON.parse(req.body);
uploadBps = jsonBody["end"]["sum_sent"]["bits_per_second"]
downloadBps = jsonBody["end"]["sum_received"]["bits_per_second"]
location = jsonBody["location"]
location = location.toLowercase()
        .split(' ')
        .map((str) => str.charAt(0).toUpperCase() + str.substring(1))
        .join(' ')
timeStamp = jsonBody["start"]["timestamp"]["time"]
//i guess we should probably check if these values are undefined
uploadMbps = uploadBps / 1000000
uploadMbytes_sec = uploadMbps / 8
downloadMbps = downloadBps / 1000000
downloadMbytes_sec = downloadMbps / 8