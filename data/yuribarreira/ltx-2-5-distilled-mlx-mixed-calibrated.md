# yuribarreira/LTX-2.5-Distilled-MLX-Mixed-Calibrated

## Resumen

LTX-2.5-Distilled-MLX-Mixed-Calibrated es una cuantización mixta del DiT destilado de 22B parámetros de Lightricks/LTX-2.5, empaquetada en un único fichero safetensors de 13,20 GB para su uso con el runtime `ltx-2-mlx` sobre Apple Silicon. El modelo base es un transformer de difusión (DiT) para generación conjunta de vídeo y audio a partir de texto; esta versión reduce el peso del DiT desde los 42 GB en BF16 hasta 13,20 GB combinando capas en MXFP4, Q6 y Q8 dentro del mismo checkpoint.

La relevancia de esta ficha es práctica: demuestra que es posible ejecutar un generador de vídeo-audio de 22B en un equipo de sobremesa con memoria unificada (probado en un Apple M5 Pro con 64 GiB), manteniendo una paridad numérica razonable frente a BF16 (coseno de 0,9877 en vídeo y 0,9894 en audio en un pase único del DiT). El autor publica además una variante uniforme Q6 de 15,96 GB para quien priorice paridad exacta de layout frame a frame.

No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de compresión calibrada: no aporta capacidades adicionales sobre LTX-2.5, pero sí cambia de forma sustancial los requisitos de hardware y la velocidad de inferencia (70,28 s de media por clip de 12 clips frente a 74,19 s en Q8).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) destilado, con decodificador de vídeo y audio; cuantización mixta MLX |
| Parámetros totales | 22B (DiT del modelo base LTX-2.5) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión; el condicionamiento es por prompt, no por ventana de tokens) |
| Tipos de cuantización | Mixta: 584 capas MXFP4 (bits=4, group_size=32), 807 capas Q6 (bits=6, group_size=64, affine), 241 capas Q8 (bits=8, group_size=64, affine); embeddings, norms, AdaLN y proyecciones de salida en BF16 |
| Idiomas soportados | no disponible |
| Licencia | ltx-2.x-community-license (LTX-2.x Community License) |
| Formato de pesos | safetensors (MLX), 13,20 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusión destilado de 22B parámetros que genera vídeo y audio de forma conjunta. Esta release no reentrena el modelo: parte del checkpoint `Lightricks/LTX-2.5` (commit `49b093a39c19`) y aplica una política de cuantización calibrada por capas sobre las 1.632 lineales de `transformer_blocks`. La calibración se hizo con 24 forwards en BF16 sobre 8 prompts audiovisuales fuera de muestra, en timesteps temprano (sigma=0,90), medio (0,50) y tardío (0,15), acumulando segundos momentos diagonales `H_diag = E[x^2]`.

La asignación de precisión es greedy: se parte de MXFP4 uniforme y se promocionan capas (`mxfp4 -> q6 -> q8`) según la mayor reducción de error ponderado por byte, hasta un presupuesto objetivo de 13,20 GB. Además, se aplicó un refinamiento de clipping afín con búsqueda en rejilla de `alpha in {1.0, 0.98, 0.95, 0.92}` sobre 19 capas afines. El error de cuantización ponderado por `H_diag` baja de 6,400e5 (MXFP4 uniforme) y 2,421e4 (Q6 uniforme) a 1,664e4, un 31% menos que Q6 con 2,76 GB menos de peso. El mapa completo de capas está en `quantization_policy.json`.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución configurable (probado a 768x512, 1280x704 y 1152x768) y número de frames variable (97 y 121 en las pruebas).
- Generación de audio conjunta con el vídeo: el benchmark mide paridad tanto en vídeo como en audio (coseno 0,9894 en audio).
- Control de prompt negativo y de guiado negativo (`--nag --negative-prompt`) para suprimir elementos no deseados como música de fondo o texturas plásticas.
- Decodificación de vídeo con modo difusión y procesado por mosaicos (`--video-decoder diffusion`, 1 a 3 tiles según resolución).
- Modo de bajo consumo de memoria (`--low-ram`) con streaming por bloques (`BlockStreamer`).
- Control de semilla para reproducibilidad parcial del layout de escena.
- No soporta tool calling, function calling ni razonamiento multi-step: es un modelo generativo de difusión, no un LLM de instrucciones.

