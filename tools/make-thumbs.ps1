# Creates the light portraits used by the home conveyor: assets/home/<character-folder>.jpg
# Run it after adding a new character folder. Without a thumbnail the conveyor still works,
# it just loads the full-size Awaken art for that character.
$root = Join-Path (Split-Path $PSScriptRoot -Parent) 'Dominik'
$out = Join-Path $root 'assets\home'
Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force $out | Out-Null
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 82L
$size = 300
Get-ChildItem (Join-Path $root 'assets\characters') -Directory | ForEach-Object {
  $art = Get-ChildItem $_.FullName -File -Filter 'Awaken*.png' | Select-Object -First 1
  if (-not $art) { return }
  $dest = Join-Path $out "$($_.Name).jpg"
  if (Test-Path $dest) { return }
  $img = [System.Drawing.Image]::FromFile($art.FullName)
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.Clear([System.Drawing.Color]::FromArgb(16, 16, 18))
  $g.DrawImage($img, 0, 0, $size, $size)
  $bmp.Save($dest, $codec, $params)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
  "criada: $($_.Name).jpg"
}
