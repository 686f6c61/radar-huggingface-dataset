# yuri-rod/LTX-2.5-22B-Distilled-DiT-6bit

## Resumen

LTX-2.5 22B Distilled DiT 6-bit es una cuantización de 6 bits en formato MLX del modelo de difusión de vídeo (DiT) destilado de Lightricks LTX-2.5, publicada por el usuario yuri-rod. El modelo original es un transformer de difusión de 22.000 millones de parámetros orientado a generación de vídeo (text-to-video, image-to-video) y de vídeo con audio (text-to-audio-video e image-to-audio-video). Esta versión reduce el checkpoint del DiT de 20,59 GB (Q8) a 15,96 GB mediante cuantización afín de 6 bits con tamaño de grupo 64, manteniendo las capas de frontera, normalizaciones, modulaciones AdaLN y proyecciones de salida en BF16.

La relevancia de esta ficha radica en que permite ejecutar un modelo de vídeo de 22B en Apple Silicon con memoria unificada, un escenario tradicionalmente reservado a GPUs de datacenter. Según las mediciones del autor en un Apple M5 Pro con 64 GiB, el modelo completa un clip de 97 frames a 768x512 en unos 74,69 segundos de media, con un pico de 29,45 GB de memoria MLX y sin swap, lo que lo sitúa como una alternativa práctica para prototipado local en macOS.

El repo tiene 16,0 GB, licencia ltx-2.x-community-license y está etiquetado con los idiomas en, de, es, fr, ja, ko, zh, it y pt. No es un modelo de lenguaje: es un componente DiT que debe combinarse con VAE, vocoder, upscalers, connector y el codificador de texto Gemma de un pack LTX-2.5 MLX para funcionar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) destilado, cuantizado en MLX |
| Parámetros totales | 22B (modelo base LTX-2.5) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vídeo; ventana de frames configurable, p. ej. 97 o 121 frames) |
| Tipos de cuantización | 6-bit afín, group_size=64; lineales 2D cuantizados, capas de frontera/norms/AdaLN en BF16 |
| Idiomas soportados | en, de, es, fr, ja, ko, zh, it, pt |
| Licencia | ltx-2.x-community-license (other) |
| Formato de pesos | safetensors (MLX), 7.355 tensores, 15,958 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión (DiT) destilado de 22B parámetros, base Lightricks/LTX-2.5, en su variante `ltx-2.5-22b-distilled-transformer-bf16.safetensors`. La cuantización afecta a las 1.632 capas lineales 2D `.weight` dentro de `transformer_blocks`, aplicando `bits=6, group_size=64, mode="affine"` sin excepciones de empaquetado. Se mantienen en BF16 las embeddings de frontera, las normalizaciones, las modulaciones AdaLN/timestep y las proyecciones de salida. El resultado son 7.355 tensores y 15,958 GB, con un mapa por tensor en `quantization_policy.json`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en la información proporcionada. La model card indica que es una variante destilada, lo que implica menos pasos de difusión que la versión no destilada, y que el pipeline soporta `--distilled`, `--low-ram`, `--nag` con prompt negativo y `--video-decoder diffusion` para mejorar nitidez de piel y tejidos a mayor coste de decodificación.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución configurable, por ejemplo 768x512, 1280x704 o 1152x768.
- Generación de vídeo a partir de imagen (image-to-video).
- Generación conjunta de vídeo y audio (text-to-audio-video e image-to-audio-video), con soporte de prompt negativo para suprimir música de fondo no deseada.
- Control de seed para reproducibilidad y paridad frame a frame con la variante Q8.
- Soporte multilingüe en prompts para en, de, es, fr, ja, ko, zh, it y pt.
- Decodificación de vídeo con decoder de difusión opcional para mayor nitidez.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; es un modelo generativo de vídeo, no un LLM de agentes.

## Casos de uso

- Prototipado local de vídeo generativo en macOS: el modelo cabe en un Apple M5 Pro de 64 GiB con pico de 29,45 GB y sin swap, lo que permite iterar clips de 97 frames a 768x512 en torno a 75 segundos por clip sin depender de la nube.
- Generación de clips con audio sincronizado: al soportar text-to-audio-video, se puede usar para crear piezas breves con ambiente sonoro y diálogo, útil en previsualización de anuncios o storyboards.
- Image-to-video para animar ilustraciones o fotografías: partiendo de una imagen fija, el modelo genera movimiento coherente con la escena, adecuado para marketing y contenido para redes.
- Postproducción y doblaje de escenas: combinado con el prompt negativo y `--nag`, se puede generar vídeo con tono de sala natural y sin música de fondo, facilitando el montaje posterior.
- Investigación en cuantización de modelos de difusión: el repo publica métricas de paridad (coseno y RMSE de vídeo y audio) frente a Q8, MXFP8, MXFP4 y Q4, lo que lo convierte en un banco de pruebas para estudiar el impacto de la cuantización afín de 6 bits en DiT de vídeo.
- Generación de material de formación o demo: clips cortos multilingües (prompts en español, francés, japonés, etc.) para tutoriales o presentaciones, con coste de hardware contenido en estaciones Apple Silicon.
- Pruebas de pipelines de vídeo en CI: al ser un fichero DiT drop-in, se puede integrar en tests automatizados que verifiquen que el pipeline `ltx-2-mlx` produce clips no silenciosos y con paridad aceptable frente a Q8.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos en Apple M5 Pro (64 GiB), macOS 27.2.1, Python 3.13.18 y mlx 0.32.2, con componentes no DiT fijados a `dgrauet/ltx-2.5-mlx-q8`.

Paridad de una sola pasada del DiT frente a BF16:

