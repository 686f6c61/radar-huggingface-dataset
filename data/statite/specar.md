# Statite/SpecAR

## Resumen

SpecAR es un método de inferencia sin entrenamiento (training-free) para acelerar la generación de vídeo autorregresiva, desarrollado por Statite. No se trata de un modelo con pesos propios, sino de un sistema de decodificación especulativa distribuida que se aplica sobre modelos existentes: en lugar de invocar el modelo objetivo grande para cada bloque de vídeo, asigna la mayoría de bloques a un modelo borrador (drafter) más pequeño y distribuye de forma uniforme un número limitado de bloques generados por el objetivo a lo largo del vídeo. Esto elimina el enrutamiento perceptual en línea y su coste de puntuación asociado.

El sistema se publica como un repositorio de inferencia que reutiliza pesos públicos ya existentes, sin necesidad de reentrenar ni de nuevos checkpoints. Soporta text-to-video, image-to-video y video-to-video sobre Krea Realtime 14B (objetivo de 14B con Self-Forcing 1.3B DMD como borrador) y sobre Helios-Base 14B (con Helios-Distilled 14B como borrador). Una única implementación funciona en GPUs NVIDIA Hopper (H100, H200) y Blackwell (B200), seleccionando automáticamente FlashAttention-3 o FlashAttention-4.

Su relevancia actual radica en que la generación de vídeo autorregresiva con modelos de 14B es costosa en latencia: SpecAR reporta aceleraciones de hasta 2,67× sobre Krea Realtime 14B y de hasta 10,54× sobre Helios-Base 14B en una H100, manteniendo el 99,7% de la calidad Restricted VBench Quality-6 del objetivo en el punto de operación k=7.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Método de decodificación especulativa sobre modelos de vídeo autorregresivos (target + drafter); no es un modelo único |
| Parámetros totales | Target: 14B (Krea Realtime 14B o Helios-Base 14B); drafter Krea: 1,3B (Self-Forcing DMD); drafter Helios: 14B (Helios-Distilled) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (rollout por defecto de 36 bloques, ~26,6 s a 16 FPS) |
| Tipos de cuantización | No disponible (la evaluación publicada usa BF16) |
| Idiomas soportados | No disponible |
| Licencia | Otra: apache-2.0-and-cc-by-nc-sa-4.0 (ver enlace de licencia en GitHub) |
| Formato de pesos | Pesos reutilizados de los modelos públicos (Krea Realtime, Self-Forcing, Helios-Base, Helios-Distilled); no se distribuye checkpoint propio |

## Arquitectura y entrenamiento

SpecAR no entrena ningún modelo: es un algoritmo de inferencia aplicado sobre backbones autorregresivos de vídeo ya publicados. La idea central es la decodificación especulativa adaptada al eje temporal del vídeo: la mayoría de bloques de vídeo se generan con un drafter barato y solo un número limitado de bloques se generan con el modelo objetivo, distribuidos de manera uniforme a lo largo del vídeo para controlar la longitud de la secuencia más larga de bloques "drafteados" sin verificar por el objetivo. El parámetro k controla ese punto de operación (k=2, k=5, k=7 en la evaluación publicada).

Al eliminar el enrutamiento perceptual en línea y las puntuaciones asociadas, el método evita el coste adicional de los esquemas previos (SDVG) y no requiere modelos de recompensa auxiliares ni reentrenamiento. La implementación selecciona automáticamente FlashAttention-3 en Hopper y FlashAttention-4 en Blackwell, con el mismo algoritmo, procedimiento de instalación y CLI en ambas plataformas. La evaluación publicada usa rollouts de 36 bloques a resolución 832×480, precisión BF16, cinco pasos de denoising y FlashAttention-3.

## Capacidades

