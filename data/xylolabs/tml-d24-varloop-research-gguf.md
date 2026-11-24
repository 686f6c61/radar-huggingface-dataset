# Xylolabs/TML-d24-varloop-research-GGUF

## Resumen

TML-d24-varloop-research es un modelo multimodal de investigación desarrollado por Thinking Machines Lab que acepta entradas de texto e imagen y genera salidas de texto. Se trata de la variante "variable-looped" de Inkling 2 Mini: mientras que este último ejecuta sus capas con bucle un número fijo de veces, en TML-d24-varloop-research el número de iteraciones del bucle puede elegirse en tiempo de inferencia sobre un único conjunto de pesos. Esta característica lo convierte en una herramienta de investigación para estudiar cómo afecta la computación recurrente adicional al cómputo interno del modelo y a su capacidad global.

La ficha que nos ocupa corresponde a la edición GGUF publicada por Xylolabs, un tercero independiente de Thinking Machines Lab, que cuantiza el modelo base para su uso con llama.cpp. El repositorio incluye un proyector de visión separado y omite el "MTP drafter" del modelo original. Los pesos cuantizados están en formato NVFP4 y NVFP4-Lite, con proyectores multimodales en BF16 y Q8_0.

El modelo cuenta con aproximadamente 26.070 millones de parámetros totales, arquitectura MoE (mixture of experts) con capas en bucle, y está publicado bajo licencia Apache 2.0. La relevancia actual reside en su naturaleza de investigación abierta sobre modelos con cómputo recurrente variable, un área poco explorada con pesos públicos, y en la disponibilidad de cuantizaciones NVFP4 que reducen el peso a 17,6-22,9 GB, permitiendo su ejecución en GPUs de consumo como la RTX 4090 o la RTX 5090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas en bucle (variable-looped), MoE |
| Parametros totales | 26.070.390.272 (~26,1 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1M tokens segun hardware (tabla del autor) |
| Tipos de cuantizacion | NVFP4, NVFP4-Lite; proyectores en BF16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (sujeta a la Model Acceptable Use Policy de Thinking Machines) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

TML-d24-varloop-research es un modelo multimodal con arquitectura de transformer con capas en bucle, es decir, capas que se ejecutan de forma recurrente un número variable de veces. A diferencia de Inkling 2 Mini, que fija el número de iteraciones, este modelo permite seleccionar el número de bucles en tiempo de inferencia sobre los mismos pesos, lo que facilita comparaciones controladas del efecto de la computación recurrente adicional. La arquitectura incorpora componentes MoE (etiqueta `moe` en el repositorio) y un proyector de visión separado para el procesamiento de imágenes.

En cuanto al entrenamiento, la información disponible no detalla el número de tokens, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. La model card original de Thinking Machines Lab describe el modelo como "research model" y su motivación principal es el estudio de modelos con bucles variables. La edición GGUF de Xylolabs omite el MTP drafter (decodificación especulativa multi-token) del modelo original y separa el proyector de visión como archivo independiente. El número de bucles por defecto es tres y puede modificarse en carga mediante `--override-kv inkling2_loop.loop.count=int:N`.

## Capacidades

- Generación de texto a partir de entradas de texto e imagen (pipeline image-text-to-text).
- Procesamiento de imágenes mediante proyector de visión separado (archivos `mmproj` en BF16 o Q8_0).
- Razonamiento con cómputo recurrente ajustable: el número de bucles de las capas puede modificarse en inferencia, permitiendo explorar el equilibrio entre coste computacional y capacidad.
- Conversación multi-turno (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Uso con llama.cpp mediante `llama-server` con soporte de plantilla Jinja (`--jinja`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre cómputo recurrente: el modelo permite variar el número de bucles sobre un mismo conjunto de pesos y medir el impacto en la calidad de salida, el cómputo interno y la latencia. Es el caso de uso principal declarado por el autor.
- Experimentación académica con modelos MoE multimodales: al estar bajo Apache 2.0 y en formato GGUF, permite reproducir experimentos en hardware de consumo sin depender de infraestructura de centro de datos.
- Análisis de atención y representaciones internas: la variabilidad del bucle facilita estudiar cómo se transforman las activaciones con iteraciones adicionales en un transformer recurrente.
- Prototipado de aplicaciones imagen-texto en local: con el proyector de visión y una RTX 4090 (17,6 GB, contexto 32K) se puede desplegar un servidor multimodal ligero para pruebas de concepto.
- Evaluación de cuantizaciones NVFP4: el repositorio publica métricas de divergencia KL frente a BF16, lo que lo convierte en un banco de pruebas para estudiar la degradación de cuantizaciones de 4 bits en modelos MoE.
- Despliegue en estaciones de trabajo con memoria unificada: en un Mac Studio M5 Max o DGX Spark (128 GB) se puede ejecutar el modelo con contexto de hasta 1M tokens para tareas de análisis de documentos largos con imágenes.
- Comparación de configuraciones de bucle en producción: ajustar el número de bucles según el presupuesto de latencia permite adaptar el modelo a distintos SLA sin cambiar de pesos.

## Benchmarks y rendimiento

El autor de la cuantización publica métricas de fidelidad frente a la referencia BF16 (divergencia KL media, menor es mejor, y acuerdo top-1), medidas con llama.cpp sobre fragmentos de 512 tokens de tres textos:

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| NVFP4 | 22,92 GB | 0,0026 | 97,8% | 0,0142 | 96,9% | 0,0025 | 97,8% |
| NVFP4-Lite | 17,63 GB | 0,0034 | 97,6% | 0,0194 | 96,4% | 0,0030 | 97,4% |
| llama.cpp baseline Q4_K_M | 17,48 GB | 0,0188 | 94,2% | 0,0449 | 93,7% | 0,0137 | 94,9% |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 17,6 GB (NVFP4-Lite) o 22,9 GB (NVFP4) para los pesos de texto, más el proyector de visión (0,35-0,64 GB) y la caché KV en f16 según contexto.
- El autor indica que un archivo cabe cuando su tamaño más la caché KV al contexto dado (f16) más 2 GB de runtime queda por debajo del 90% de la memoria disponible.
- RTX 4090 / RTX 3090 (24 GB): NVFP4-Lite con contexto de 32K.
- RTX 5090 (32 GB): NVFP4 con contexto de 64K.
- RTX 6000 Ada o 2 x 24 GB (48 GB): NVFP4 con contexto de 512K.
- H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), DGX Spark (128 GB unificada), Mac Studio M5 Max (128 GB unificada), H200 (141 GB), B200 (~180 GB útiles), Mac Studio M5 Ultra (256/512 GB), B300 (288 GB): NVFP4 con contexto de hasta 1M.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 y RTX 5090 con las configuraciones indicadas.
- Opciones de despliegue: llama.cpp (release b12611 o posterior; versiones anteriores omiten las escalas NVFP4 por experto y producen salidas incorrectas). Ejemplo: `llama-server -m ... --mmproj ... --jinja`. Para uso solo de texto, omitir `--mmproj`.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TML-d24-varloop-research (esta ficha) | ~26,1B | hasta 1M segun hardware | Apache 2.0 | GGUF | Multimodal, MoE, bucles variables |
| Inkling 2 Mini (modelo base de referencia) | no disponible | no disponible | no disponible | no disponible | Bucles fijos; predecesor directo |
| thinkingmachines/TML-d24-varloop-research (original) | ~26,1B | no disponible | Apache 2.0 | safetensors | Incluye MTP drafter y proyector integrado |
| Alternativas de ~26B MoE multimodal | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación cuantitativa de rendimiento con alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor original lo publica para estudiar modelos con bucles, no como modelo de producción listo para uso general.
- La edición GGUF omite el MTP drafter del original, por lo que se pierde la decodificación especulativa y el rendimiento en latencia puede diferir del modelo base.
- Requiere llama.cpp b12611 o posterior; versiones anteriores producen salidas incorrectas por omisión de las escalas NVFP4 por experto.
- Idiomas soportados no declarados: no hay garantía de cobertura multilingüe.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Restricciones de licencia: Apache 2.0, pero sujeta a la Model Acceptable Use Policy de Thinking Machines; Xylolabs es independiente de Thinking Machines Lab.
- El número de bucles por defecto es tres; cambiarlo altera el comportamiento y el coste computacional, y no hay guía publicada sobre valores óptimos por tarea.
- Las métricas de fidelidad publicadas son de divergencia KL y acuerdo top-1 frente a BF16, no de calidad absoluta de la tarea.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/TML-d24-varloop-research-GGUF
- Modelo base original: https://huggingface.co/thinkingmachines/TML-d24-varloop-research
- Licencia: https://huggingface.co/Xylolabs/TML-d24-varloop-research-GGUF/blob/main/LICENSE
- Model Acceptable Use Policy de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