| Variante | Tamano DiT | Video Cos | Video RMSE | Audio Cos | Audio RMSE |
|---|---:|---:|---:|---:|---:|
| Q8 (affine g64) | 20,59 GB | 0,999805 | 0,02390 | 0,999681 | 0,01574 |
| MXFP8 (g32) | 20,02 GB | 0,992870 | 0,14793 | 0,994663 | 0,06530 |
| Mixed Calibrated | 13,20 GB | 0,987724 | 0,21676 | 0,989421 | 0,09092 |
| Q6 (este repo) | 15,96 GB | 0,986826 | 0,20015 | 0,996734 | 0,05065 |
| MXFP4 (g32) | 10,74 GB | 0,984554 | 0,21650 | 0,970633 | 0,15176 |
| Q4 (affine g64) | 11,32 GB | 0,816431 | 0,71769 | 0,968157 | 0,15504 |

Benchmark end-to-end de 48 clips (6 escenarios x 2 seeds, 12 clips por variante):

| Variante | Media pared | Media denoise | Seg/paso | Pico MLX | Delta swap max | Clips silenciosos |
|---|---:|---:|---:|---:|---:|---:|
| Mixed Calibrated | 70,28 s | 57,38 s | 5,216 s | 29,45 GB | 0,0 MB | 0 |
| Q8 | 74,19 s | 60,88 s | 5,535 s | 29,45 GB | 0,0 MB | 0 |
| Q6 (este repo) | 74,69 s | 61,12 s | 5,557 s | 29,45 GB | 0,0 MB | 0 |
| Q4 | 75,17 s | 61,32 s | 5,575 s | 29,45 GB | 0,0 MB | 0 |

Tiempos de decodificación con `--video-decoder diffusion`: 162,5 s sin tiles a 768x512x97; 416,1 s con 2 tiles a 1280x704x97; 551,6 s con 3 tiles a 1152x768x121.

## Requisitos de hardware

- VRAM/memoria unificada: pico medido de 29,45 GB de MLX en el benchmark end-to-end; el fichero DiT ocupa 15,96 GB y el repo completo 16,0 GB.
- GPU recomendadas: Apple Silicon con memoria unificada amplia; el autor valida en Apple M5 Pro de 64 GiB. No se han publicado pruebas en A100, H100 ni RTX 4090 en la información disponible.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos 32-64 GiB de memoria unificada según resolución y frames; no hay datos para GPUs NVIDIA de consumo.
- Opciones de despliegue: `ltx-2-mlx` (requiere soporte nativo de cuantización de 6 bits y por capa); el modelo es un fichero DiT drop-in que debe colocarse junto a VAE, vocoder, upscalers, connector y el codificador Gemma de un pack LTX-2.5 MLX, por ejemplo `dgrauet/ltx-2.5-mlx-q8`.
- Latencia y throughput: media de 74,69 s por clip en el benchmark de 48 clips, 5,557 s por paso de denoising, sin swap.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5 22B Distilled DiT Q6 (este repo) | 22B | no disponible (frames configurables) | Video Cos 0,986826; Audio Cos 0,996734; 74,69 s/clip | ltx-2.x-community-license | Hugging Face, MLX |
| LTX-2.5 22B Distilled DiT Q8 | 22B | no disponible | Video Cos 0,999805; Audio Cos 0,999681; 74,19 s/clip | ltx-2.x-community-license | Hugging Face, MLX |
| LTX-2.5 22B Distilled DiT Mixed Calibrated | 22B | no disponible | Video Cos 0,987724; Audio Cos 0,989421; 70,28 s/clip | ltx-2.x-community-license | Hugging Face, MLX |
| LTX-2.5 22B Distilled DiT MXFP4 | 22B | no disponible | Video Cos 0,984554; Audio Cos 0,970633 | ltx-2.x-community-license | Hugging Face, MLX |

No se dispone de comparación con modelos de vídeo de otros fabricantes (por ejemplo, de la familia Wan, HunyuanVideo o Sora) en la información proporcionada.

## Limitaciones y advertencias

- Es un componente DiT, no un pipeline completo: requiere VAE, vocoder, upscalers, connector y codificador Gemma de un pack LTX-2.5 MLX; sin ellos no genera vídeo.
- Requiere `ltx-2-mlx` con soporte nativo de cuantización de 6 bits y por capa; versiones anteriores pueden no cargar el checkpoint.
- La cuantización Q4 afín uniforme muestra deriva visible en las mismas seeds (Video Cos 0,816431), por lo que no se recomienda bajar de Q6 si se busca paridad con Q8.
- El uso con el codificador Gemma añade los Términos de Uso y la Política de Uso Prohibido de Gemma, además de la licencia LTX-2.x Community License.
- La licencia es "other" (ltx-2.x-community-license); deben revisarse las restricciones de uso comercial en el fichero LICENSE antes de producción.
- No se han publicado datos sobre sesgos, tasas de alucinación visual ni limitaciones idiomáticas específicas más allá de los idiomas listados.
- El benchmark se limita a Apple M5 Pro de 64 GiB; el rendimiento en otros equipos Apple Silicon o GPUs NVIDIA no está documentado.
- El modelo es destilado, lo que reduce pasos de difusión pero puede limitar el control fino sobre la generación en comparación con la variante no destilada.

## Enlaces

- Hugging Face: https://huggingface.co/yuri-rod/LTX-2.5-22B-Distilled-DiT-6bit
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Variante Mixed Calibrated: https://huggingface.co/yuribarreira/LTX-2.5-22B-Distilled-DiT-MXFP4-6bit-8bit-Calibrated
- Pack MLX de referencia para componentes no DiT: https://huggingface.co/dgrauet/ltx-2.5-mlx-q8
- Paper referenciado en tags: arxiv:2601.03233 (no se dispone de URL directa en la información proporcionada)
