param(
    [ValidateSet("pack","unpack")]
    [string]$Action
)

$packsDir     = Join-Path $PSScriptRoot "..\packs"
$packsJsonDir = Join-Path $PSScriptRoot "..\packs-json"

Write-Host "[packs] Running $Action on all packs..."

# Look at each subfolder in packs/
Get-ChildItem -Directory $packsDir | ForEach-Object {
    $packName = $_.Name
    $packPath = $_.FullName

    if ($Action -eq "unpack") {
        $outDir = Join-Path $packsJsonDir $packName
        Write-Host "Unpacking $packName -> $outDir"
        fvtt package unpack "$packName" --outputDirectory "$outDir"
    }
    elseif ($Action -eq "pack") {
        $inDir = Join-Path $packsJsonDir $packName
        if (Test-Path $inDir) {
            Write-Host "Packing $packName <- $inDir"
            fvtt package pack "$packName" --inputDirectory "$inDir"
        }
    }
}

Write-Host "[packs] Done."
