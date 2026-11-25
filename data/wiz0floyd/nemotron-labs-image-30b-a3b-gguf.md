# wiz0floyd/Nemotron-Labs-Image-30B-A3B-GGUF

## Resumen

Nemotron-Labs-Image-30B-A3B es un modelo de generacion de imagenes autorregresivo desarrollado por NVIDIA Labs. En lugar de emplear un difusor, utiliza un LLM de arquitectura MoE (`nemotron_h`) que escribe las imagenes como secuencias de tokens visuales discretos; un decodificador ViT independiente (`Nemotron-Labs-Image-Tokenizer`) convierte despues esos tokens en pixeles. El modelo cuenta con 32.634.904.896 parametros totales y aproximadamente 3B activos por token, lo que reduce el coste computacional de cada paso de inferencia pese al tamano del checkpoint.

La ficha que nos ocupa no documenta el modelo original, sino la conversion no oficial a GGUF realizada por el usuario `wiz0floyd`, pensada para ejecutar el generador en llama.cpp con cualquier backend. La motivacion principal es el desacoplamiento del ecosistema CUDA: el autor la valido en una AMD RX 7800 XT de 16 GB mediante Vulkan, sin CUDA, lo que abre el uso del modelo a hardware de consumo y a GPUs AMD.

Es relevante ahora porque demuestra que la generacion de imagenes autorregresiva basada en LLM puede cuantizarse y desplegarse en llama.cpp, aunque con limitaciones notables: la licencia NVIDIA restringe el uso a investigacion y evaluacion no comercial, y el flujo requiere un paso adicional de decodificacion en CPU con PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer autorregresivo (`nemotron_h`) para generacion de imagenes por tokens visuales discretos |
| Parametros totales | 32.634.904.896 (32,6B) |
| Parametros activos | ~3B (segun model card del autor de la conversion) |
| Longitud de contexto | 6.144 tokens configurados en el ejemplo de llama-server (`-c 6144`); una imagen de 1024x1024 consume ~4,2k tokens |
| Tipos de cuantizacion | Q8_0 y Q4_K_M (esta ultima con fallback a q5_0/q8_0 en muchos tensores por dimensiones no divisibles por 256) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA License (uso no comercial, solo investigacion o evaluacion) |
| Formato de pesos | GGUF (llama.cpp); pesos originales en safetensors en el repo de NVIDIA |

## Arquitectura y entrenamiento

El generador es un LLM MoE estandar de la familia `nemotron_h` con 30B parametros totales y unos 3B activos, que emite imagenes como tokens visuales discretos (ids 131075-327634). La decodificacion a pixeles la realiza un ViT separado, `Nemotron-Labs-Image-Tokenizer`, que se ejecuta en CPU con PyTorch. La conversion a GGUF se hizo con `convert_hf_to_gguf.py` de llama.cpp build b12424 usando el tipo de arquitectura `NEMOTRON_H_MOE`, seguida de `llama-quantize` para producir Q4_K_M.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. La receta de inferencia indicada por el autor (heredada de la model card original) es temperature 0.9, top_p 1, sin top_k, sin CFG y plantilla de chat con el modo thinking desactivado. El ancho y el alto de la imagen deben ser multiplos de 16.

## Capacidades

- Generacion de imagenes texto-a-imagen mediante decodificacion autorregresiva de tokens visuales.
- Resoluciones configurables en multiplos de 16; 1024x1024 consume aproximadamente 4.200 tokens.
- Reproducibilidad por semilla: misma prompt y semilla producen resultados estables dentro de una misma cuantizacion (aunque Q8_0 y Q4_K_M muestrean imagenes distintas).
- Ejecucion en llama.cpp con backend Vulkan, sin dependencia de CUDA.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repo).
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision de entrada, audio ni modo thinking operativo (la receta indica thinking desactivado).

## Casos de uso

