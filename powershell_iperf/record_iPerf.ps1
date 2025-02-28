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
}
else{
    Write-Host "No error reported from iPerf. Now trying to upload iPerf results"
}

$resultsAsJSON | ConvertTo-Json | Set-Content -Path .\saveHereTest.log

$url = "https://raslo.vercel.app/api/upload-log"
$response = Invoke-RestMethod -Method 'Post' -Uri $url #-Body ($resultsASJson | ConvertTo-Json)
Write-Output $($response.message)