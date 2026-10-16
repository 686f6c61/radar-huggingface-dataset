# UraionLabs/Nemotron-3.5-Bolt-74B-A9B-24GB-Metal-GGUF

## Resumen

Nemotron 3.5 Bolt 74B-A9B 24GB · Metal GGUF es un reempaquetado del modelo NVIDIA Nemotron 3.5 Bolt 74B-A9B en formato GGUF, publicado por Uraion Labs, cuyo objetivo es que el modelo se ejecute íntegramente en la GPU en equipos Apple Silicon mediante el backend Metal de llama.cpp. El modelo original es un transformer híbrido de 74.042.720.848 parámetros totales con aproximadamente 9B parámetros activos (designación A9B), que combina capas Mamba con capas de mezcla de expertos (MoE), incluyendo proyecciones del tipo latent-MoE, y soporta una ventana de contexto de 262.144 tokens con capacidades multimodales de imagen a texto.

El problema concreto que resuelve esta build es un cuello de botella de ejecución: el GGUF upstream almacena las proyecciones de entrada y salida de las 40 capas Mamba (`ssm_in`, `ssm_out`, 80 tensores, 2,5 GB) en NVFP4, formato para el que el backend Metal de llama.cpp no tiene kernel de multiplicación de matrices. Esos tensores quedaban silenciosamente en la CPU, provocando unos 80 viajes de ida y vuelta CPU-GPU por token y dejando el servidor al ~557% de CPU mientras la GPU esperaba. Esta build convierte únicamente esos 80 tensores de NVFP4 a Q8_0, formato que Metal ejecuta de forma nativa, y copia byte a byte el resto (expertos IQ2_XXS, proyecciones de atención y latent-MoE en Q8_0, embeddings y cabeza de salida).

La relevancia es práctica: en una Apple M5 Pro (GPU de 20 núcleos, 64 GB de memoria unificada), el prefill pasa de 112 a 506 tok/s con 512 tokens y hasta 674-676 tok/s con 8K, mientras que el decode pasa de 12,8 a 24,6 tok/s, manteniendo la ventana completa de 262K. El incremento de tamaño en disco es de 2,2 GB (de 22,0 a 24,2 GB) porque Q8_0 tiene más resolución que la fuente de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba + MoE (Nemotron-H) con latent-MoE; 88 capas, de las cuales 8 son capas de atención con 2 cabezas KV |
| Parametros totales | 74.042.720.848 (~74B) |
| Parametros activos | ~9B (designación A9B); el GGUF upstream declara 496 expertos, aunque algunas capas tienen 240 |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | IQ2_XXS (expertos); Q8_0 (atención y proyecciones latent-MoE); NVFP4 convertido a Q8_0 en los 80 tensores `ssm_in`/`ssm_out`; `mmproj` en BF16 |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 (nombre de licencia "other"); enlace: https://openmdw.ai/license/1-1/ |
| Formato de pesos | GGUF (llama.cpp; build principal IQ2_XXS + `mmproj` BF16) |

## Arquitectura y entrenamiento

La arquitectura es un modelo híbrido Nemotron-H que integra capas Mamba (modelo de espacio de estados, SSM) con capas de mezcla de expertos y proyecciones latent-MoE. Del total de 88 capas, solo 8 son capas de atención, cada una con 2 cabezas KV, lo que reduce drásticamente el coste de caché KV: una caché completa de 262K en f16 ocupa aproximadamente 2 GB. Con 74,04B parámetros totales y ~9B activos por paso, el modelo opera como un MoE de gran capacidad pero coste de cómputo contenido.

El modelo base es la versión cuantizada de NVIDIA (`nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF`), y la contribución de Uraion Labs es exclusivamente de formato de almacenamiento, no de pesos ni de comportamiento: la plantilla de chat y el comportamiento declarado son los mismos que los del upstream. La única modificación es la conversión de los 80 tensores de entrada y salida de las capas Mamba de NVFP4 a Q8_0. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO para el modelo original. El modelo admite decodificación especulativa mediante un drafter DFlash de tipo LiLiCorr de 1,1B parámetros de NVIDIA, aunque el autor recomienda dejarlo desactivado salvo en escenarios de decodificación voraz.

## Capacidades

