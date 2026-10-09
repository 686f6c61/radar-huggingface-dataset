# vosldtgbj/project-llm-rlvr-v1-step-75

## Resumen

`vosldtgbj/project-llm-rlvr-v1-step-75` es un punto de control de pesos completos publicado por el usuario vosldtgbj dentro de una trayectoria de entrenamiento que encadena preentrenamiento continuado (CPT), ajuste supervisado (SFT v3) y aprendizaje por refuerzo con recompensas verificables (RLVR). El modelo parte de `google/gemma-4-12B-it` y llega hasta este repositorio tras 75 actualizaciones de optimizador del run RLVR v1, que utiliza GRPO sincrono con 30 grupos de prompt y 480 rollouts por paso y un ritmo de aprendizaje de 1e-6.

Arquitecturalmente es un transformer multimodal unificado (`Gemma4UnifiedForConditionalGeneration`, `model_type: gemma4_unified`) con 48 capas de texto, hidden size 3.840 y vocabulario de 262.144 entradas. El repositorio contiene 5 shards safetensors en BF16 con un total declarado de 11.959.730.224 parametros segun el recuento de safetensors (la model card indica 12.484.280.320), lo que ocupa unos 24 GB de repositorio. Los idiomas declarados son japones (ja) e ingles (en) y la licencia es Gemma.

