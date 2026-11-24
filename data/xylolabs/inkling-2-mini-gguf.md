# Xylolabs/Inkling-2-Mini-GGUF

## Resumen

Inkling 2 Mini es un modelo multimodal (image-text-to-text) de arquitectura MoE desarrollado por Thinking Machines Lab, distribuido aquí en formato GGUF por Xylolabs para su uso con llama.cpp. El repositorio contiene cuantizaciones del modelo base `thinkingmachines/Inkling-2-Mini`, con 26.070 millones de parámetros totales según los pesos en safetensors, e incluye un proyector de visión separado (`mmproj`) que habilita la entrada de imágenes. La ficha se centra en la edición GGUF, que es la que documenta el autor de la cuantización.

La relevancia de esta publicación está en la calidad de las cuantizaciones: Xylolabs aplica una matriz de importancia propia sobre el fichero NVFP4 original y publica métricas de divergencia KL y acuerdo top-1 frente a la referencia F32, lo que permite elegir el fichero según el compromiso tamaño/fidelidad. Las cuantizaciones de 17,6 GB (NVFP4-XL, NVFP4-Lite) mantienen un KL medio en WikiText-2 de 0,0026–0,0030, muy por debajo del baseline Q4_K_M de llama.cpp (0,0167).

El modelo se publica bajo licencia Apache 2.0, con la salvedad de que está sujeto a la Model Acceptable Use Policy de Thinking Machines. La ventana de contexto indicada en las tablas de hardware del autor llega hasta 1M tokens en configuraciones de memoria grande, aunque el dato de contexto nativo del modelo base no se detalla en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts); transformer multimodal con proyector de visión |
| Parametros totales | 26.070.390.272 (26,07 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como spec del modelo; el autor documenta configuraciones de hasta 1M tokens con KV cache f16 en hardware de 80 GB o más |
| Tipos de cuantizacion | NVFP4, NVFP4-Lite, NVFP4-XL, IQ4_XS, Q3_K_M, IQ3_XXS, Q2_K, IQ2_XXS (texto); BF16 y Q8_0 (proyector de visión) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (sujeta a la Model Acceptable Use Policy de Thinking Machines) |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye también en NVFP4 y safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) y capacidad multimodal image-text-to-text, según los tags del repositorio y el pipeline declarado. La edición GGUF omite el "MTP drafter" (drafter de decodificación especulativa multi-token) presente en el modelo original, por lo que estas cuantizaciones no incluyen esa capacidad de decodificación especulativa. El proyector de visión se distribuye como fichero separado (`mmproj`), en BF16 (641,81 MB) o Q8_0 (345,91 MB).

