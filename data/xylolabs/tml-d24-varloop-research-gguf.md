# Xylolabs/TML-d24-varloop-research-GGUF

## Resumen

TML-d24-varloop-research-GGUF es la version cuantizada en formato GGUF del modelo multimodal TML-d24-varloop-research, desarrollado originalmente por Thinking Machines y convertido a llama.cpp por Xylolabs. Se trata de un modelo de arquitectura MoE (mixture of experts) con 26.070.390.272 parametros totales, disenado para tareas de image-text-to-text, es decir, entrada conjunta de imagen y texto con generacion de texto. La cuantizacion emplea el esquema NVFP4 con escalas por experto, una innovacion que preserva la precision del modelo BF16 original mucho mejor que las cuantizaciones GGUF convencionales.

La relevancia de esta publicacion radica en dos factores. Primero, permite ejecutar un modelo MoE multimodal de 26B parametros en GPUs de consumo como la RTX 4090 o la RTX 3090 con 24 GB de VRAM, gracias al archivo NVFP4-Lite de 17,63 GB. Segundo, la tabla de precision publicada muestra una divergencia KL frente a BF16 de solo 0,0034 en WikiText-2 para NVFP4-Lite, frente a 0,0188 del baseline Q4_K_M de llama.cpp, lo que supone una mejora sustancial en fidelidad de cuantizacion.

El modelo incorpora un mecanismo denominado "varloop" (etiqueta `inkling`), con un contador de bucles configurable en tiempo de carga mediante `--override-kv inkling2_loop.loop.count=int:N`, cuyo valor por defecto es tres. Los GGUFs incluyen un proyector visual separado (mmproj) y omiten el drafter MTP del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con mecanismo varloop/inkling; transformer multimodal image-text-to-text |
| Parametros totales | 26.070.390.272 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1M tokens (segun hardware y configuracion; 32K en 24 GB, 512K en 48 GB, 1M en 80 GB o mas) |
| Tipos de cuantizacion | NVFP4 (22,92 GB), NVFP4-Lite (17,63 GB); proyectores mmproj en BF16 (641,81 MB) y Q8_0 (345,91 MB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0, sujeta a la Model Acceptable Use Policy de Thinking Machines |
| Formato de pesos | GGUF (llama.cpp), con proyector visual separado en GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con capas MoE, orientado a tareas image-text-to-text. La arquitectura incorpora un mecanismo propietario denominado "varloop" (identificado en los tags como `inkling`), que aplica un numero configurable de iteraciones o bucles sobre determinadas capas; el valor por defecto es tres y puede modificarse en tiempo de carga con `--override-kv inkling2_loop.loop.count=int:N`. El modelo original de Thinking Machines incluye un drafter MTP (multi-token prediction) para decodificacion especulativa, que los GGUFs de Xylolabs omiten deliberadamente; tambien se separa el proyector visual en un archivo mmproj independiente.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La innovacion tecnica destacable de esta publicacion es la cuantizacion NVFP4 con escalas por experto: el autor advierte que versiones de llama.cpp anteriores a `b12611` ignoran dichas escalas y producen salidas incorrectas. La tabla de precision publicada compara NVFP4 y NVFP4-Lite contra BF16 y contra el baseline Q4_K_M de llama.cpp, mostrando divergencias KL de 0,0026 y 0,0034 respectivamente en WikiText-2, frente a 0,0188 del baseline.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, con pipeline `conversational` y soporte de plantilla Jinja (`--jinja`).
- Procesamiento conjunto de imagen y texto (image-text-to-text) mediante el proyector visual mmproj incluido por separado.
- Razonamiento multi-paso y bucles iterativos configurables a traves del mecanismo varloop/inkling.
- Contexto extensible hasta 1M tokens en hardware con memoria suficiente (80 GB o mas en una sola GPU, o memoria unificada de 128 GB o superior).
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue en llama.cpp y llama-server.
- Capacidades de codigo y matematicas: no confirmadas explicitamente en la informacion disponible.
- Soporte de tool calling: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta cumplimentado en la model card).

## Casos de uso