Su relevancia es fundamentalmente de investigacion: es un eslabon intermedio (paso 75 de 125) de una misma trayectoria de parametros, pensado para inferencia, evaluacion uniforme y como inicializacion de nuevos entrenamientos, no como modelo final de producto. No se ha publicado ninguna evaluacion congelada ni comparativa de benchmarks para este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Gemma4UnifiedForConditionalGeneration` (`model_type: gemma4_unified`); transformer multimodal unificado con torre de texto de 48 capas y hidden size 3.840 |
| Parametros totales | 11.959.730.224 segun safetensors del repositorio; la model card declara 12.484.280.320 |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible como dato nativo del modelo; la receta de RLVR limita entrada a 8.192 tokens, generacion a 2.048 y total a 10.240 tokens |
| Tipos de cuantizacion | No se publican cuantizaciones; los pesos se distribuyen unicamente en BF16. FP8, GPTQ, AWQ o GGUF requeririan conversion propia |
| Idiomas soportados | Japones (ja) e ingles (en) |
| Licencia | Gemma (`license: gemma`); enlace: https://ai.google.dev/gemma/docs/gemma_4_license |
| Formato de pesos | Safetensors BF16, 5 shards + `model.safetensors.index.json`; incluye config, generation config, tokenizer, processor y chat template |
| Vocabulario | 262.144 tokens |
| Precision de exportacion | BF16 |
| Tarea declarada (pipeline) | any-to-any |
| Modelo base directo | `vosldtgbj/project-llm-rlvr-v1-step-50` |
| Modelo original | `google/gemma-4-12B-it` |

## Arquitectura y entrenamiento

La estructura es la de Gemma 4 unificada: un transformer que en el modelo original integra torres de vision y audio ademas de la torre de texto, con proyecciones multimodales. En esta trayectoria de entrenamiento solo se actualizan los parametros de texto; las torres de vision y audio y los proyectores multimodales permanecen congelados. El checkpoint es el resultado de una cadena de tres etapas sobre `google/gemma-4-12B-it`: primero CPT con 20 experimentos independientes de 0,5 epoch y 10 reentrenamientos de 1,0 epoch; despues SFT v3 sobre el mejor candidato CPT (`top10-02-lora-15-1ep`, con pesos LoRA ya fusionados en la base), con runs de 0,5, 1,0 y 2,0 epoch desde puntos de partida CPT fijos; y finalmente RLVR v1 arrancando desde el SFT `L2 h2p0`.

El RLVR v1 emplea GRPO sincrono con un ritmo de aprendizaje constante de 1e-6, 30 grupos de prompt validos por paso, 16 rollouts por prompt (480 rollouts por actualizacion), temperatura 0,7, top-p 1,0, hasta 5 turnos de interaccion y limites de 8.192 tokens de entrada, 2.048 de generacion y 10.240 totales. El optimizador es Transformer Engine FusedAdam con betas 0,9/0,999, eps 1e-8, weight decay 0,1, recorte de norma de gradiente 1,0, recorte de ratio PPO entre 0,2 y 0,28, ratio de importance sampling truncado de 2,0 y penalizacion KL contra la politica de referencia de 0. Los datos de RLVR provienen del conjunto congelado SF-RLVR-Unified-v2 (30.000 tareas de dominio de proyecto sobre 104 libros blancos japoneses publicos y 7.500 tareas generales, repartidas en 15 familias verificables). Las recompensas se calculan con verificadores deterministas y, en algunos contratos, con un juez Nemotron 3 Ultra desplegado en konst154. El entrenamiento se ejecuto en 16 GPU H100 SXM, con backend de rollout vLLM configurado con tensor parallel size 2. En esta etapa el dynamic sampling esta desactivado.

## Capacidades

- Generacion de texto y razonamiento en japones e ingles, con foco en tareas de dominio documental.
- Respuesta fundamentada sobre documentos (single-document grounded) y razonamiento sobre multiples documentos.
- Manejo de conflictos entre fuentes y de conflictos temporales o de version entre documentos.
- Abtencion y aclaracion: reconocimiento de preguntas no respondibles y emision de peticiones de clarificacion o paradas controladas.
- Salidas estructuradas: generacion de JSON y otros esquemas verificables.
- Trayectorias de uso de herramientas (tool calling) de hasta 5 turnos, incluyendo recuperacion tras fallos de herramientas.
- Resistencia a inyeccion de prompts y respeto de limites de permisos en el contexto de agente.
- Capacidades generales heredadas del ajuste: seguimiento de instrucciones, codigo competitivo, matematicas abiertas, aritmetica, MCQA y razonamiento tipo ReasoningGym.
- Capacidades multimodales (imagen-texto-a-texto) presentes en la arquitectura de base, pero no entrenadas en esta trayectoria: las torres de vision y audio estan congeladas y el entrenamiento fue exclusivamente de texto.
- No dispone de modo de pensamiento explicito ni de salida de audio declarados en la informacion proporcionada.

## Casos de uso

- Evaluacion comparativa de checkpoints RLVR: al ser un punto intermedio de una trayectoria de 125 pasos, sirve para ejecutar una misma evaluacion congelada sobre los 11 puntos de control publicados y medir el efecto real de cada bloque de 25 actualizaciones.
- Inicializacion de nuevos entrenamientos: el repositorio no conserva estado de optimizador, scheduler ni shards FSDP/DTensor, por lo que es adecuado como pesos de partida para un run nuevo (por ejemplo, la continuacion RLVR Dynamic v2), pero no para reanudar el job original de forma exacta.
- Reproduccion de recetas de RLVR: sirve como referencia para validar configuraciones de GRPO sincrono con verificadores deterministas y juez externo, dado que la receta esta documentada con precision (rollouts por prompt, recortes de ratio, limites de longitud).
- Atencion sobre documentacion tecnica japonesa: consultas de QA sobre corpus de libros blancos con respuestas citadas mediante numeracion corta del propio prompt, util en entornos de documentacion normativa o tecnica.
- Auditoria de inconsistencias documentales: deteccion de conflictos de version o de fecha entre documentos, con salida estructurada que puede volcarse directamente a una base de datos o a un sistema de tickets.
- Agentes con tolerancia a fallos: pipelines que invocan herramientas y necesitan recuperarse de errores de la herramienta en un maximo de 5 turnos, con verificacion posterior por schema.
- Moderacion y rechazo seguro: escenarios donde el modelo debe abstenerse de responder o pedir aclaracion ante informacion insuficiente o peticiones fuera de permisos.
- Extraccion estructurada a escala: conversion de texto no estructurado a JSON validado por schema, con verificacion determinista de campos, en lugar de depender de un juez probabilistico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica de forma explicita que este checkpoint no dispone de una puntuacion de validacion independiente: las recompensas de rollout registradas en los logs son senales en linea sobre los datos muestreados y dependen de la dificultad de las tareas y de la politica, por lo que no sirven para clasificar checkpoints entre si. El propio autor senala que la comparacion correcta exige ejecutar la misma evaluacion congelada sobre los 11 puntos de guardado con parametros de inferencia identicos.

## Requisitos de hardware

- VRAM en BF16: aproximadamente 24 GB solo para los pesos, mas cache KV y activaciones; en la practica requiere 40 GB o mas para una ventana de contexto amplia.
- VRAM en FP8 (conversion propia): del orden de 12-13 GB para los pesos.
- VRAM en 4 bits (conversion propia, no publicada): del orden de 7-8 GB para los pesos.
- GPU recomendadas para BF16: A100 40 GB o 80 GB, H100 SXM, L40S 48 GB.
- GPU de consumo: no cabe en BF16 en una RTX 4090 de 24 GB; si podria caber con cuantizacion FP8 o de 4 bits, siempre que se genere la conversion, ya que el repositorio solo ofrece BF16.
- Opciones de despliegue: transformers (libreria declarada), vLLM (usado en el propio entrenamiento con tensor parallel size 2), TGI. Para llama.cpp u Ollama seria necesario convertir previamente a GGUF, conversion que no se distribuye en el repositorio.
- Hardware de entrenamiento de referencia: 16 GPU H100 SXM repartidas en dos nodos (hgpn117 y hgpn126).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros (safetensors) | Contexto | Rendimiento comparado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vosldtgbj/project-llm-rlvr-v1-step-75` (este) | 11.959.730.224 | No disponible; receta RLVR con 8.192/2.048/10.240 tokens | Sin evaluacion congelada publicada | Gemma | Publico en HuggingFace |
| `vosldtgbj/project-llm-rlvr-v1-step-50` (padre directo) | No disponible | No disponible | Sin evaluacion congelada publicada; 25 actualizaciones menos de RLVR | Gemma | Publico en HuggingFace |
| `vosldtgbj/project-llm-rlvr-v1-step-100` (siguiente) | No disponible | No disponible | Sin evaluacion congelada publicada; 25 actualizaciones mas de RLVR | Gemma | Publico en HuggingFace |
| `google/gemma-4-12B-it` (base original) | No disponible | No disponible | Punto de referencia de la familia; este proyecto no lo ha reentrenado | Gemma | Publico en HuggingFace |

