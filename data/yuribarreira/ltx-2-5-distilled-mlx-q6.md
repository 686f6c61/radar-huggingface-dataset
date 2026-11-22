# yuribarreira/LTX-2.5-Distilled-MLX-Q6

## Resumen

LTX-2.5-Distilled-MLX-Q6 es una cuantización de 6 bits en formato MLX del transformer DiT (Diffusion Transformer) destilado de 22B parámetros de Lightricks/LTX-2.5, un modelo de generación de vídeo con audio sincronizado a partir de texto. Lo publica el usuario yuribarreira como checkpoint "drop-in" para la herramienta `ltx-2-mlx`, pensado específicamente para ejecutar el modelo en Apple Silicon (chips M-series) con memoria unificada, un escenario donde las versiones BF16 o FP8 resultan demasiado pesadas.

El modelo resuelve un problema de despliegue: el DiT original en BF16 ocupa unos 44 GB, lo que lo hace inviable en la mayoría de equipos de consumo. Esta versión reduce el fichero del transformer a 15,96 GB (un 22,5 % menos que la cuantización Q8) manteniendo una paridad visual y de audio muy alta con respecto a Q8 según las mediciones del autor. La arquitectura subyacente es un DiT de 22B parámetros con generación conjunta de vídeo y audio, destilado para reducir el número de pasos de denoising.

Es relevante ahora porque demuestra que la generación de vídeo con audio de gama alta puede ejecutarse localmente en hardware de consumo Apple (M5 Pro con 64 GiB), con latencias de aproximadamente 75 segundos por clip de 97 frames a 768x512 y 24 fps. No es un modelo nuevo: es una receta de cuantización reproducible con métricas de fidelidad publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) destilado, 22B, generación conjunta de vídeo y audio |
| Parámetros totales | 22B (transformer destilado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 6 bits affine, group_size=64 (solo lineales 2D de `transformer_blocks`); embeddings, norms, AdaLN y proyecciones de salida en BF16 |
| Idiomas soportados | no disponible |
| Licencia | LTX-2.x Community License (license: other) |
| Formato de pesos | safetensors (MLX, 7.355 tensores, 15,958 GB) |

## Arquitectura y entrenamiento

El modelo base es un Diffusion Transformer de 22B parámetros en variante destilada (`ltx-2.5-22b-distilled-transformer-bf16.safetensors`), que genera vídeo y audio de forma conjunta. La destilación reduce el número de pasos de denoising necesarios en inferencia, lo que acelera la generación. El pipeline completo combina el DiT con un VAE, un vocoder, upscalers, un connector y un text encoder Gemma; esta cuantización solo sustituye el fichero del transformer.

La receta de cuantización afecta a las 1.632 capas lineales 2D (`.weight`) dentro de `transformer_blocks`, todas cuantizadas a 6 bits con `group_size=64` en modo affine, sin excepciones de empaquetado. Los componentes sensibles a la precisión (embeddings de frontera, norms, modulaciones AdaLN/timestep y proyecciones de salida) se mantienen en BF16. El autor publica un `quantization_policy.json` con el mapa por tensor. No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO).

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución configurable (768x512, 1280x704, 1152x768 en las pruebas del autor).
- Generación de audio sincronizado con el vídeo (audio-video), incluyendo tono ambiental de sala.
- Control de la banda sonora mediante prompt negativo y NAG (`--nag --negative-prompt`), que según el autor suprime música de fondo no deseada de forma más fiable que indicándolo en el prompt positivo.
- Decodificación de vídeo con dos modos: decodificador estándar y `--video-decoder diffusion`, que mejora la nitidez de piel y tejidos a mayor coste de decodificación.
- Generación por tiles para resoluciones altas (2 tiles a 1280x704, 3 tiles a 1152x768).
- Modo `--low-ram` para reducir el pico de memoria.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo explícito.

## Casos de uso

- Generación local de clips cortos en Apple Silicon: un usuario con un M5 Pro de 64 GiB puede producir clips de 97 frames a 768x512 y 24 fps en unos 75 segundos, sin depender de servicios en la nube.
- Prototipado de vídeo con audio para previsualización de guiones: el modelo genera imagen y sonido de forma conjunta, útil para maquetas de anuncios o secuencias antes de producción final.
- Iteración de prompts con control de banda sonora: el uso de prompt negativo con NAG permite obtener clips con solo tono ambiental, adecuado para insertos o b-roll sin música.
- Generación a resolución media-alta en equipos con memoria limitada: con 2 o 3 tiles se alcanzan 1280x704 y 1152x768 respectivamente, útil para contenido destinado a redes o presentaciones.
- Investigación en cuantización de modelos de difusión: el repositorio incluye métricas de paridad (coseno y RMSE de vídeo y audio) frente a BF16, Q8, MXFP8, MXFP4 y Q4, lo que sirve como referencia reproducible para estudiar el impacto de la cuantización.
- Integración en pipelines de generación de contenido con `ltx-2-mlx`: al ser un fichero drop-in, se puede sustituir el transformer en un pack existente sin cambiar el resto de componentes (VAE, vocoder, text encoder Gemma).

## Benchmarks y rendimiento

Paridad de una sola pasada del DiT frente a BF16 (medido en Apple M5 Pro, 64 GiB, macOS 27.2.1, mlx 0.32.2):