- Generacion de ilustraciones de concepto en estaciones de trabajo con GPU AMD: el flujo llama.cpp + Vulkan permite producir imagenes de 1024x1024 en una RX 7800 XT de 16 GB, sin necesidad de CUDA ni de GPUs NVIDIA.
- Prototipado de pipelines texto-a-imagen en investigacion: al ser un LLM autorregresivo, se puede instrumentar la generacion token a token, analizar la distribucion de tokens visuales y estudiar el comportamiento del muestreo (temperature, top_p) de forma mas directa que en un difusor.
- Evaluacion comparativa de cuantizaciones: el repo incluye Q8_0 y Q4_K_M con imagenes de ejemplo para la misma prompt y semilla, lo que facilita medir la degradacion por cuantizacion en tareas de sintesis visual.
- Educacion y divulgacion: sirve para explicar la generacion de imagenes como problema de modelado de lenguaje sobre un vocabulario visual discreto, con un coste de hardware asequible.
- Pruebas de integracion en llama.cpp: util para validar el soporte de la arquitectura `NEMOTRON_H_MOE` y de modelos multimodales token-a-pixel en builds recientes de llama.cpp.
- Generacion de bocetos y material de baja fidelidad para iteracion creativa temprana, asumiendo las limitaciones de calidad descritas (texto inventado en carteles, estilo "early-DALL-E").

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento son medidas de inferencia del autor de la conversion:

| Metrica | Q8_0 | Q4_K_M |
|---|---|---|
| Throughput en RX 7800 XT (Vulkan) | 19,2 tok/s | 19,9 tok/s |
| Imagen 1024x1024 (prompt de ejemplo, semilla 42) | 4.176 tokens en 227 s | no disponible |
| Decodificacion ViT en CPU | 12 s | no disponible |
| Tamano del fichero | 32,3 GiB | 23,3 GiB |

## Requisitos de hardware

- VRAM estimada: Q8_0 ocupa 32,3 GiB y Q4_K_M 23,3 GiB en disco; con `--n-cpu-moe 40` parte de los expertos se descargan a RAM del sistema, por lo que la VRAM necesaria baja considerablemente respecto al tamano total.
- GPU recomendadas: el autor valido una AMD RX 7800 XT de 16 GB con Vulkan. Para mantener todo el modelo en VRAM harian falta GPUs de 24-48 GB (RTX 4090, A6000, A100 40/80 GB, H100).
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas usando offload parcial de expertos a CPU; en 24 GB (RTX 3090/4090) con Q4_K_M y offload reducido.
- Opciones de despliegue: llama.cpp (`llama-server`) con backend Vulkan o CUDA; el decodificador ViT requiere PyTorch con `transformers>=5`, `einops` y `pillow` en CPU.
- Parametros criticos de despliegue: `-ub 16 -b 16` es obligatorio en Vulkan con expertos descargados a CPU; con tamanos de batch por defecto el servidor se cae silenciosamente.
- Latencia y throughput: ~19 tok/s en RX 7800 XT; aproximadamente 227 s para una imagen de 1024x1024 mas 12 s de decodificacion en CPU.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de benchmarks ni comparaciones con otros modelos de generacion de imagenes autorregresivos o difusores, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Licencia NVIDIA: uso exclusivamente no comercial, limitado a investigacion o evaluacion. No apto para produccion comercial sin licencia adicional.
- Conversion no oficial: no esta afiliada ni respaldada por NVIDIA; la calidad y el soporte dependen del autor de la conversion.
- Alucinacion visual: el autor documenta artefactos como texto inventado en carteles (por ejemplo, el cartel del zorro), con un estilo "early-DALL-E".
- Q4_K_M atipico: muchos tensores no son divisibles por 256 y caen a q5_0/q8_0, por lo que el fichero es mucho mayor de lo habitual para esa cuantizacion.
- Manejo de tokens: el vocabulario GGUF marca los ids >=131072 como padding, por lo que el script envia y recibe ids crudos en lugar de texto; no es un modelo de chat convencional.
- Restriccion de resolucion: ancho y alto deben ser multiplos de 16.
- Dependencia externa: requiere descargar el tokenizer y el decodificador ViT del repo original de NVIDIA y ejecutar PyTorch en CPU, lo que anade latencia y complejidad al pipeline.
- Idiomas soportados no documentados; la generacion de texto dentro de la imagen puede degradarse en idiomas distintos del ingles.
- Sin datos de sesgos publicados en la informacion disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/wiz0floyd/Nemotron-Labs-Image-30B-A3B-GGUF
- Modelo base original: https://huggingface.co/nvidia/Nemotron-Labs-Image-30B-A3B
- llama.cpp (build b12424 y `convert_hf_to_gguf.py`): https://github.com/ggml-org/llama.cpp
