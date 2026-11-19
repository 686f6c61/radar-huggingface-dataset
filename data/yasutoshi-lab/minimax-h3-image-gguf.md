# yasutoshi-lab/MiniMax-H3-Image-GGUF

## Resumen

MiniMax-H3-Image es un modelo de generación y edición de imágenes de pesos abiertos desarrollado por MiniMax. Este repositorio concreto, `yasutoshi-lab/MiniMax-H3-Image-GGUF`, es una cuantización no oficial en formato GGUF del modelo original `MiniMaxAI/MiniMax-H3-Image` (revision `5f90473`), preparada por el usuario yasutoshi-lab para poder ejecutarlo con `stable-diffusion.cpp` y `llama.cpp` en hardware de consumo. No se trata de una distribución oficial de MiniMax.

El modelo combina un transformer de difusión (DiT) de aproximadamente 6.826 millones de parámetros con un text encoder derivado de Qwen3-VL-32B, recortado a las 50 primeras capas, y un VAE. Soporta tanto text-to-image como edición de imágenes guiada por referencia visual, gracias al componente de visión del text encoder (`mmproj-F16.gguf`). El pipeline declarado es `text-to-image` y la librería asociada es `gguf`.

La relevancia de esta ficha radica en que permite ejecutar un modelo de imagen de gran tamaño en equipos con GPU de consumo mediante cuantizaciones que van desde BF16 (94,54 GB en total) hasta IQ2_XS (16,32 GB en total), a costa de una pérdida de calidad que el autor documenta explícitamente. La licencia comunitaria del modelo original excluye territorios concretos (Unión Europea, Reino Unido, Corea del Sur y Estados Unidos), lo que condiciona su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (transformer de difusión) + text encoder Qwen3-VL-32B recortado a 50 capas + VAE |
| Parametros totales | 6.826.376.704 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_S, IQ3_XXS, IQ2_S, IQ2_XS (DiT y TE por separado) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-image-community-license-agreement (licencia "other") |
| Formato de pesos | GGUF (DiT y TE), safetensors (VAE), mmproj-F16.gguf para visión |

## Arquitectura y entrenamiento

El modelo original es un pipeline de difusión con un transformer (DiT) como generador y un text encoder basado en Qwen3-VL-32B. En esta cuantización, el DiT se empaqueta en un único archivo legible por `stable-diffusion.cpp` y se cuantiza; el text encoder conserva únicamente las 50 primeras capas del Qwen3-VL-32B original (se eliminan las capas 50 a 63) y se cuantiza con `llama.cpp`, usando imatrix para las variantes IQ. El VAE se mantiene sin cambios respecto al original.

La modificación técnica más relevante es la precomputación de AdaLN: en lugar de calcular las modulaciones adaptativas en tiempo de inferencia, se precalculan las salidas para los siete tiempos usados en el muestreo PDD de 6 pasos (seis sigmas más 0,999 para la imagen de referencia) y se almacenan en una tabla (`adaln_t_table`). Esto fija el número de pasos a 6 y hace que otros valores de `--sigmas` no funcionen. También se reordena `attn.qkv_proj.weight` de `[heads, (q,k,v), head_dim]` a `[(q,k,v), heads, head_dim]` y se fusionan las seis cabezas de salida de `pdd_fused_heads.safetensors` en `final_layer.video_out`. No se han modificado los pesos mediante entrenamiento adicional. Las capas 50 a 63 eliminadas del TE se distribuyen aparte en `text_encoder_tail/` para poder reconstruir el TE de 64 capas si se necesita.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) con resolución configurable, por ejemplo 1024x1024.
- Edición de imágenes guiada por instrucciones en lenguaje natural, usando una imagen de referencia (`-r`) y el componente de visión del text encoder.
- Comprensión de referencias visuales estructuradas mediante marcadores como `<Picture 1>` en el prompt de edición.
- Muestreo PDD de 6 pasos fijos con `--sigmas minimax-h3-image`, `--sampling-method euler` y `--cfg-scale 1.0`.
- Soporte de cuantizaciones mixtas: el DiT y el TE pueden combinarse con niveles de cuantización distintos.
- Reconstrucción opcional del text encoder completo de 64 capas añadiendo `text_encoder_tail/` y ajustando `qwen3vl.block_count` a 64.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo de imagen, no un LLM conversacional.

## Casos de uso