- Analisis de documentos escaneados con contexto largo: el modelo puede recibir imagenes de paginas junto con texto de instrucciones y mantener hasta 1M tokens de contexto en un H100 o H200, lo que permite procesar expedientes completos en una sola pasada.
- Asistencia conversacional multimodal en local: con el archivo NVFP4-Lite (17,63 GB) cabe en una RTX 4090 o RTX 3090 de 24 GB y permite desplegar un chatbot que acepte capturas de pantalla o fotos como entrada sin depender de la nube.
- Procesamiento por lotes de imagenes etiquetadas: integrable en pipelines de llama-server para clasificar, describir o extraer informacion de lotes de imagenes con contexto de 32K a 64K segun la GPU disponible.
- Investigacion sobre cuantizacion NVFP4: la tabla de precision publicada (KL y top-1 frente a BF16) convierte este repositorio en un caso de referencia para estudiar el impacto de NVFP4 con escalas por experto en modelos MoE multimodales.
- Despliegue en estaciones de trabajo con memoria unificada: en Mac Studio M5 Max o Ultra y DGX Spark (128 GB o mas) se puede ejecutar el archivo NVFP4 con contexto de hasta 1M tokens, adecuado para prototipado sin GPU dedicada.
- Experimentacion con razonamiento iterativo: el contador de bucles varloop ajustable en carga permite comparar el efecto del numero de iteraciones sobre la calidad de respuesta en tareas de razonamiento.
- Evaluacion de modelos MoE en entornos con VRAM limitada: el formato GGUF y la compatibilidad con llama.cpp facilitan pruebas en equipos de desarrollo sin infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente incluye metricas de fidelidad de cuantizacion frente a BF16:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Chat KL | Chat top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| NVFP4 | 22,92 GB | 0,0026 | 97,8% | 0,0142 | 96,9% | 0,0025 | 97,8% |
| NVFP4-Lite | 17,63 GB | 0,0034 | 97,6% | 0,0194 | 96,4% | 0,0030 | 97,4% |
| llama.cpp baseline Q4_K_M | 17,48 GB | 0,0188 | 94,2% | 0,0449 | 93,7% | 0,0137 | 94,9% |

## Requisitos de hardware

- VRAM estimada: 17,63 GB para NVFP4-Lite y 22,92 GB para NVFP4, mas el proyector visual (345,91 MB en Q8_0 o 641,81 MB en BF16) y el espacio de cache KV segun contexto.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) con NVFP4-Lite y contexto de 32K; RTX 5090 (32 GB) con NVFP4 y contexto de 64K.
- GPU profesionales y de centro de datos: RTX 6000 Ada o 2 x 24 GB (48 GB) con NVFP4 y 512K de contexto; H100 (80 GB), H200 (141 GB), B200 (192 GB) y B300 (288 GB) con NVFP4 y hasta 1M de contexto.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB) y Mac Studio M5 Ultra (256 GB o 512 GB) con NVFP4 y hasta 1M de contexto.
- Opciones de despliegue: llama.cpp y llama-server (release `b12611` o posterior, obligatorio); no se mencionan otros motores como vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion destacada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TML-d24-varloop-research-GGUF (este) | 26,07B (MoE) | hasta 1M | NVFP4 / NVFP4-Lite | Apache 2.0 | Hugging Face, llama.cpp |
| TML-d24-varloop-research (base) | 26,07B (MoE) | no disponible | BF16 | Apache 2.0 | Hugging Face (Thinking Machines) |
| Baseline Q4_K_M de llama.cpp | 26,07B (MoE) | segun configuracion | Q4_K_M (17,48 GB) | Apache 2.0 | llama.cpp |

La comparativa se limita al modelo base y al baseline de cuantizacion incluidos en la model card; no se dispone de datos sobre otros modelos multimodales de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere llama.cpp `b12611` o posterior: versiones anteriores ignoran las escalas NVFP4 por experto y generan salidas incorrectas.
- El drafter MTP del modelo original se omite en estos GGUFs, por lo que no se dispone de decodificacion especulativa integrada.
- El proyector visual es un archivo separado; para uso solo de texto debe omitirse `--mmproj`, y para uso multimodal debe cargarse explicitamente.
- El contexto maximo depende del hardware: 32K en 24 GB, 64K en 32 GB, 512K en 48 GB y 1M en 80 GB o mas; no es alcanzable en GPUs de consumo con el archivo NVFP4-Lite.
- Idiomas soportados no documentados; riesgo de rendimiento desigual fuera del ingles.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de sesgo en la informacion disponible.
- La licencia Apache 2.0 va acompanada de la Model Acceptable Use Policy de Thinking Machines, que anade restricciones de uso aceptable mas alla de la licencia permisiva.
- El renombrado de archivos del 23 de noviembre de 2026 (NVFP4-Q8_0 a NVFP4-Lite) puede provocar referencias obsoletas en scripts y descargas previas.
- No se han publicado benchmarks de tareas ni datos de throughput o latencia, lo que dificulta estimar el rendimiento en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/TML-d24-varloop-research-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/TML-d24-varloop-research
- Licencia: https://huggingface.co/Xylolabs/TML-d24-varloop-research-GGUF/blob/main/LICENSE
- Politica de uso aceptable de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de herramientas de cuantizacion de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
