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
if($keyExists){
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


#$captureResults | Set-Content -Path .\saveHereTest.json
#Write-Host $captureResults

#$resultsAsJSON = Out-String -InputObject $captureResults | ConvertFrom-Json
$resultsAsJSON = $captureResults | ConvertFrom-Json
#$resultsAsJSON | Add-Member -Type NoteProperty -Name "location" -Value $locationName
$resultsASJson | Add-Member -NotePropertyName "location" -NotePropertyValue $locationName
$resultsAsJSON | ConvertTo-Json | Set-Content -Path .\saveHereTest.json

#todo
#parse the json to create a new json object
#the new json object will then be sent to the database
#we can do this using the curl command
#look at https://powershellcommands.com/powershell-curl