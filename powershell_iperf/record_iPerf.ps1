param(
    [Parameter(
        Mandatory)]
    [string]$serverIp,
    [string]$serverPort,
    [Parameter(
        Mandatory)]
    [string]$locationName,
    [string]$iPerfPath,
    [string]$saveResHere
)
$captureResults = ""
$keyExists = $PSBoundParameters.ContainsKey("saveResHere")
$portExists = $PSBoundParameters.ContainsKey("serverPort")
$iperfExeExists = $PSBoundParameters.ContainsKey("iPerfPath")

#check if the location given is valid; this is case--insensitive
$validLocations = @("Raslo", "Sierra Vista", "Selma Carlson", "Twin Cities",
                    "French", "Arroyo Grande")
if($locationName -ne "Raslo" -and
    $locationName -ne "Sierra Vista" -and
    $locationName -ne "Selma Carlson" -and
    $locationName -ne "Twin Cities" -and
    $locationName -ne "French" -and
    $locationName -ne "Arroyo Grande"){
    
    Write-Host "The location name '$locationName' is invalid"  -ForegroundColor Red
    Write-Host "Valid location names are: $($validLocations -join ', ')" -ForegroundColor Red
    return
}
#if no file given to save results create a file path
if(!($keyExists)){
    #Write-Output "parameter does not exist"
    $saveResHere = "iPerfResults.log"
}

#path to the iperf3 executable
$iPerfExePath = "C:\Users\vboxuser\Downloads\iperf3.17.1_64\iperf3.17.1_64\iperf3.exe"
if($iperfExeExists){
    $iPerfExePath = $iPerfPath
}
else{
    #$iPerfExePath = "iperf3.exe"
}

#check if the path exists
if(!(Test-Path -LiteralPath $iPerfExePath -PathType leaf)){
    #stop the script of the path doesn't exist
    Write-Host "The given file path does not exists: $iPerfExePath" -ForegroundColor Red
    return
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
#Write-Output $captureResults

#note that this will overwrite the conent of the file
Set-Content -Path $saveResHere -Value $captureResults

$resultsAsJSON = $captureResults | ConvertFrom-Json
$resultsASJson | Add-Member -NotePropertyName "location" -NotePropertyValue $locationName

if($resultsASJson.error){
    Write-Host "There was an issue with the iPerf results" -ForegroundColor Red
    return
}
else{
    Write-Host "No error reported from iPerf. Now trying to upload iPerf results"
}

$resultsAsJSON | ConvertTo-Json | Set-Content -Path .\iPerfJSON.json

$url = "https://raslo.vercel.app/api/upload-log"
# Get the current directory (where the script is running)
$currentDir = Get-Location

# Define the file path relative to the current directory
$jsonFile = Join-Path $currentDir "iPerfJSON.json"

# Check if the file exists
if (-not (Test-Path $jsonFile)) {
    Write-Host "File not found: $jsonFile"
    exit 1
}


# Create a boundary for the multipart/form-data
$boundary = [System.Guid]::NewGuid().ToString()

# Read the file content
$fileBytes = [System.IO.File]::ReadAllBytes($jsonFile)

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
$response = Invoke-WebRequest -Uri $url -Method Post -Body $body -Headers $headers

Write-Output $($response.Content)
<#
$url = "https://raslo.vercel.app/api/upload-log"
$jsonFile = Get-Item -Path .\iPerfJSON.json
Write-Host $jsonFile
$postBody = @{
    file = $jsonFile
}
$response = Invoke-WebRequest -Method Post -Uri $url -Body $postBody #-Body ($resultsASJson | ConvertTo-Json)
Write-Output $($response.message)
#>