Las cuantizaciones de 15,73 GB a 8,49 GB usan los tipos por tensor y tamaños de Unsloth, cuantizados a partir del fichero NVFP4 con una matriz de importancia propia de Xylolabs. Los ficheros NVFP4, NVFP4-Lite y NVFP4-XL se derivan directamente del NVFP4 original. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento general (tag `conversational`).
- Procesamiento de imágenes junto con texto (image-text-to-text) mediante el proyector `mmproj`.
- Integración con llama.cpp y endpoints compatibles (`endpoints_compatible`).
- Cuantización MoE con escalas por experto (NVFP4), que requiere llama.cpp `b12611` o posterior.
- Soporte de plantillas de chat vía `--jinja` en `llama-server`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local multimodal en estación de trabajo: con `Inkling-2-Mini-NVFP4-XL.gguf` (17,6 GB) más el `mmproj` BF16 cabe en una RTX 4090/3090 de 24 GB con 32K de contexto, permitiendo procesar capturas de pantalla o documentos escaneados junto a instrucciones de texto sin salir del equipo.
- Asistente conversacional de contexto largo: en una H100 de 80 GB el autor documenta hasta 1M tokens de contexto con el fichero NVFP4, lo que habilita resumir o consultar corpus extensos (manuales, expedientes, historiales) en una sola sesión.
- Servidor de inferencia ligero con `llama-server`: el flag `--jinja` y la compatibilidad con endpoints permiten exponer el modelo como API compatible con clientes OpenAI en entornos de desarrollo y pruebas.
- Prototipado en hardware de consumo: `Inkling-2-Mini-IQ2_XXS.gguf` (8,49 GB) permite ejecutar el modelo en GPUs de 12–16 GB, con la contrapartida de un KL de 0,1086 en WikiText-2 y un top-1 del 86,2 %, adecuado solo para tareas tolerantes a degradación.
- Evaluación comparativa de cuantizaciones: las tablas de KL y top-1 publicadas permiten seleccionar el fichero óptimo por hardware y medir el impacto real de la cuantización antes de desplegar en producción.
- Procesamiento por lotes en clúster: con un B200 o B300 (192–288 GB) se puede servir el fichero NVFP4 con contexto de 1M y margen para concurrencia, útil para pipelines de análisis documental masivo.
- Uso en Mac Studio con memoria unificada: los perfiles M5 Max y M5 Ultra (128–512 GB) permiten ejecutar el modelo completo con contexto máximo sin GPU dedicada.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad de cuantización (divergencia KL media frente a la referencia F32 y acuerdo top-1), medidas con llama.cpp sobre fragmentos de 512 tokens de tres textos. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| NVFP4 | 22,92 GB | 0,0023 | 98,0 % | 0,0219 | 97,4 % | 0,0021 | 98,1 % |
| Unsloth UD-Q8_K_XL | 22,87 GB | 0,0024 | 97,9 % | 0,0202 | 97,4 % | 0,0022 | 98,3 % |
| Unsloth UD-Q4_K_XL | 17,63 GB | 0,0029 | 97,6 % | 0,0221 | 97,2 % | 0,0027 | 97,8 % |
| NVFP4-Lite | 17,63 GB | 0,0030 | 97,6 % | 0,0194 | 97,3 % | 0,0027 | 97,9 % |
| NVFP4-XL | 17,61 GB | 0,0026 | 97,8 % | 0,0214 | 97,2 % | 0,0024 | 97,9 % |
| llama.cpp baseline Q4_K_M | 17,48 GB | 0,0167 | 94,4 % | 0,0594 | 94,1 % | 0,0131 | 95,0 % |
| Unsloth UD-IQ4_XS | 15,73 GB | 0,0036 | 97,3 % | 0,0226 | 96,9 % | 0,0036 | 97,5 % |
| IQ4_XS | 15,73 GB | 0,0037 | 97,4 % | 0,0232 | 96,9 % | 0,0035 | 97,5 % |
| Unsloth UD-Q3_K_XL | 13,63 GB | 0,0136 | 95,2 % | 0,0354 | 95,6 % | 0,0116 | 95,6 % |
| Q3_K_M | 13,63 GB | 0,0153 | 94,9 % | 0,0450 | 95,1 % | 0,0134 | 95,3 % |
| Unsloth UD-IQ3_XXS | 11,66 GB | 0,0263 | 93,0 % | 0,0642 | 93,4 % | 0,0206 | 94,2 % |
| IQ3_XXS | 11,66 GB | 0,0317 | 92,2 % | 0,0956 | 92,3 % | 0,0252 | 93,4 % |
| Unsloth UD-Q2_K_XL | 9,14 GB | 0,0688 | 89,2 % | 0,0958 | 90,4 % | 0,0597 | 90,5 % |
| Q2_K | 9,14 GB | 0,0857 | 87,9 % | 0,1470 | 88,8 % | 0,0733 | 89,1 % |
| Unsloth UD-IQ2_XXS | 8,49 GB | 0,0857 | 88,1 % | 0,1145 | 89,8 % | 0,0734 | 89,4 % |
| IQ2_XXS | 8,49 GB | 0,1086 | 86,2 % | 0,1962 | 87,9 % | 0,0900 | 87,8 % |

## Requisitos de hardware

