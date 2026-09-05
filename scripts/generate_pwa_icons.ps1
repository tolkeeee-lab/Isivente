Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\fenou\.gemini\antigravity-ide\brain\8dd56731-914c-4449-8de2-39c7a10b915e\.user_uploaded\media_1788572617857.png"
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

# Sample background color
$bgColor = $src.GetPixel(400, 200)
Write-Host ("Background Color: #{0:X2}{1:X2}{2:X2}" -f $bgColor.R, $bgColor.G, $bgColor.B)

# Sample arrow color
$arrowColor = $src.GetPixel(380, 560)
Write-Host ("Arrow Color: #{0:X2}{1:X2}{2:X2}" -f $arrowColor.R, $arrowColor.G, $arrowColor.B)

function Resize-Image($source, $width, $height, $targetPath) {
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
    $destImage = New-Object System.Drawing.Bitmap($width, $height)
    $destImage.SetResolution($source.HorizontalResolution, $source.VerticalResolution)

    $graphics = [System.Drawing.Graphics]::FromImage($destImage)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $wrapMode = New-Object System.Drawing.Imaging.ImageAttributes
    $wrapMode.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)
    $graphics.DrawImage($source, $destRect, 0, 0, $source.Width, $source.Height, [System.Drawing.GraphicsUnit]::Pixel, $wrapMode)
    $graphics.Dispose()

    $destImage.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destImage.Dispose()
    Write-Host "Created: $targetPath"
}

# Ensure directories exist
$iconsDir = "c:\Users\fenou\.antigravity-ide\Isivente\public\icons"
$imagesDir = "c:\Users\fenou\.antigravity-ide\Isivente\public\images"
if (!(Test-Path $iconsDir)) { New-Item -ItemType Directory -Path $iconsDir -Force }
if (!(Test-Path $imagesDir)) { New-Item -ItemType Directory -Path $imagesDir -Force }

# Generate PWA icons
Resize-Image $src 512 512 "$iconsDir\icon-512x512.png"
Resize-Image $src 192 192 "$iconsDir\icon-192x192.png"
Resize-Image $src 180 180 "$iconsDir\apple-touch-icon.png"
Resize-Image $src 144 144 "$iconsDir\icon-144x144.png"
Resize-Image $src 96 96 "$iconsDir\icon-96x96.png"
Resize-Image $src 72 72 "$iconsDir\icon-72x72.png"
Resize-Image $src 48 48 "$iconsDir\icon-48x48.png"
Resize-Image $src 32 32 "$iconsDir\favicon-32x32.png"
Resize-Image $src 16 16 "$iconsDir\favicon-16x16.png"

# Save main logo in images directory too
Resize-Image $src 512 512 "$imagesDir\logo.png"
Resize-Image $src 192 192 "$imagesDir\isivente-logo.png"

$src.Dispose()
Write-Host "PWA icons generation completed!"