No se dispone de comparativas con modelos de terceros de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: no se documentan analisis de sesgo en la informacion disponible. El entrenamiento se centra en corpus japoneses de libros blancos publicos, lo que puede introducir un sesgo de dominio y de registro hacia ese tipo de texto.
- Alucinacion: el modelo genera respuestas sobre documentos y puede producir contenido no fundamentado. La receta mitiga parcialmente este riesgo mediante verificadores deterministas durante el entrenamiento, pero no lo elimina en inferencia libre.
- Idiomas: solo se declaran japones e ingles. El rendimiento en castellano u otros idiomas no esta documentado; el 10% de datos generales del SFT v3 incluye contenido multilingue, pero el grueso del RLVR es japones.
- Contexto: no se especifica la ventana nativa del modelo. Los limites documentados (8.192 de entrada, 2.048 de generacion, 10.240 totales) corresponden a la configuracion de entrenamiento, no necesariamente a un limite duro de inferencia.
- Licencia: se rige por la licencia Gemma, con las restricciones de uso comercial y de redistribucion que esta impone; debe revisarse el enlace de licencia antes de cualquier despliegue en produccion.
- Estado de la trayectoria: es un punto intermedio del run v1 (paso 75 de 125). No es un modelo final y no cuenta con evaluacion congelada publicada, por lo que no deberia desplegarse sin una validacion propia.
- Continuidad del entrenamiento: el repositorio no incluye estado de optimizador, scheduler, semillas ni shards de paralelismo, por lo que no permite reanudar el job original de forma exacta.
- Modalidad: pese a la etiqueta any-to-any y al pipeline image-text-to-text, las torres de vision y audio estan congeladas y el entrenamiento fue solo de texto; no hay garantia de calidad en tareas multimodal.
- Cifras divergentes: el recuento real de safetensors (11.959.730.224) no coincide con el total declarado en la model card (12.484.280.320), una discrepancia a tener en cuenta al planificar memoria.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales externas de validacion por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vosldtgbj/project-llm-rlvr-v1-step-75
- Checkpoint padre (paso 50): https://huggingface.co/vosldtgbj/project-llm-rlvr-v1-step-50
- Checkpoint siguiente (paso 100): https://huggingface.co/vosldtgbj/project-llm-rlvr-v1-step-100
- Modelo original: https://huggingface.co/google/gemma-4-12B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset SFT v3: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-sft-citation-optimized-v3
- Dataset RLVR unificado v2: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-unified-v2-37500
- Dataset RLVR de dominio v1: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-domain-v1
- Aprendizaje por refuerzo (referencia general): https://en.wikipedia.org/wiki/Reinforcement_learning
- HuggingFace: https://huggingface.co/