## Casos de uso

- Generación de clips publicitarios cortos: con 97 frames a 24 fps se obtienen unos 4 segundos de vídeo con audio sincronizado, suficiente para teasers y banners animados en un flujo local sin GPU dedicada.
- Prototipado rápido de storyboards: el modo `--low-ram` y el streaming por bloques permiten iterar prompts y semillas en un portátil Apple Silicon sin agotar la memoria unificada.
- Previsualización de escenas con diálogo: el modelo mantiene estructura de manos y layout de escena en planos de conversación (según las notas visuales del autor), útil para validar encuadres antes de un render final.
- Generación de audio ambiente y room tone: el prompt de ejemplo produce audio de habitación natural, aprovechable para doblaje o ambientes en postproducción ligera.
- Investigación en cuantización de modelos de difusión: el repo publica la política de capas y las métricas de error, lo que sirve como caso de estudio reproducible de cuantización mixta calibrada.
- Despliegue en estaciones de trabajo Mac para demos en vivo: 70,28 s de media por clip a 768x512x97 con 29,45 GB de pico de memoria MLX y cero swap, viable en un equipo de 64 GiB.
- Evaluación comparativa de precisión: la tabla de paridad frente a BF16 permite medir el impacto de MXFP4, Q6 y Q8 en un pipeline de vídeo-audio real.

## Benchmarks y rendimiento

Paridad de un solo pase del DiT frente a BF16 (Apple M5 Pro, 64 GiB, macOS 27.2.1, mlx 0.32.2):

| Variante | Tamano DiT | Video Cos | Video RMSE | Audio Cos | Audio RMSE |
|---|---:|---:|---:|---:|---:|
| Q8 (affine g64) | 20,59 GB | 0,999805 | 0,02390 | 0,999681 | 0,01574 |
| MXFP8 (g32) | 20,02 GB | 0,992870 | 0,14793 | 0,994663 | 0,06530 |
| Mixed Calibrated (este repo) | 13,20 GB | 0,987724 | 0,21676 | 0,989421 | 0,09092 |
| Q6 (affine g64) | 15,96 GB | 0,986826 | 0,20015 | 0,996734 | 0,05065 |
| MXFP4 (g32) | 10,74 GB | 0,984554 | 0,21650 | 0,970633 | 0,15176 |
| Q4 (affine g64) | 11,32 GB | 0,816431 | 0,71769 | 0,968157 | 0,15504 |

Benchmark end-to-end de 48 clips (6 escenarios x 2 semillas, 12 clips por variante):

| Variante | Tiempo medio | Denoise medio | Seg/step | Pico MLX | Delta swap máx. | Clips silenciosos |
|---|---:|---:|---:|---:|---:|---:|
| Mixed Calibrated (este repo) | 70,28 s | 57,38 s | 5,216 s | 29,45 GB | 0,0 MB | 0 |
| Q8 | 74,19 s | 60,88 s | 5,535 s | 29,45 GB | 0,0 MB | 0 |
| Q6 | 74,69 s | 61,12 s | 5,557 s | 29,45 GB | 0,0 MB | 0 |
| Q4 | 75,17 s | 61,32 s | 5,575 s | 29,45 GB | 0,0 MB | 0 |

Tiempos de decodificación de vídeo con modo difusión y 0,0 MB de swap: 768x512x97 en 162,5 s (sin tiles), 1280x704x97 en 416,1 s (2 tiles) y 1152x768x121 en 551,6 s (3 tiles).

## Requisitos de hardware

