param(
    [Parameter(
        Mandatory)]
    [string]$serverIp,
    [string]$serverPort,
    [Parameter(
        Mandatory)]
    [string]$locationName,
    [string]$iPerfPath
)

$captureResults = ""
$portExists = $PSBoundParameters.ContainsKey("serverPort")
$iperfExeExists = $PSBoundParameters.ContainsKey("iPerfPath")

$saveResHere = Join-Path (Get-Location).Path "iPerfJSON.json"

#path to the iperf3 executable
$iPerfExePath = "C:\Users\vboxuser\Downloads\iperf3.17.1_64\iperf3.17.1_64\iperf3.exe"
if($iperfExeExists){
    $iPerfExePath = $iPerfPath
}
else{
    $iPerfExePath = Join-Path (Get-Location).Path "iperf3.exe"
}

#check if the path exists
if(!(Test-Path -LiteralPath $iPerfExePath -PathType leaf)){
    #stop the script of the path doesn't exist
    Write-Host "The given iPerf file path does not exist: $iPerfExePath" -ForegroundColor Red
    return 1
}



#exectue the iperf file as the client and talk to the server with
#ip address $serverIp. Output the results in JSON fomrat
if($portExists){
    $captureResults = & $iPerfExePath -c $serverIp -p $serverPort -J
}
else{
    $captureResults = & $iPerfExePath -c $serverIp -J
}

#Note that the client is the sender (bitrate is upload speeds) and
#then receiver is the server (bitrate is download speeds)

$resultsAsJSON = $captureResults | ConvertFrom-Json
$resultsASJson | Add-Member -NotePropertyName "location" -NotePropertyValue $locationName

if($resultsASJson.error){
    Write-Host "There was an issue with the iPerf results" -ForegroundColor Red
    return
}
else{
    Write-Host "No error reported from iPerf. Now trying to upload iPerf results" -ForegroundColor Green
}

#note that this will overwrite the conent of the file
$resultsAsJSON | ConvertTo-Json | Set-Content -Path $saveResHere
$url = "https://raslo.vercel.app/api/upload-log"

# Create a boundary for the multipart/form-data
$boundary = [System.Guid]::NewGuid().ToString()

# Read the file content
$fileBytes = [System.IO.File]::ReadAllBytes($saveResHere)

# Convert bytes to a string (using UTF8 encoding)
$fileContent = [System.Text.Encoding]::UTF8.GetString($fileBytes)

$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"$([System.IO.Path]::GetFileName($filePath))`"",
    "Content-Type: application/json",
    "",
    $fileContent,
    "--$boundary--"
)

# Join the body with CRLF
$body = $bodyLines -join "`r`n"

# Set the content type to multipart/form-data and include the boundary
$headers = @{
    "Content-Type" = "multipart/form-data; boundary=$boundary"
}

# Perform the API request using Invoke-WebRequest
try {
    $response = Invoke-WebRequest -Uri $url -Method Post -Body $body -Headers $headers

    Write-Host -ForegroundColor green $($response.Content)
}
catch {
    Write-Host "If the following error mentions a FUNCTION_INVOCATION_TIMEOUT it can probably be disregarded. If any 
    other message is provide it could mean that the script failed to connect to the backend or the
    data couldn't be processed" -ForegroundColor Yellow
    Write-Host -ForegroundColor red $_
}