- Aceleración de inferencia training-free para generación de vídeo autorregresiva, sin nuevos checkpoints.
- Text-to-video: generación directa desde prompt (por defecto 36 bloques, ~26,6 s a 16 FPS).
- Image-to-video: condicionamiento sobre una imagen de entrada reescalada a 832×480 como contexto visual inicial.
- Video-to-video: condicionamiento sobre un clip existente.
- Soporte de dos backbones: Krea Realtime 14B (con Self-Forcing 1.3B DMD como drafter) y Helios-Base 14B (con Helios-Distilled 14B como drafter).
- Selección automática de backend de atención según hardware: FA3 en H100/H200, FA4 en B200 (solo Krea en Blackwell; Helios aún no soportado en B200).
- Punto de operación ajustable mediante k, que permite intercambiar latencia por fidelidad al objetivo.
- Integración con ComfyUI mediante nodo propio.
- Tool calling, function calling, agentes, razonamiento textual, matemáticas, visión general, audio y capacidades multilingües: no disponibles (el sistema es específico de generación de vídeo).

## Casos de uso

- Generación de vídeo en producción con latencia reducida: usando `specar generate --backbone krea --k 2`, un vídeo de 26,6 s pasa de 87,6 s a 32,8 s de latencia media en una H100, lo que hace viable la generación interactiva con un modelo de 14B.
- Previsualización rápida en pipelines creativos: con k=7 sobre Krea se mantiene el 99,7% de la calidad Restricted VBench Quality-6 del objetivo generando 2,04× más rápido, adecuado para iterar sobre prompts antes de un render final.
- Image-to-video para animación de fotografía fija: el modo `--image` reescala la imagen a 832×480 y la usa como contexto visual inicial, útil para convertir stills de producto o paisaje en clips cortos.
- Video-to-video para estilización o transformación de clips existentes: el modo `--video` permite condicionar la generación sobre un metraje previo, aplicable a postproducción y remasterización de material.
- Aceleración de servidores de generación de vídeo: al ser training-free y reutilizar pesos públicos, se puede desplegar sobre infraestructura H100/H200/B200 existente sin reentrenar ni convertir checkpoints, reduciendo el coste por vídeo en flotas de inferencia.
- Flujos de trabajo en ComfyUI: el nodo ComfyUI-SpecAR permite incorporar la aceleración a grafos de generación de vídeo ya existentes sin cambiar de herramienta.
- Evaluación comparativa de métodos de aceleración: al soportar dos backbones y un parámetro k ajustable, sirve para medir el compromiso latencia-calidad en distintos puntos de operación con hardware Hopper y Blackwell.

## Benchmarks y rendimiento

Evaluación publicada sobre una única NVIDIA H100 80GB por par de modelos:

| Modelo | Aceleración sobre target-only | GPU |
|---|---:|---|
| Krea Realtime 14B | Hasta 2,67× | 1× H100 |
| Helios-Base 14B | Hasta 10,54× | 1× H100 |

Krea Realtime 14B, vídeo de 26,6 s (36 bloques, 832×480, BF16, 5 pasos de denoising, FA3):

| Método | Latencia media | Aceleración |
|---|---:|---:|
| Target-only | 87,6 s | 1,00× |
| SDVG, punto de operación k=2 | 56,8 s | 1,54× |
| SpecAR, k=2 | 32,8 s | 2,67× |
| SpecAR, k=5 | 39,0 s | 2,25× |
| SpecAR, k=7 | 42,9 s | 2,04× |

En k=7, SpecAR retiene el 99,7% del Restricted VBench Quality-6 del target-only generando 2,04× más rápido. En los puntos evaluados sobre Krea Realtime y Helios, SpecAR logra menor latencia y VisionReward y Restricted VBench Quality-6 iguales o superiores a SDVG.

Validación de ingeniería en B200 (un solo vídeo, no media end-to-end), generación de arrecife de coral de 26,6 s con k=7:

| GPU | Backend de atención | Tiempo de generación reportado |
|---|---|---:|
| NVIDIA H100 | FlashAttention-3 | 37,9 s |
| NVIDIA B200 | FlashAttention-4 | 25,8 s |

