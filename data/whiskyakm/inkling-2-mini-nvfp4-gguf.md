# WhiskyAKM/Inkling-2-Mini-NVFP4-GGUF

## Resumen

Inkling-2-Mini-NVFP4-GGUF es una cuantizacion en formato GGUF del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario WhiskyAKM. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 26.070.385.152 parametros totales (aproximadamente 26B) y 3.4B parametros activos por token (5.4B efectivos, ya que 12 capas se ejecutan en bucle). Esta pensado para tareas de image-text-to-text, es decir, procesa imagenes y texto de forma conjunta, y esta orientado a conversacion multilingue.

La relevancia de esta publicacion concreta reside en el formato: el checkpoint original almacena las capas `ffn` 0-19 en NVFP4 y las capas 20-23 en MXFP8 (F8_E4M3), y esta version preserva esa mezcla de tipos de cuantizacion para su uso en llama.cpp y otros runtimes compatibles con GGUF. Se ofrecen varias variantes con distintos niveles de compresion y un fichero `mmproj.gguf` separado que aporta la capacidad de vision.

El repositorio ocupa 144.8 GB en total, aunque los ficheros individuales van de 13.1 GB a 16.1 GB, lo que permite desplegar el modelo en hardware relativamente modesto segun la variante elegida. La licencia es Apache 2.0 y el modelo esta etiquetado como multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), con 12 capas en bucle (looped) |
| Parametros totales | 26.070.385.152 (~26B) |
| Parametros activos | 3.4B activos por token (5.4B efectivos) |
| Longitud de contexto | no disponible (los ejemplos de uso emplean 32768 tokens) |
| Tipos de cuantizacion | NVFP4, MXFP8 (F8_E4M3), Q4_K, Q3_K, Q2_K, IQ2_XXS, IQ3_XXS, BF16 (vision) |
| Idiomas soportados | multilingue (sin desglose de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama-cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con 26B parametros totales y 3.4B activos por token. Un detalle arquitectonico destacable es que 12 capas se ejecutan en bucle, lo que eleva el computo efectivo a 5.4B parametros. El checkpoint original emplea cuantizacion mixta: las capas `ffn` 0-19 estan almacenadas en NVFP4 y las capas 20-23 en MXFP8 (F8_E4M3). La capacidad multimodal se aporta mediante un proyector de vision independiente (`mmproj.gguf`) en BF16.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card del repositorio de cuantizacion no detalla estos aspectos y se limita a describir el proceso de cuantizacion: se preservan las capas NVFP4 y MXFP8 originales y el resto se cuantiza a Q2_K, Q3_K o Q4_K segun la variante. Algunos ficheros fueron recuantizados con una nueva imatrix el 23.11.2026.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Procesamiento de imagenes y texto de forma conjunta (image-text-to-text) mediante el proyector `mmproj.gguf`.
- Capacidades multilingues (etiquetado como multilingue, sin listado de idiomas).
- Compatibilidad con endpoints OpenAI a traves de `llama-server`.
- Uso en `llama-cli` para inferencia local por linea de comandos.
- No se documenta soporte explicito de tool calling, function calling ni modos de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede mantener dialogos multi-turno en local con llama.cpp, sin dependencia de servicios en la nube, gracias a su naturaleza MoE que activa solo 3.4B parametros por token.
- Analisis de imagenes con descripcion textual: usando `llama-server` con `--mmproj mmproj.gguf`, se pueden enviar imagenes junto a preguntas para tareas de captioning, respuesta visual a preguntas o extraccion de informacion de documentos escaneados.
- Despliegue en hardware de consumo: las variantes de 13-16 GB permiten ejecutar un modelo de 26B en GPU consumer con suficiente VRAM, algo inviable con el checkpoint completo en precision alta.
- Prototipado de aplicaciones multimodal: la API compatible con OpenAI de `llama-server` facilita integrar el modelo en aplicaciones existentes que ya consumen la API de OpenAI, cambiando solo la URL base.
- Procesamiento de documentos multilingues: la capacidad multilingue y la ventana de contexto de 32768 tokens empleada en los ejemplos permiten resumir o extraer datos de documentos extensos en varios idiomas.
- Experimentacion e investigacion: al ser una cuantizacion con distintos niveles (Q2_K a Q4_K, NVFP4 puro, IQ2_XXS), permite estudiar el impacto de la cuantizacion en la calidad mediante la metrica KLD reportada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta la divergencia KL (KLD) de cada variante de cuantizacion respecto al modelo original:

| Fichero | Tamano | Tipo | KLD |
|---|---|---|---|
| `inkling-2-mini-fp8-nvfp4-q4_k.gguf` | 16.1 GB | MXFP8+NVFP4+Q4_K | 0.020 |
| `inkling-2-mini-fp8-nvfp4-q3_k.gguf` | 15.8 GB | MXFP8+NVFP4+Q3_K | 0.040 |
| `inkling-2-mini-fp8-nvfp4-q2_k.gguf` | 15.7 GB | MXFP8+NVFP4+Q2_K | 0.110 |
| `inkling-2-mini-q4_k-nvfp4.gguf` | 14.4 GB | NVFP4+Q4_K | 0.027 |
| `inkling-2-mini-i2_xs-nvfp4.gguf` | 13.1 GB | IQ2_XXS+NVFP4+IQ3_XXS | 0.074 |
| `inkling-2-mini-nvfp4.gguf` | 14.4 GB | NVFP4 | 0.032 |

Segun el autor, `inkling-2-mini-q4_k-nvfp4.gguf` presenta la mejor relacion KLD/GB.

## Requisitos de hardware

- VRAM estimada: entre 13.1 GB y 16.1 GB para los pesos del modelo segun la variante, mas aproximadamente 0.6 GB del proyector de vision y el espacio para el contexto KV cache.
- GPU recomendadas: no especificadas por el autor. Por tamano, las variantes de 13-16 GB encajan en GPUs consumer de gama alta con 16 GB o mas de VRAM (por ejemplo, RTX 4080/4090 o equivalentes); para contextos largos de 32768 tokens habra que sumar la memoria del KV cache.
- Cabe en GPU consumer: si, en las variantes de menor tamano, siempre que se disponga de al menos 16 GB de VRAM y se ajuste el contexto.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con API compatible con OpenAI) y otros runtimes compatibles con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento de modelos comparables de la misma categoria (MoE de ~26B con capacidades multimodales), por lo que no es posible establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Al tratarse de una cuantizacion, existe perdida de calidad respecto al modelo original; la variante Q2_K presenta un KLD de 0.110, notablemente superior al resto.
- No se han publicado evaluaciones de sesgo, alucinacion ni robustez para este modelo.
- La informacion sobre idiomas es generica ("multilingue") y no se detalla el nivel de soporte por idioma.
- La longitud de contexto real no esta documentada; los ejemplos usan 32768 tokens, pero no se confirma como maximo oficial.
- No se documentan capacidades de tool calling ni de razonamiento multi-paso, por lo que no deben asumirse en produccion sin validacion.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original en thinkingmachines/Inkling-2-Mini.
- El repositorio es una cuantizacion de terceros (WhiskyAKM), no una publicacion oficial del desarrollador del modelo base; la trazabilidad y el soporte dependen del autor de la cuantizacion.
- El autor advierte que se publicaran mas cuantizaciones con capas MXFP8 recuantizadas a NVFP4 en el futuro, lo que implica que el conjunto de ficheros puede cambiar.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/WhiskyAKM/Inkling-2-Mini-NVFP4-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- llama.cpp: https://github.com/ggerganov/llama.cpp
