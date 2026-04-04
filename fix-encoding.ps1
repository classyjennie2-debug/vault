# Convert UTF-16 files to UTF-8 without BOM
$languages = @('es', 'pt', 'fr')
$encoding = [System.Text.UTF8Encoding]::new($false) # UTF-8 without BOM

foreach ($lang in $languages) {
    $filePath = "c:\Users\ade\Desktop\vault\public\locales\$lang\investments.json"
    
    try {
        # Read the UTF-16 file (Unicode in PowerShell is UTF-16LE)
        $content = Get-Content -Path $filePath -Encoding Unicode
        
        # Write as UTF-8 without BOM using StreamWriter
        $writer = New-Object System.IO.StreamWriter($filePath, $false, $encoding)
        $writer.Write($content)
        $writer.Close()
        
        Write-Host "Converted $lang to UTF-8 without BOM"
    } catch {
        Write-Host "Error converting ${lang}: $($_.Exception.Message)"
    }
}