- Generación de texto conversacional (pipeline declarado: image-text-to-text, con etiqueta "conversational").
- Procesamiento de imágenes: multimodal imagen-texto; el autor verificó que el modelo lee correctamente texto de una imagen usando el `mmproj` incluido.
- Contexto largo: ventana de 262.144 tokens, con rendimiento sostenido medido hasta llenado completo a 260.000 tokens.
- Multilingüe: inglés, español, francés, alemán, italiano y japonés.
- Razonamiento híbrido Mamba + MoE orientado a eficiencia en generación larga.
- Decodificación especulativa opcional mediante drafter DFlash + LiLiCorr de 1,1B.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Soporte de audio: no disponible.

## Casos de uso

- Asistentes conversacionales locales en Mac: con 262K de contexto y decode de 24,6 tok/s en M5 Pro, el modelo permite mantener conversaciones multi-turno muy largas sin salir del equipo, útil para entornos con requisitos de privacidad.
- Análisis de documentos extensos: la ventana completa de 262.144 tokens permite introducir informes, contratos o bases de código completas y hacer preguntas sobre ellos en una sola pasada, sin fragmentación.
- Procesamiento de imágenes con texto incrustado: gracias al pipeline image-text-to-text y al `mmproj` BF16, se puede extraer texto de capturas, diagramas o documentos escaneados y continuar el razonamiento sobre ese contenido.
- Despliegue de API compatible con OpenAI en local: el comando `llama-server` expone un endpoint OpenAI-compatible en `http://127.0.0.1:8080/v1`, lo que permite integrarlo como backend en herramientas y frameworks existentes sin cambios de cliente.
- Investigación en arquitecturas híbridas SSM-MoE: al ser una build fiel al upstream (divergencia media de 0,3% en top-1), sirve como banco de pruebas reproducible de Nemotron-H en hardware Apple.
- Pipelines de generación asistida por contexto largo con decodificación voraz: en escenarios donde solo se usa greedy, el drafter LiLiCorr puede elevar el decode hasta 27,5 tok/s, útil para tareas de extracción o clasificación por lotes.

## Benchmarks y rendimiento

El autor no ha publicado suites de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta build. Los datos disponibles son de rendimiento de inferencia en Apple M5 Pro (GPU de 20 núcleos, 64 GB de memoria unificada), con `llama-server`, `-fa on -ngl 99 -c 262144 -b 2048 -ub 2048`, un solo slot y prompts aleatorios (sin caché).

| Metrica | Upstream GGUF | Esta build | Mejora |
|---|---:|---:|---:|
| Prefill, 512 tokens | 112 tok/s | 506 tok/s | 4,5x |
| Prefill, 2K | 181 tok/s | 676 tok/s | 3,7x |
| Prefill, 8K | 178 tok/s | 674 tok/s | 3,8x |
| Prefill, 32K | 175 tok/s | 592 tok/s | 3,4x |
| Decode, greedy | 12,8 tok/s | 24,6 tok/s | 1,9x |
| Decode, temperatura 1.0 | 13,7 tok/s | 24,8 tok/s | 1,8x |
| Prefill medio a 260.000 tokens | no disponible | 312 tok/s (14 min de llenado) | no disponible |
| Decode a 260.000 tokens | no disponible | 14,8 tok/s | no disponible |

Decodificación especulativa (DFlash + LiLiCorr, 1,1B):

| Tokens de draft | Greedy (tok/s) | Aceptación | Temp. 1.0 (tok/s) | Aceptación |
|---:|---:|---:|---:|---:|
| Ninguno | 24,6 | — | 24,8 | — |
| 3 | 25,5 | 75% | 25,1 | 74% |
| 5 | 27,5 | 60% | 23,6 | 50% |
| 7 | 27,3 | 48% | 22,3 | 37% |

Fidelidad respecto al upstream (mismo prompt, greedy, `n_probs=5`): tokens idénticos durante los primeros 28 pasos; primera divergencia en un empate técnico (`" by"` 0,498 vs `" around"` 0,490 en upstream; 0,464 vs 0,524 en esta build); diferencia media en la probabilidad top-1 del 0,3% (máxima del 1,3%). El autor recomienda esperar una calidad equivalente a las cifras publicadas por NVIDIA para el modelo IQ2 de 24 GB.

## Requisitos de hardware

