Add-Type -AssemblyName System.Drawing

$uploads = "C:\Users\fenou\.gemini\antigravity-ide\brain\7d7deeb2-a255-4f47-865c-7bbdce5fd010\.user_uploaded"
$destDir = "c:\Users\fenou\.antigravity-ide\Isivente\public\images"

function Crop-Image($sourceFile, $destFile, $cropX, $cropY, $cropW, $cropH) {
    $src = [System.Drawing.Image]::FromFile($sourceFile)
    $targetBmp = New-Object System.Drawing.Bitmap($cropW, $cropH)
    $g = [System.Drawing.Graphics]::FromImage($targetBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)
    $g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    
    $targetBmp.Save($destFile, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    
    $g.Dispose()
    $targetBmp.Dispose()
    $src.Dispose()
    Write-Host "Saved: $destFile ($cropW x $cropH)"
}

# 1. Spider (media_1788880735372.png) - 1024x544
# Photo is from X=144, Y=145, Width=370, Height=325
Crop-Image "$uploads\media_1788880735372.png" "$destDir\microscope-real-spider.jpg" 144 145 370 325

# 2. Leaf (media_1788880737708.png)
# Photo is from X=205, Y=145, Width=245, Height=325
Crop-Image "$uploads\media_1788880737708.png" "$destDir\microscope-real-leaf.jpg" 205 145 245 325

# 3. Ladybug (media_1788880746211.png)
# Photo is from X=205, Y=145, Width=245, Height=325
Crop-Image "$uploads\media_1788880746211.png" "$destDir\microscope-real-ladybug.jpg" 205 145 245 325

# 4. Fabric (media_1788880748966.png)
# Photo is from X=205, Y=145, Width=245, Height=325
Crop-Image "$uploads\media_1788880748966.png" "$destDir\microscope-real-fabric.jpg" 205 145 245 325

Write-Host "Done!"