- Memoria: pico de 29,45 GB de MLX en las pruebas con 64 GiB de memoria unificada; el DiT ocupa 13,20 GB en disco.
- Equipo de referencia: Apple M5 Pro con 64 GiB de RAM unificada; no se han publicado pruebas en otras configuraciones.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable directamente, el formato MLX está orientado a Apple Silicon; no hay datos de despliegue en CUDA.
- Consumer GPU: no disponible para el ecosistema MLX; en Apple Silicon se requiere un equipo con memoria unificada suficiente (los 64 GiB del equipo de prueba).
- Despliegue: runtime `ltx-2-mlx` con soporte de precisión mixta por capa, cargador MXFP4 y `BlockStreamer`; se integra en un pack LTX-2.5 MLX existente (por ejemplo `dgrauet/ltx-2.5-mlx-q8`) sustituyendo `transformer-distilled.safetensors`.
- Latencia: 5,216 s/step de media y 70,28 s por clip en el benchmark de 12 clips; la decodificación de vídeo añade entre 162,5 s y 551,6 s según resolución y número de tiles.
- Throughput: no disponible más allá de los tiempos por clip publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paridad vídeo (cos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5-Distilled-MLX-Mixed-Calibrated (este repo) | 22B (DiT) | no disponible | 0,987724 | ltx-2.x-community-license | Hugging Face, 13,20 GB |
| LTX-2.5-Distilled-MLX-Q6 | 22B (DiT) | no disponible | 0,986826 | ltx-2.x-community-license | Hugging Face, 15,96 GB |
| LTX-2.5 (BF16, base) | 22B (DiT) | no disponible | referencia | ltx-2.x-community-license | Hugging Face, 42 GB |
| MXFP4 uniforme | 22B (DiT) | no disponible | 0,984554 | ltx-2.x-community-license | Variante de referencia en la model card, 10,74 GB |

No se han publicado comparaciones con generadores de vídeo de otros fabricantes en la información disponible.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos en la model card; al ser un modelo texto-a-vídeo, hereda los sesgos del dataset de entrenamiento de LTX-2.5, no detallado aquí.
- Alucinación visual: en algunas semillas puede desplazar el encuadre u orientación del sujeto respecto a Q8; el autor recomienda Q6 si se necesita paridad exacta de semilla.
- Calidad inferior a Q8 en detalles finos: RMSE de vídeo de 0,21676 frente a 0,02390 en Q8; en superficies mojadas, piel y ojos es más nítido que Q4 pero no alcanza Q8.
- Dependencia de tooling específico: requiere `ltx-2-mlx` con soporte de precisión mixta por capa, cargador MXFP4 y `BlockStreamer`; no funciona con runtimes MLX estándar sin esas extensiones.
- Ecosistema limitado: formato MLX orientado a Apple Silicon; no hay pesos GGUF ni soporte CUDA publicado.
- Licencia: LTX-2.x Community License, con condiciones de uso comercial que deben revisarse en el fichero `LICENSE`; si se combina con el codificador de texto Gemma de un pack LTX-2.5, aplican también los Términos de Uso y la Política de Uso Prohibido de Gemma.
- Idiomas: no disponible; no se especifica qué lenguas acepta el condicionamiento textual.
- Reproducibilidad: el repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de los resultados publicados por el autor.
- Memoria: el pico de 29,45 GB exige equipos con memoria unificada amplia; no se han publicado pruebas en configuraciones de 32 GiB o inferiores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuribarreira/LTX-2.5-Distilled-MLX-Mixed-Calibrated
- Variante Q6 del mismo autor: https://huggingface.co/yuribarreira/LTX-2.5-Distilled-MLX-Q6
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Pack MLX Q8 de referencia para componentes no DiT: https://huggingface.co/dgrauet/ltx-2.5-mlx-q8
- Fichero de política de cuantización: `quantization_policy.json` (incluido en el repositorio del modelo)
- Licencia: `LICENSE` (incluido en el repositorio del modelo)
