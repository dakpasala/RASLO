param(
    [Parameter(
        Mandatory)]
    [string]$serverIp,
    [string]$serverPort,
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
    $saveResHere = "iPerfResSaveHere"
}

#path to the iperf3 executable
$iPerfExePath = "C:\Users\vboxuser\Downloads\iperf3.17_64\iperf3.17_64\iperf3.exe"
if(!($iperfExeExists)){
    $iPerfExePath = $iPerfPath
}
else{
    $iPerfExePath = "iperf3.exe"
}


#exectue the iperf file as the client and talk to the server with
#ip address $serverIp. Output the results in JSON fomrat
if($keyExists){
    $captureResults = & $iPerfExePath -c $serverIp -p $serverPort -J
}
else{
    $captureResults = & $iPerfExePath -c $serverIp -J
}

#bottom thing sorta does same as above but asks for admin privelages
#Start-Process -FilePath $iPerfExePath -ArgumentList "-V -c $serverIp"

#Note that the client is the sender (bitrate is upload speeds) and
#then receiver is the server (bitrate is download speeds)
#Write-Output $captureResults

Set-Content -Path $saveResHere -Value $captureResults


#run python executable
#.\pythonExectuableName $saveResHere



#todo
#parse the json to create a new json object
#the new json object will then be sent to the database
#we can do this using the curl command
#look at https://powershellcommands.com/powershell-curl