- Criterio del autor: un fichero cabe cuando su tamaño más la KV cache a ese contexto (f16) más 2 GB de runtime queda por debajo del 90 % de la memoria disponible.
- RTX 4090 / RTX 3090 (24 GB): `NVFP4-XL` (17,6 GB) con 32K de contexto.
- RTX 5090 (32 GB): `NVFP4` (22,9 GB) con 64K de contexto.
- RTX 6000 Ada o 2 × 24 GB (48 GB): `NVFP4` con 512K de contexto.
- H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), DGX Spark (128 GB unificada), Mac Studio M5 Max (128 GB unificada), H200 (141 GB), B200 (192 GB), Mac Studio M5 Ultra (256/512 GB), B300 (288 GB): `NVFP4` con 1M de contexto.
- GPU de consumo: sí, el modelo cabe en GPUs de 24 GB con el fichero NVFP4-XL; para 12–16 GB hay que recurrir a IQ3_XXS (11,66 GB) o IQ2_XXS (8,49 GB).
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`) con release `b12611` o posterior; versiones anteriores omiten las escalas NVFP4 por experto y producen salidas incorrectas. El proyector de visión se carga con `--mmproj`; para uso solo texto se omite.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas del modelo base en la información proporcionada, por lo que la comparativa se limita a la fidelidad de cuantización publicada por el autor frente a las cuantizaciones de Unsloth y al baseline de llama.cpp sobre el mismo modelo.

| Variante | Tamano | WikiText-2 KL | top-1 | Licencia |
|---|---:|---:|---:|---|
| NVFP4 (Xylolabs) | 22,92 GB | 0,0023 | 98,0 % | Apache 2.0 |
| Unsloth UD-Q8_K_XL | 22,87 GB | 0,0024 | 97,9 % | Apache 2.0 |
| NVFP4-XL (Xylolabs) | 17,61 GB | 0,0026 | 97,8 % | Apache 2.0 |
| Unsloth UD-Q4_K_XL | 17,63 GB | 0,0029 | 97,6 % | Apache 2.0 |
| llama.cpp baseline Q4_K_M | 17,48 GB | 0,0167 | 94,4 % | Apache 2.0 |
| IQ4_XS (Xylolabs) | 15,73 GB | 0,0037 | 97,4 % | Apache 2.0 |
| IQ2_XXS (Xylolabs) | 8,49 GB | 0,1086 | 86,2 % | Apache 2.0 |

Comparativa con modelos de otros autores de tamaño y categoría similares: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Las cuantizaciones de 2–3 bits (IQ2_XXS, Q2_K, IQ3_XXS) degradan notablemente la fidelidad: KL de 0,1086 y top-1 del 86,2 % en el caso de IQ2_XXS, frente a 0,0023 y 98,0 % del NVFP4. No son recomendables para tareas sensibles a la precisión.
- Los ficheros NVFP4 requieren llama.cpp `b12611` o posterior; compilaciones anteriores ignoran las escalas por experto y generan salida incorrecta sin aviso.
- La edición GGUF omite el MTP drafter del modelo original, por lo que no se beneficia de la decodificación especulativa multi-token.
- El proyector de visión es un fichero separado; sin `--mmproj` el modelo funciona solo con texto.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplicable el riesgo habitual de los modelos generativos.
- Idiomas soportados y limitaciones de contexto nativo: no disponibles.
- Licencia Apache 2.0, pero sujeta a la Model Acceptable Use Policy de Thinking Machines; es necesario revisar ambas antes de un uso comercial.
- Xylolabs es independiente de Thinking Machines Lab; los cambios respecto al modelo base se documentan en el fichero NOTICE del repositorio.
- El repositorio tiene 1 like y 15.349 descargas en el momento de la consulta; la validación comunitaria es aún escasa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia: https://huggingface.co/Xylolabs/Inkling-2-Mini-GGUF/blob/main/LICENSE
- Model Acceptable Use Policy: https://thinkingmachines.ai/model-acceptable-use-policy/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