El autor advierte que estas cifras de B200 son mediciones puntuales de ingeniería y no establecen una aceleración de B200 frente a la implementación target-only optimizada de Krea en B200.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; la descarga del setup de Krea ocupa aproximadamente 50 GB de archivos de modelo (target Krea Realtime 14B, drafter Self-Forcing 1.3B, text encoder y VAE), lo que da una idea del orden de magnitud de memoria necesaria.
- GPUs soportadas: NVIDIA H100 y H200 (Krea y Helios, con FA3); NVIDIA B200 (Krea con FA4; Helios aún no soportado en Blackwell).
- GPUs consumer: no se indica soporte para RTX 4090 u otras GPUs consumer; los requisitos publicados son Linux, Python 3.11, GPU NVIDIA compatible y driver compatible con CUDA 12.8.
- Despliegue: CLI propio `specar` (instalación vía `pip install ".[krea]"`), nodo ComfyUI (ComfyUI-SpecAR); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 32,8 s (k=2), 39,0 s (k=5) y 42,9 s (k=7) para 26,6 s de vídeo en H100 con Krea; 25,8 s en B200 con k=7 en la validación de ingeniería.
- Throughput: no disponible.

## Comparativa con modelos similares

| Sistema | Tipo | Modelo objetivo | Aceleración reportada | Calidad | Licencia |
|---|---|---|---:|---|---|
| SpecAR | Decodificación especulativa training-free | Krea Realtime 14B / Helios-Base 14B | Hasta 2,67× (Krea) y 10,54× (Helios) en H100 | 99,7% de VBench Quality-6 a k=7 (Krea) | apache-2.0-and-cc-by-nc-sa-4.0 |
| SDVG | Esquema previo de aceleración con enrutamiento perceptual | Krea Realtime 14B | 1,54× (k=2) | Inferior o igual a SpecAR en VisionReward y VBench Quality-6 según el autor | No disponible |
| Target-only (Krea Realtime 14B) | Inferencia sin aceleración | Krea Realtime 14B | 1,00× (87,6 s) | Referencia de calidad | Según el modelo base |

## Limitaciones y advertencias

- No es un modelo generativo autónomo: requiere descargar y ejecutar los pesos de los backbones (Krea Realtime 14B o Helios-Base 14B) y sus drafters; no se distribuye checkpoint propio.
- Licencia mixta apache-2.0-and-cc-by-nc-sa-4.0: la componente CC BY-NC-SA 4.0 restringe el uso comercial; es imprescindible revisar el enlace de licencia del repositorio antes de un despliegue en producción.
- Soporte de hardware limitado a NVIDIA Hopper y Blackwell; no se documenta funcionamiento en GPUs consumer ni en AMD.
- Helios no está soportado en B200; en Blackwell solo funciona el backbone Krea.
- Requiere Linux, Python 3.11 y driver compatible con CUDA 12.8.
- Las mediciones en B200 son validaciones puntuales de ingeniería y no medias end-to-end; el autor no establece una aceleración de B200 frente a la implementación target-only optimizada de Krea.
- El punto de operación k implica un compromiso latencia-calidad: a mayor k, mayor aceleración pero menor fidelidad al objetivo (2,67× a k=2 frente a 2,04× a k=7 en Krea).
- Idiomas soportados no disponibles; la generación se controla mediante prompts de texto cuyo comportamiento multilingüe no está documentado.
- Sesgos y riesgo de alucinación: no documentados en la información disponible; al heredar los pesos de los backbones, los sesgos de estos se trasladan al resultado.
- El repositorio registra 0 descargas y 0 likes en Hugging Face en la fecha de creación, lo que indica una disponibilidad muy reciente y poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Statite/SpecAR
- Página del proyecto: https://statite.ai/specar
- Paper: https://statite.ai/specar/specar.pdf
- GitHub: https://github.com/statite-ai/SpecAR
- Nodo ComfyUI: https://github.com/statite-ai/ComfyUI-SpecAR
- Licencia: https://github.com/statite-ai/SpecAR#license
- Sitio de Statite: https://statite.ai/
- Modelo base Krea Realtime 14B: https://huggingface.co/krea/krea-realtime-video
- Drafter Self-Forcing 1.3B DMD: https://huggingface.co/gdhe17/Self-Forcing
- Modelo base Helios-Base 14B: https://huggingface.co/BestWishYsh/Helios-Base
- Drafter Helios-Distilled 14B: https://huggingface.co/BestWishYsh/Helios-Distilled