| Variante | Tamano DiT | Video Cos | Video RMSE | Audio Cos | Audio RMSE |
|---|---:|---:|---:|---:|---:|
| Q8 (affine g64) | 20,59 GB | 0,999805 | 0,02390 | 0,999681 | 0,01574 |
| MXFP8 (g32) | 20,02 GB | 0,992870 | 0,14793 | 0,994663 | 0,06530 |
| Mixed Calibrated | 13,20 GB | 0,987724 | 0,21676 | 0,989421 | 0,09092 |
| **Q6 (este repo)** | **15,96 GB** | **0,986826** | **0,20015** | **0,996734** | **0,05065** |
| MXFP4 (g32) | 10,74 GB | 0,984554 | 0,21650 | 0,970633 | 0,15176 |
| Q4 (affine g64) | 11,32 GB | 0,816431 | 0,71769 | 0,968157 | 0,15504 |

Benchmark end-to-end de 48 clips (6 escenarios x 2 semillas, 12 clips por variante):

| Variante | Tiempo medio | Denoise medio | s/paso | Pico MLX | Delta swap max | Clips silenciosos |
|---|---:|---:|---:|---:|---:|---:|
| Mixed Calibrated | 70,28 s | 57,38 s | 5,216 s | 29,45 GB | 0,0 MB | 0 |
| Q8 | 74,19 s | 60,88 s | 5,535 s | 29,45 GB | 0,0 MB | 0 |
| **Q6 (este repo)** | **74,69 s** | **61,12 s** | **5,557 s** | **29,45 GB** | **0,0 MB** | **0** |
| Q4 | 75,17 s | 61,32 s | 5,575 s | 29,45 GB | 0,0 MB | 0 |

Tiempos adicionales reportados por el autor con `--video-decoder diffusion`: 162,5 s sin tiles a 768x512x97; 416,1 s con 2 tiles a 1280x704x97; 551,6 s con 3 tiles a 1152x768x121.

## Requisitos de hardware

- VRAM/memoria unificada: pico medido de 29,45 GB de MLX en el benchmark end-to-end; el autor reporta 0,0 MB de swap en M5 Pro de 64 GiB.
- GPU recomendadas: Apple Silicon M-series con memoria unificada suficiente (M5 Pro 64 GiB es la referencia medida); no se documentan pruebas en A100, H100 ni RTX 4090, y el formato MLX está orientado a Apple Silicon.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en chips con 32-64 GiB de memoria unificada; en GPU NVIDIA no es directamente utilizable por el formato MLX.
- Despliegue: `ltx-2-mlx` (requiere soporte nativo de cuantización de 6 bits y por capa). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: aproximadamente 74,69 s por clip de 97 frames a 768x512 y 24 fps (5,557 s por paso de denoising) en M5 Pro; 162,5 s con decodificador de difusión sin tiles a esa misma resolución.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5-Distilled-MLX-Q6 (este) | 22B (DiT destilado) | no disponible | MLX safetensors, 15,96 GB | LTX-2.x Community License | Hugging Face |
| LTX-2.5-Distilled-MLX-Q8 | 22B | no disponible | MLX safetensors, 20,59 GB | LTX-2.x Community License | Hugging Face |
| LTX-2.5-Distilled-MLX-Mixed-Calibrated | 22B | no disponible | MLX safetensors, 13,20 GB (MXFP4+Q6+Q8) | LTX-2.x Community License | Hugging Face |
| LTX-2.5-Distilled-MLX-Q4 | 22B | no disponible | MLX safetensors, 11,32 GB | LTX-2.x Community License | Hugging Face |

Las alternativas comparables son otras cuantizaciones del mismo modelo base; no se dispone en la información proporcionada de comparaciones con modelos de vídeo de otros desarrolladores.

## Limitaciones y advertencias

- Solo funciona con `ltx-2-mlx` con soporte nativo de cuantización de 6 bits y por capa; no es un checkpoint genérico utilizable en otros runtimes.
- Es un fichero DiT drop-in: requiere el VAE, vocoder, upscalers, connector y text encoder Gemma de un pack LTX-2.5 MLX completo para funcionar.
- El uso del text encoder Gemma añade las condiciones de uso y la política de uso prohibido de Gemma además de la licencia LTX-2.x Community License.
- Licencia `other` (LTX-2.x Community License): conviene revisar las restricciones de uso comercial antes de desplegar en producción.
- La cuantización Q6 introduce una degradación medible frente a BF16 (coseno de vídeo 0,9868, RMSE 0,2002), aunque el autor indica que se mantiene visualmente próximo a Q8 en caras, manos, iluminación y geometría de fondo.
- La cuantización Q4 uniforme muestra una deriva visible en las mismas semillas (coseno de vídeo 0,8164), por lo que no se recomienda cuando se busca paridad con Q8.
- No se publican datos sobre sesgos, tasas de alucinación ni cobertura idiomática del modelo base en la información disponible.
- Todas las mediciones proceden de un único equipo (M5 Pro 64 GiB); el rendimiento en otros chips Apple puede variar.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuribarreira/LTX-2.5-Distilled-MLX-Q6
- Variante Mixed Calibrated: https://huggingface.co/yuribarreira/LTX-2.5-Distilled-MLX-Mixed-Calibrated
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Pack MLX Q8 de referencia (componentes no DiT): https://huggingface.co/dgrauet/ltx-2.5-mlx-q8