- Memoria estimada: los pesos ocupan 24,2 GB en disco (frente a 22,0 GB del upstream). La caché KV completa en f16 para 262K es de aproximadamente 2 GB, por lo que se recomienda un equipo con al menos 26-27 GB de memoria unificada disponible.
- Hardware probado: Apple M5 Pro con GPU de 20 núcleos y 64 GB de memoria unificada, ejecutando las 88 capas en GPU.
- Consumer GPU: la build está optimizada específicamente para Apple Silicon y Metal. No se proporcionan datos de ejecución en GPU NVIDIA o AMD para esta build concreta.
- Sistema de ejecución: llama.cpp con `llama-server`; también se puede cargar desde LM Studio (que usa su llama.cpp incluido).
- Versión de llama.cpp requerida: es necesario un build que soporte los expertos podados por capa de este modelo. Probado como funcional: llama.cpp `0.7.0-dev` (commit `620d222`), tal como se distribuye en el backend `llama.cpp-mac-arm64-apple-metal-advsimd` 2.59.0 de LM Studio. Falla: Homebrew `llama.cpp` 0.6.0 (build 11429), con error `tensor 'blk.1.ffn_gate_inp.weight' has wrong shape`.
- Latencia y throughput: ver la tabla de benchmarks. Con `-ub 4096` no se obtuvo más velocidad que con 2048. Se recomienda `-np 1` porque varios slots reparten la ventana de 262K entre ellos.
- El drafter DFlash reduce el prefill en aproximadamente un 20% y aporta una ganancia pequeña en decode (verificación de más expertos distintos por paso en un MoE).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| UraionLabs Nemotron-3.5-Bolt-74B-A9B-24GB-Metal-GGUF (esta build) | 74B totales, ~9B activos | 262.144 | GGUF, IQ2_XXS + Q8_0, `mmproj` BF16 | OpenMDW-1.1 | Optimizado para Metal/Apple Silicon; todos los tensores en GPU |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF (upstream) | 74B totales, ~9B activos | 262.144 | GGUF, NVFP4 en tensores Mamba | OpenMDW-1.1 | 80 tensores `ssm_in`/`ssm_out` en CPU bajo Metal; mismo comportamiento |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF (drafter) | 1,1B | no disponible | GGUF, DFlash | no disponible | Drafter de decodificación especulativa, no un modelo alternativo |

No se dispone en la información proporcionada de otros modelos comparables de la misma categoría (híbrido SSM-MoE de ~74B con contexto de 262K) con datos verificables.

## Limitaciones y advertencias

- La build no ha sido evaluada con suites de benchmarks completas; el autor espera calidad equivalente a las cifras publicadas por NVIDIA para el modelo IQ2 de 24 GB.
- Existe una divergencia de fidelidad mínima respecto al upstream: tokens idénticos en los primeros 28 pasos, con una primera divergencia en un empate técnico y una diferencia media del 0,3% en la probabilidad top-1 (máxima del 1,3%).
- Requiere un build específico de llama.cpp con soporte de expertos podados por capa; versiones antiguas fallan al cargar el modelo.
- La conversión de NVFP4 a Q8_0 afecta únicamente a 80 tensores, pero introduce un pequeño error adicional por el cambio de formato.
- El drafter LiLiCorr aporta una ganancia pequeña en decode y reduce el prefill alrededor de un 20%; el autor recomienda dejarlo desactivado salvo en decodificación voraz.
- Riesgo de alucinación, sesgos y limitaciones idiomáticas específicas del modelo original: no disponibles en la información proporcionada.
- Licencia OpenMDW-1.1: conviene revisar las condiciones completas en el enlace oficial antes de uso comercial, ya que la model card la declara como "other" con nombre openmdw-1.1.
- El tamaño del repo (25,9 GB) y la memoria unificada necesaria (~26-27 GB) limitan el despliegue a equipos con suficiente RAM/VRAM.
- Uso de múltiples slots (`-np`) reparte la ventana de 262K y reduce el contexto efectivo por sesión.

## Enlaces

- Repositorio HuggingFace de esta build: https://huggingface.co/UraionLabs/Nemotron-3.5-Bolt-74B-A9B-24GB-Metal-GGUF
- Modelo base (NVIDIA Nemotron 3.5 Bolt 74B-A9B 24GB GGUF): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
- Drafter LiLiCorr (NVIDIA): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Uraion Labs: https://uraionlabs.com
- Listado de modelos cuantizados del base: https://huggingface.co/models?other=base_model:quantized:nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
