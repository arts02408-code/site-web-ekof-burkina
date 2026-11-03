param(
  [int]$Port = 8000
)

$ErrorActionPreference = "Stop"
$root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".png"  = "image/png"
  ".xml"  = "application/xml; charset=utf-8"
  ".txt"  = "text/plain; charset=utf-8"
  ".md"   = "text/markdown; charset=utf-8"
}

function Write-Response($Response, [int]$Status, [string]$ContentType, [byte[]]$Body) {
  try {
    $Response.StatusCode = $Status
    $Response.ContentType = $ContentType
    $Response.ContentLength64 = $Body.Length
    $Response.OutputStream.Write($Body, 0, $Body.Length)
  } catch {
    Write-Warning "Réponse interrompue : $($_.Exception.Message)"
  } finally {
    try { $Response.Close() } catch {}
  }
}

try {
  $listener.Start()
  Write-Host "EKOF preview : http://localhost:$Port/ (Ctrl+C pour arrêter)"

  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $path = [Uri]::UnescapeDataString($request.Url.AbsolutePath.TrimStart("/"))

    if ($path -match "^wp-json/wp/v2/") {
      Write-Response $context.Response 404 "text/plain; charset=utf-8" ([Text.Encoding]::UTF8.GetBytes("API non disponible dans cet aperçu."))
      continue
    }

    if ($path -match "^wp-json/wc/store/?(.*)$") {
      $apiPath = $Matches[1].TrimEnd("/")
      if ($request.HttpMethod -ne "GET" -or $apiPath -notmatch "^products(?:/\d+|/categories|/brands)?$") {
        Write-Response $context.Response 404 "text/plain; charset=utf-8" ([Text.Encoding]::UTF8.GetBytes("Route catalogue non autorisée."))
        continue
      }

      $upstreamUrl = "https://ekofburkina.com/wp-json/wc/store/$apiPath$($request.Url.Query)"
      try {
        $upstream = Invoke-WebRequest -Uri $upstreamUrl -Method Get -Headers @{ Accept = "application/json" } -UseBasicParsing -TimeoutSec 30
        $body = [Text.Encoding]::UTF8.GetBytes([string]$upstream.Content)
        if ($upstream.Headers["X-WP-TotalPages"]) {
          $context.Response.Headers.Add("X-WP-TotalPages", [string]$upstream.Headers["X-WP-TotalPages"])
        }
        Write-Response $context.Response ([int]$upstream.StatusCode) "application/json; charset=utf-8" $body
      } catch {
        Write-Warning "Échec de l'API EKOF : $($_.Exception.Message)"
        $errorBody = [Text.Encoding]::UTF8.GetBytes('{"error":"Le catalogue EKOF est momentanément inaccessible."}')
        Write-Response $context.Response 502 "application/json; charset=utf-8" $errorBody
      }
      continue
    }

    if ($request.HttpMethod -notin @("GET", "HEAD")) {
      Write-Response $context.Response 405 "text/plain; charset=utf-8" ([Text.Encoding]::UTF8.GetBytes("Méthode non autorisée."))
      continue
    }

    if ([string]::IsNullOrWhiteSpace($path)) {
      $path = "index.html"
    }
    $file = [System.IO.Path]::GetFullPath((Join-Path $root $path))
    $rootPrefix = $root.TrimEnd("\") + "\"
    if (-not $file.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $file -PathType Leaf)) {
      Write-Response $context.Response 404 "text/plain; charset=utf-8" ([Text.Encoding]::UTF8.GetBytes("Fichier introuvable."))
      continue
    }

    $extension = [System.IO.Path]::GetExtension($file).ToLowerInvariant()
    $contentType = if ($mimeTypes.ContainsKey($extension)) { $mimeTypes[$extension] } else { "application/octet-stream" }
    $body = [System.IO.File]::ReadAllBytes($file)
    if ($request.HttpMethod -eq "HEAD") {
      $context.Response.StatusCode = 200
      $context.Response.ContentType = $contentType
      $context.Response.ContentLength64 = $body.Length
      $context.Response.Close()
    } else {
      Write-Response $context.Response 200 $contentType $body
    }
  }
} finally {
  if ($listener.IsListening) {
    $listener.Stop()
  }
  $listener.Close()
}
