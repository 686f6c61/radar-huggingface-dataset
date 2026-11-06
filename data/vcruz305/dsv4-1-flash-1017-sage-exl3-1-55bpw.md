# vcruz305/DSV4.1-Flash-1017-SAGE-EXL3-1.55bpw

## Resumen

Esta ficha corresponde a una cuantización comunitaria del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario vcruz305 en Hugging Face. No se trata de un modelo nuevo, sino de un pack EXL3 (formato de ExLlamaV3) de 1,55 bits por peso (bpw) que permite ejecutar el modelo original en hardware con memoria unificada de 128 GB, como Mac Studio o dispositivos equivalentes. La cuantización emplea SAGE, un método propio de precisión mixta del autor en el que cada tensor usa un valor de compresión (K) distinto, optimizando la relación entre tamaño y fidelidad.

El modelo base es un MoE con arquitectura CED de DeepSeek, con 256.622.688.722 parámetros totales (dato real extraído de los safetensors), 40 capas y 384 expertos enrutados más 1 experto compartido con top-6. Es un modelo multimodal (image-text-to-text) con licencia MIT, lo que lo hace especialmente atractivo para uso comercial sin restricciones.

Su relevancia radica en que hace accesible un modelo de más de 250 mil millones de parámetros en una sola máquina de gama alta, con una fidelidad medida muy alta respecto a la versión oficial FP8/FP4 de DeepSeek: 94,52 % de acuerdo Top-1 en la evaluación end-to-end y divergencias KL muy bajas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (CED) basado en DeepSeek-V4.1-Flash-1017, transformer decodificador, multimodal (image-text-to-text) |
| Parámetros totales | 256.622.688.722 (dato real de safetensors) |
| Parámetros activos | no disponible (MoE con 384 expertos enrutados + 1 compartido, top-6) |
| Longitud de contexto | no disponible (consultar la ficha del modelo base) |
| Tipos de cuantización | EXL3 1,55 bpw con SAGE (precisión mixta, valor K variable por tensor) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3/trellis), 17 shards, índice `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4.1-Flash-1017, es un MoE con arquitectura CED de 40 capas, 384 expertos enrutados más 1 experto compartido, con activación de los 6 expertos más relevantes por token (top-6). Es un modelo multimodal que acepta imagen y texto como entrada. Los detalles del preentrenamiento (número de tokens, composición del dataset, RLHF/DPO) corresponden a DeepSeek y no están incluidos en esta model card; deben consultarse en la ficha del modelo original.

En cuanto a la cuantización, SAGE es un método de precisión mixta para EXL3 desarrollado por vcruz305 y no publicado públicamente. Cada tensor se cuantiza con un valor K de EXL3 distinto, y los kernels de ExLlamaV3 leen el K directamente del tensor trellis en tiempo de carga, lo que hace que el pack sea autodescriptivo. El objetivo declarado es preservar la máxima concordancia token a token con la versión oficial mixta FP8/FP4 de DeepSeek, y los datos medidos (94,52 % de acuerdo Top-1 en `e2e_eval`) indican que se ha logrado con éxito.

## Capacidades

- Generación de texto conversacional (pipeline image-text-to-text).
- Comprensión de imágenes combinada con texto (VLM), según el pipeline del modelo base.
- Razonamiento, código y matemáticas: la evaluación de concordancia por categorías del autor cubre código (99,08 % Top-1), razonamiento (96,04 %) y matemáticas (95,56 %), lo que sugiere que el modelo base conserva capacidades fuertes en estas áreas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente.
- Capacidades multilingües: no disponible.
- Ejecución local eficiente en dispositivos de memoria unificada de 128 GB gracias al formato EXL3 de 1,55 bpw.

## Casos de uso

- Inferencia local de un MoE de gran tamaño en una sola máquina: el pack está dimensionado para caber íntegramente en un dispositivo de memoria unificada de 128 GB (~108,5 GiB en modo texto), ideal para desarrolladores que quieren ejecutar un modelo de más de 250 B de parámetros sin cluster de GPUs.
- Asistencia de programación offline: la categoría de código muestra la mayor fidelidad de cuantización (99,08 % Top-1, KL medio de 0,0186), por lo que es adecuado para autocompletado, revisión y generación de código en local.
- Razonamiento y resolución de problemas matemáticos: con un 96,04 % y 95,56 % de acuerdo Top-1 en razonamiento y matemáticas respectivamente, el pack es apto para tareas de razonamiento estructurado y cálculo simbólico.
- Análisis de documentos con imágenes: al tratarse de un modelo image-text-to-text, puede emplearse para extraer información de capturas, diagramas o documentos escaneados combinándolos con instrucciones textuales.
- Procesamiento de contexto largo: la evaluación `long17k` (17.408 tokens) muestra un KL medio de solo 0,0445 y 93,70 % de acuerdo, lo que respalda su uso en resumen y análisis de documentos extensos.
- Prototipado y experimentación con MoE: la licencia MIT y la carga directa desde ExLlamaV3 facilitan integrarlo en pipelines de investigación sin restricciones de licencia.
- Despliegue en estaciones de trabajo de gama alta: adecuado para equipos tipo Mac Studio con memoria unificada que necesiten un asistente conversacional privado sin envío de datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) ni en esta model card ni en la información disponible. Los únicos datos medidos son de fidelidad de la cuantización frente a la versión oficial FP8/FP4 de DeepSeek (concordancia token a token y divergencia KL), no de capacidad del modelo:

| Dataset | KL medio vs oficial FP8/FP4 | KL p50 | Top-1 Agreement | Top-5 Overlap |
|---|---|---|---|---|
| `e2e_eval` (Assistant-Turn, 21.458 tok) | 0,0982 | 0,00019 | 94,52 % | 81,16 % |
| `e2e_eval` (Non-Header, 29.492 tok) | 0,1150 | 0,00029 | 94,00 % | 80,84 % |
| `long17k` (17.408 tok, contexto largo) | 0,0445 | 0,00027 | 93,70 % | — |
| `wiki1100` (1.100 tok, WikiText-2) | 0,0882 | 0,00250 | 88,20 % | — |

Desglose por categorías en `e2e_eval`:

| Categoría | KL medio | KL p50 | Top-1 Agreement | Top-1 (solo respuesta) | Top-5 Overlap |
|---|---|---|---|---|---|
| Código | 0,0186 (0,0046 en respuesta) | 0,000004 | 99,08 % | 99,61 % | 80,38 % |
| Razonamiento | 0,0349 (0,0306 en respuesta) | 0,000480 | 96,04 % | 97,98 % | 86,34 % |
| Matemáticas | 0,0477 (0,0408 en respuesta) | 0,000306 | 95,56 % | 94,19 % | 83,99 % |
| General | 0,2245 | 0,001505 | 89,94 % | 89,21 % | 76,24 % |

Para benchmarks de capacidad del modelo original, consultar la ficha de DeepSeek-V4.1-Flash-1017.

## Requisitos de hardware

- VRAM/memoria estimada: ~108,5 GiB de footprint residente en modo texto y ~109,4 GiB en modo VLM (con pesos completamente residentes en GPU). El pack completo ocupa 320,3 GB en disco.
- GPU recomendadas: no cabe en GPUs convencionales de 24-80 GB. Está diseñado para un único dispositivo de memoria unificada de 128 GB (por ejemplo, Mac Studio con chip de gama alta). En GPUs NVIDIA haría necesario repartir entre varias A100/H100 de 80 GB o similar.
- Consumer GPU: no cabe en ninguna GPU de consumo estándar (RTX 4090 con 24 GB es muy insuficiente); solo viable en sistemas de memoria unificada de 128 GB o configuraciones multi-GPU.
- Despliegue: ExLlamaV3 exclusivamente (este formato EXL3 no es compatible con vLLM, TGI, llama.cpp u Ollama). La carga se realiza con la API de `exllamav3` apuntando al repositorio o a una copia local.
- Latencia y throughput: no disponible.
- Nota de muestreo: la `generation_config.json` del pack fija `top_p=0.95`, mientras que DeepSeek recomienda `temperature=1.0` y `top_p=1.0`; conviene fijar `top_p` explícitamente para seguir la recomendación del modelo base.

## Comparativa con modelos similares

Comparativa orientativa entre packs cuantizados de modelos MoE de gran tamaño con licencia permisiva (los datos de packs alternativos concretos no están disponibles en la información proporcionada):

| Modelo | Parámetros totales | Cuantización | Formato | Footprint residente | Licencia |
|---|---|---|---|---|---|
| DSV4.1-Flash-1017-SAGE-EXL3-1.55bpw (este pack) | 256,6 B | 1,55 bpw (SAGE mixed-K) | EXL3/safetensors | ~108,5 GiB (texto) | MIT |
| DeepSeek-V4.1-Flash-1017 (oficial) | 256,6 B | FP8/FP4 mixto | safetensors | no disponible | MIT |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

En términos generales, la ventaja diferencial de este pack frente a la versión oficial es la reducción del footprint a ~108,5 GiB, lo que permite ejecución en un solo dispositivo de memoria unificada de 128 GB con una pérdida de fidelidad medida muy baja (94,52 % Top-1 de acuerdo).

## Limitaciones y advertencias

- Sesgos conocidos: los del modelo base DeepSeek-V4.1-Flash-1017; no documentados en esta model card.
- Riesgo de alucinación: inherente al modelo base; la cuantización a 1,55 bpw introduce una pequeña desviación adicional (KL medio de 0,0982 en `e2e_eval`), con mayor degradación relativa en la categoría general (89,94 % Top-1) que en código o razonamiento.
- La categoría "General" es la más sensible a la cuantización, con el KL medio más alto (0,2245) y el menor acuerdo Top-1; puede notarse en tareas conversacionales abiertas.
- La calidad en `wiki1100` (88,20 % de acuerdo) indica mayor desviación en texto corto tipo Wikipedia que en secuencias largas.
- Limitaciones de contexto e idiomas: no disponibles en la información proporcionada; consultar la ficha del modelo base.
- Licencia: MIT, sin restricciones para uso comercial. Se solicita citar a DeepSeek como autores del modelo base; este repositorio es solo el pack EXL3.
- El método SAGE no está publicado, por lo que la metodología de cuantización no puede auditarse de forma independiente; los datos de fidelidad provienen únicamente del autor.
- Compatibilidad limitada a ExLlamaV3: no utilizable directamente con vLLM, llama.cpp, Ollama o TGI.
- Requiere hardware muy específico (128 GB de memoria unificada o multi-GPU), lo que restringe el público potencial.
- Discrepancia en `top_p` entre el pack (0,95) y la recomendación del modelo base (1,0): fijar el parámetro explícitamente al desplegar.

## Enlaces

- Pack EXL3 cuantizado: https://huggingface.co/vcruz305/DSV4.1-Flash-1017-SAGE-EXL3-1.55bpw
- Modelo base (DeepSeek): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio de ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Autor del pack: https://huggingface.co/vcruz305