- Generación de ilustraciones y material gráfico para prototipos: con la combinación Q4_K_M (30,78 GB totales) se pueden producir imágenes de 1024x1024 en una sola GPU de 48 GB o en configuraciones con offload, adecuado para iterar sobre conceptos visuales.
- Edición de imágenes por instrucción en flujos de retoque: usando `mmproj-F16.gguf` y una imagen de referencia, se puede pedir la sustitución de un objeto manteniendo el resto de la escena, como en el ejemplo del autor (cambiar una manzana roja por una pera verde).
- Despliegue en estaciones de trabajo con GPU de consumo: la combinación IQ2_XS (16,32 GB) o IQ3_XXS (20,46 GB) permite ejecutar el pipeline en GPUs de 24 GB, con la advertencia de que IQ2 degrada la generación desde texto.
- Creación de assets para videojuegos y previsualización: el modelo puede generar variaciones de personajes y escenarios a partir de prompts, y el modo edición permite ajustar detalles sobre una base ya generada.
- Investigación en cuantización de modelos de difusión: el repositorio ofrece diez niveles de cuantización para DiT y TE, lo que permite estudiar el impacto de la precisión en la calidad de imagen y en la fidelidad al prompt.
- Integración en pipelines locales con `stable-diffusion.cpp`: al ser GGUF y funcionar con `sd-cli`, se puede encadenar con scripts de automatización para generar lotes de imágenes sin depender de servicios en la nube.
- Pruebas de concepto de edición multimodal: el uso conjunto de TE, mmproj y VAE permite experimentar con edición guiada por imagen y texto en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta pruebas de funcionamiento (28 combinaciones de DiT y TE sobre 100 posibles) verificadas con una NVIDIA RTX PRO 6000 de 96 GB, `stable-diffusion.cpp` en el commit `32d516c` y `llama.cpp` en `aa75ff323`, confirmando que todas las combinaciones probadas generan imágenes. No se aportan métricas de FID, CLIP score ni comparativas cuantitativas.

## Requisitos de hardware

- VRAM estimada según la tabla de tamaños del autor (DiT + TE + VAE, en GB decimales):
  - BF16: 94,54 GB (95,73 GB con mmproj para edición)
  - Q8_0: 51,44 GB (52,63 GB con mmproj)
  - Q6_K: 40,30 GB (41,50 GB con mmproj)
  - Q5_K_M: 35,81 GB (37,00 GB con mmproj)
  - Q4_K_M: 30,78 GB (31,97 GB con mmproj)
  - IQ4_XS: 27,28 GB (28,48 GB con mmproj)
  - IQ3_S: 22,68 GB (23,88 GB con mmproj)
  - IQ3_XXS: 20,46 GB (21,66 GB con mmproj)
  - IQ2_S: 17,40 GB (18,60 GB con mmproj)
  - IQ2_XS: 16,32 GB (17,52 GB con mmproj)
- El autor advierte que el uso de memoria en ejecución no coincide con el tamaño de los archivos.
- GPU recomendadas: el autor valida con NVIDIA RTX PRO 6000 de 96 GB. Para cuantizaciones bajas (IQ2_XS, IQ2_S, IQ3_XXS) el tamaño total queda por debajo de 24 GB, por lo que en teoría cabría en GPUs de consumo de 24 GB, aunque no se documenta una validación específica en esas tarjetas.
- Cabe en GPU de consumo solo en las cuantizaciones más agresivas y con la advertencia de degradación de calidad del autor.
- Opciones de despliegue: `stable-diffusion.cpp` (`sd-cli`) para el pipeline completo y `llama.cpp` para el text encoder. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones comparables de otros modelos en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. Como referencia estructural, este modelo se distingue por combinar un DiT de aproximadamente 6.826 millones de parámetros con un text encoder derivado de Qwen3-VL-32B, un tamaño considerablemente mayor que el de muchos modelos de difusión de pesos abiertos, lo que explica los requisitos de memoria de la tabla anterior.

| Modelo | Parametros DiT | Text encoder | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| MiniMax-H3-Image (GGUF, este repo) | ~6.826 M | Qwen3-VL-32B recortado a 50 capas | no disponible | Comunitaria con territorios excluidos | GGUF, safetensors (VAE) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax-H3-Image Community License Agreement no permite el uso, la reproducción ni la distribución en la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos. Esto afecta directamente a desarrolladores en España.
- Este repositorio no es una distribución oficial de MiniMax; es una cuantización de terceros y puede contener diferencias respecto al modelo original.
- El número de pasos está fijado a 6 por la precomputación de AdaLN; no se puede cambiar el muestreo a otros valores de `--sigmas`.
- Degradación por cuantización documentada por el autor: Q8_0 a Q4_K_M mantienen la composición de BF16; IQ4_XS e IQ3 cambian la composición con mayor facilidad; IQ2 rompe la generación desde texto (la edición se mantiene aceptablemente hasta IQ2_S). La degradación proviene principalmente del DiT; el TE apenas afecta a la calidad hasta Q5_K_M.
- El text encoder incluido está recortado a 50 capas; para recuperar el original de 64 capas hay que combinar con `text_encoder_tail/` y ajustar la configuración.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas específicas; el campo de idiomas no está disponible.
- El uso en producción requiere verificar la licencia y la jurisdicción, y validar la calidad de la cuantización elegida para el caso de uso concreto.
- El tamaño del repositorio es de 386,0 GB, lo que implica una descarga considerable si se quieren todas las cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/yasutoshi-lab/MiniMax-H3-Image-GGUF
- Modelo base original: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Repositorio GitHub de MiniMax-H3-Image: https://github.com/MiniMax-AI/MiniMax-H3-Image
- ModelScope: https://modelscope.cn/models/MiniMax/MiniMax-H3-Image
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Hailuo AI: https://hailuoai.video
- API de MiniMax: https://platform.minimax.io
- Sitio web de MiniMax: https://www.minimax.io
- Discord de MiniMax: https://discord.com/invite/dbMxutw7tP
