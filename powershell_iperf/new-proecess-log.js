


jsonBody = JSON.parse(req.body);
uploadBps = jsonBody["end"]["sum_sent"]["bits_per_second"]
downloadBps = jsonBody["end"]["sum_received"]["bits_per_second"]
location = jsonBody["location"]
location = location.toLowercase()
        .split(' ')
        .map((str) => str.charAt(0).toUpperCase() + str.substring(1))
        .join(' ')
/*code to read the time and format to pst */
timeStamp = jsonBody["start"]["timestamp"]["time"]

// Create a Date object from the time string
const date = new Date(timeStamp);

// Convert the date to Pacific Standard Time (PST) and output the result
const pstDateString = date.toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

console.log(pstDateString);
//i guess we should probably check if these values are undefined
uploadMbps = uploadBps / 1000000
uploadMbytes_sec = uploadMbps / 8
downloadMbps = downloadBps / 1000000
downloadMbytes_sec = downloadMbps / 8